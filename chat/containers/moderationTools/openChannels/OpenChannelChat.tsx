import { FC, useCallback, useRef, useEffect, useState, useLayoutEffect, ChangeEvent } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { toast } from 'feather';
import * as SendBird from 'sendbird';

import { chatActions } from '@actions';
import { updateOperators, deleteMessage as deleteMessageApi } from '@chat/api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { MAX_MESSAGES_COUNT, QueueMessagesTypes } from '@constants';
import { getErrorMessage } from '@epics';
import {
  useAppId,
  useAuthorization,
  useCurrentSdkUser,
  useErrorToast,
  useIsSpotv,
  useLatestValue,
  useShallowEqualSelector,
  useShowDialog,
} from '@hooks';
import { ReconnectNotification } from '@ui/components/reconnectionNotification';
import { convertToJSONObject, PropOf, SendbirdPromiseHelper } from '@utils';

import { ChatInput } from '../ChatInput';
import { ZoomLevelPercentageValue } from '../ModerationToolHeader/TextZoomButton';
import { MTChat } from '../components';
import NewMessageAlert, { NewMessageAlertWrapper } from '../components/NewMessageAlert';
import ScrollToBottomButton from '../components/ScrollToBottomButton';
import { maxNewMessageCount } from '../constants';
import defineSizeCSSVariables from '../defineSizeCSSVariables';
import useSdkChannel from '../hooks/useSdkChannel';
import useSendMessages from '../hooks/useSendMessages';
import { BaseMessageType } from '../message/baseMessage';
import { ChannelFrozenStatusBar } from './ChannelFrozenStatusBar';
import { OpenChannelMessagesConnected } from './openChannelMessages';

// Constants
const LIST_LIMIT = 50;

const ScrollElementWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const OpenChannelChat: FC<{ channel: OpenChannel; zoomLevel: ZoomLevelPercentageValue }> = ({ channel, zoomLevel }) => {
  const { channel_url: channelUrl } = channel;

  const history = useHistory();
  const intl = useIntl();
  const appId = useAppId();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const {
    isConnected,
    isEntered,
    isFetchingMessages,
    messages,
    preservedMessages,
    scrollLock,
  } = useShallowEqualSelector((state) => ({
    isConnected: state.sendbird.isConnected,
    isEntered: state.openChannels.isEntered,
    isFetchingMessages: state.openChannels.isFetchingMessages,
    messages: state.openChannels.messages,
    preservedMessages: state.openChannels.preservedMessages,
    scrollLock: state.openChannels.scrollLock,
  }));

  const { loadSdkChannel, status: sdkOpenChannelLoadingStatus, channel: sdkOpenChannel, error } = useSdkChannel({
    channelUrl,
    channelType: 'open_channels',
  });

  useEffect(() => {
    loadSdkChannel();
  }, [loadSdkChannel]);

  useErrorToast(error);

  const { sdkUser } = useCurrentSdkUser();

  const [newMessageCount, setNewMessageCount] = useState(0);
  const [didUserHideNewMessageAlert, setDidUserHideNewMessageAlert] = useState(false);

  // Will be run after the initial messages have been rendered
  const messageQuerySuccessHandlerRef = useRef<() => void>();

  const scrollElementRef = useRef<{ scrollToBottom: () => void } | null>(null);

  const scrollLockRef = useLatestValue(scrollLock);
  const newMessageCountRef = useLatestValue(newMessageCount);

  useLayoutEffect(() => {
    if (scrollLock) {
      // User has scrolled up to previous messages
      setDidUserHideNewMessageAlert(false);
    } else {
      // User has scrolled to the bottom -> Reset newMessageCount to zero.
      setNewMessageCount(0);
    }
  }, [scrollLock]);

  useEffect(() => {
    if (messageQuerySuccessHandlerRef.current) {
      messageQuerySuccessHandlerRef.current();
      messageQuerySuccessHandlerRef.current = undefined;
    }
  }, [messages]);

  const scrollToBottom = useCallback(
    (force?: boolean) => {
      if (!scrollLock || force) {
        scrollElementRef.current?.scrollToBottom();
      }
    },
    [scrollLock],
  );

  const queueMessages = useCallback(
    ({
      newMessages,
      newPreservedMessages,
      types,
    }: {
      newMessages: any[];
      newPreservedMessages?: any[];
      types: QueueMessagesTypes;
    }) => {
      switch (types) {
        case QueueMessagesTypes.INITIAL: {
          dispatch(chatActions.updateOpenChannelsMessages({ messages: newMessages, preservedMessages: [] }));
          messageQuerySuccessHandlerRef.current = () => scrollToBottom(true);
          return;
        }
        case QueueMessagesTypes.PREV: {
          const updatedMessages = newMessages.concat(messages);
          // Up to `MAX_MESSAGES_COUNT` messages from the first.
          const refinedMessages = updatedMessages.slice(0, MAX_MESSAGES_COUNT);

          // do preserve when remains exist
          if (updatedMessages.length > MAX_MESSAGES_COUNT) {
            // Messages after the `MAX_MESSAGES_COUNT`th message. They will be loaded into the view when the user scrolls to the bottom.
            let remainsMessages = updatedMessages.slice(MAX_MESSAGES_COUNT, updatedMessages.length);

            // concat exist preservedMessages to new remainsMessages
            remainsMessages = remainsMessages.concat(preservedMessages);

            // overwrite preservedMessages as remainsMessages
            dispatch(
              chatActions.updateOpenChannelsMessages({ messages: refinedMessages, preservedMessages: remainsMessages }),
            );
            return;
          }
          dispatch(chatActions.updateOpenChannelsMessages({ messages: refinedMessages }));
          return;
        }
        case QueueMessagesTypes.NEXT: {
          // If next called, it means queue reached MAX Limit
          // So we have to slice updated messages to fit max limit (newMessages.length ~ end)
          // retrieve preserved messages already finished (newMessages include it)
          const updatedMessages = messages.concat(newMessages);
          const refinedMessages = updatedMessages.slice(newMessages.length);
          dispatch(
            chatActions.updateOpenChannelsMessages({
              messages: refinedMessages,
              preservedMessages: newPreservedMessages,
            }),
          );
          return;
        }
        case QueueMessagesTypes.SENT:
        case QueueMessagesTypes.RECEIVED: {
          if (types === QueueMessagesTypes.SENT || newMessages[0].messageType === 'admin') {
            let updatedMessages = messages.concat(preservedMessages).concat(newMessages);

            if (updatedMessages.length > MAX_MESSAGES_COUNT) {
              updatedMessages = updatedMessages.slice(updatedMessages.length - MAX_MESSAGES_COUNT);
            }

            // clear preserved and brew off old prev messages
            dispatch(chatActions.updateOpenChannelsMessages({ messages: updatedMessages, preservedMessages: [] }));
            scrollToBottom(true);
            return;
          }

          let updatedMessages = messages;
          let newPreservedMessages: any = undefined;

          if (scrollLock) {
            // if scrollLock we have to preserve incoming messages
            newPreservedMessages = preservedMessages.concat(newMessages);
          } else {
            // if preserved messages are exist, concat all current messages
            updatedMessages = messages.concat(preservedMessages.concat(newMessages));
            newPreservedMessages = [];
          }
          // slice updated messages to fit MAX COUNT
          if (updatedMessages.length > MAX_MESSAGES_COUNT) {
            updatedMessages = updatedMessages.slice(updatedMessages.length - MAX_MESSAGES_COUNT);
          }

          dispatch(
            chatActions.updateOpenChannelsMessages({
              messages: updatedMessages,
              preservedMessages: newPreservedMessages,
            }),
          );
          scrollToBottom();
          return;
        }
        default:
          return;
      }
    },
    [dispatch, messages, preservedMessages, scrollLock, scrollToBottom],
  );

  useEffect(() => {
    if (sdkOpenChannelLoadingStatus === 'fail') {
      history.goBack();
    }
  }, [history, sdkOpenChannelLoadingStatus]);

  const onInitialMessagesLoaded: SendBird.messageListCallback = useCallback(
    (messages, error) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return;
      }
      queueMessages({
        newMessages: messages.reverse(),
        types: QueueMessagesTypes.INITIAL,
      });
      scrollToBottom(true);
    },
    [queueMessages, scrollToBottom],
  );

  const onInitialMessagesLoadedRef = useLatestValue(onInitialMessagesLoaded);

  const fetchInitialMessages = useCallback(() => {
    if (!sdkOpenChannel) {
      return;
    }

    const initialMessagesQuery = sdkOpenChannel.createPreviousMessageListQuery();
    initialMessagesQuery.limit = LIST_LIMIT;
    initialMessagesQuery.reverse = true;
    initialMessagesQuery.load((messages, error) => {
      onInitialMessagesLoadedRef.current(messages, error);
    });
  }, [onInitialMessagesLoadedRef, sdkOpenChannel]);

  useEffect(() => {
    if (sdkOpenChannelLoadingStatus === 'success' && sdkOpenChannel && sdkUser) {
      // ready to enter open channel
      const enterOpenChannel = async () => {
        try {
          const isUserOperator = sdkOpenChannel.operators.some((op) => op.userId === sdkUser.user_id);

          if (!isUserOperator) {
            // add the current sdk user to the channel operators
            await updateOperators({
              appId,
              channelUrl,
              userIds: [...sdkOpenChannel.operators.map((user) => user.userId), sdkUser.user_id],
            });
          }

          await SendbirdPromiseHelper.enterOpenChannel(sdkOpenChannel);
          dispatch(chatActions.setOpenChannelsIsEntered(true));
        } catch (error) {
          toast.error({ message: getErrorMessage(error) });
          history.goBack();
        }
      };

      enterOpenChannel().then(fetchInitialMessages);
    }
  }, [
    dispatch,
    sdkOpenChannelLoadingStatus,
    sdkOpenChannel,
    sdkUser,
    fetchInitialMessages,
    appId,
    channelUrl,
    history,
  ]);

  const queueMessagesRef = useLatestValue(queueMessages);

  useEffect(() => {
    if (!isConnected || !sdkUser) {
      return;
    }

    const channelHandler = new window.dashboardSB.ChannelHandler();

    const isCurrentChannel = (channel: SendBird.BaseChannel) => channel.isOpenChannel() && channel.url === channelUrl;

    channelHandler.onMessageReceived = (channel, message) => {
      if (isCurrentChannel(channel)) {
        queueMessagesRef.current({
          newMessages: [message],
          types: QueueMessagesTypes.RECEIVED,
        });

        if (scrollLockRef.current && newMessageCountRef.current <= maxNewMessageCount) {
          setNewMessageCount((prevValue) => prevValue + 1);
        }
      }
    };
    channelHandler.onMessageUpdated = (channel, message) => {
      if (isCurrentChannel(channel)) {
        dispatch(chatActions.updateOpenChannelsMessage(message));
      }
    };
    channelHandler.onMessageDeleted = (channel, messageId) => {
      if (isCurrentChannel(channel)) {
        dispatch(chatActions.deleteOpenChannelsMessage(messageId));
      }
    };
    channelHandler.onChannelChanged = (channel) => {
      if (isCurrentChannel(channel)) {
        const newChannel = convertToJSONObject(channel);
        newChannel.channel_url = channel.url;

        // SDK OpenChannel objects have createdAt timestamps in milliseconds.
        newChannel.created_at = channel.createdAt / 1000;

        dispatch(chatActions.setCurrentOpenChannel(newChannel as OpenChannel));
      }
    };

    const handlerId = `openChannelHandler_${channelUrl}`;
    window.dashboardSB.addChannelHandler(handlerId, channelHandler);

    return () => {
      window.dashboardSB.removeChannelHandler(handlerId);
    };
  }, [channelUrl, dispatch, isConnected, newMessageCountRef, queueMessagesRef, scrollLockRef, sdkUser]);

  const fetchPrevMessages = useCallback(
    async (onSuccess: (messageCount: number) => void) => {
      // Fetch prev messages when current messages are exist at least one
      if (messages.length === 0 || !sdkOpenChannel) {
        return;
      }

      const params = new window.dashboardSB.MessageListParams();
      params.isInclusive = false;
      params.prevResultSize = LIST_LIMIT;
      params.nextResultSize = 0;
      params.reverse = false;

      try {
        const prevMessages = await sdkOpenChannel.getMessagesByMessageId(messages[0].messageId, params);

        if (prevMessages.length > 0) {
          queueMessagesRef.current({ newMessages: prevMessages, types: QueueMessagesTypes.PREV });
        }

        onSuccess(messages.length);
      } catch (error) {
        // do nothing
      }
    },
    [messages, queueMessagesRef, sdkOpenChannel],
  );

  const getNextMessages = useCallback(() => {
    const preservedLength = preservedMessages.length;
    if (preservedLength > 0) {
      let newMessages;
      let remainsMessages;
      if (preservedLength >= LIST_LIMIT) {
        newMessages = preservedMessages.slice(0, LIST_LIMIT);
        remainsMessages = preservedMessages.slice(LIST_LIMIT, preservedLength);
      } else {
        newMessages = preservedMessages;
        remainsMessages = [];
      }

      queueMessages({
        newMessages,
        newPreservedMessages: remainsMessages,
        types: QueueMessagesTypes.NEXT,
      });
    }
  }, [preservedMessages, queueMessages]);

  const { sendAdminMessage, sendFileMessage, sendUserMessage } = useSendMessages();

  const sendMessage: PropOf<typeof ChatInput, 'onSubmit'> = ({ message, inputOption }) => {
    if (!isEntered || !sdkOpenChannel || !message.trim()) {
      return;
    }

    if (inputOption === 'user') {
      sendUserMessage({
        channel: sdkOpenChannel,
        message,
        onSuccess: (sentMessage) => {
          queueMessages({
            newMessages: [sentMessage],
            types: QueueMessagesTypes.SENT,
          });
        },
      });
    } else if (inputOption === 'admin') {
      sendAdminMessage({
        message,
        channelUrl,
        channelType: 'open_channels',
        onSuccess: () => {
          scrollToBottom(true);
        },
      });
    }
  };

  const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (sdkOpenChannel && file) {
      sendFileMessage({
        file,
        channel: sdkOpenChannel,
        onSuccess: (sentMessage) => {
          queueMessages({
            newMessages: [sentMessage],
            types: QueueMessagesTypes.SENT,
          });
        },
      });
    }
  };

  const editMessage = useCallback(
    (message: BaseMessageType, messageType: 'MESG' | 'ADMM') => {
      showDialog({
        dialogTypes: DialogType.EditMessage,
        dialogProps: {
          message,
          messageType,
          channelType: 'open_channels',
          channelURL: channelUrl,
        },
      });
    },
    [channelUrl, showDialog],
  );

  const isSpotv = useIsSpotv();

  const deleteMessage = useCallback(
    (messageId: number) => {
      if (isSpotv) {
        dispatch(chatActions.deleteMessageRequest({ channelType: 'open_channels', channelURL: channelUrl, messageId }));
        return;
      }
      showDialog({
        dialogTypes: DialogType.DeleteMessage,
        dialogProps: {
          multiple: false,
          messageId: String(messageId),
          channelType: 'open_channels',
          channelURL: channelUrl,
        },
      });
    },
    [channelUrl, dispatch, isSpotv, showDialog],
  );

  const deleteMessageAndMuteSender = useCallback(
    async (message: BaseMessageType) => {
      if (!message.sender || !sdkUser) {
        return;
      }

      try {
        await deleteMessageApi({
          appId,
          messageId: message.messageId,
          channelURL: channelUrl,
          channelType: 'open_channels',
        });

        try {
          await sdkOpenChannel?.muteUserWithUserId(
            message.sender.userId,
            180, // 3 minutes
            `${sdkUser.user_id} (${sdkUser.nickname})`,
          );
        } catch (error) {
          if (error.code === 800220) {
            // User already muted, ignore the error.
          } else {
            throw error;
          }
        }
        toast.success({ message: intl.formatMessage({ id: 'chat.channelDetail.message.noti.deleteAndMuteSuccess' }) });
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [appId, channelUrl, intl, sdkOpenChannel, sdkUser],
  );

  const showDataInformation = useCallback(
    (data: string) => {
      showDialog({
        dialogTypes: DialogType.ModeratorInformation,
        dialogProps: { data },
      });
    },
    [showDialog],
  );

  const { isPermitted } = useAuthorization();

  return (
    <MTChat
      css={`
        ${defineSizeCSSVariables(zoomLevel)}
      `}
    >
      {isEntered && !isFetchingMessages && (
        <>
          <ReconnectNotification />
          <ScrollElementWrapper>
            <NewMessageAlertWrapper>
              <NewMessageAlert
                count={newMessageCount}
                isHidden={newMessageCount === 0 || didUserHideNewMessageAlert}
                onClick={fetchInitialMessages}
                onClose={() => setDidUserHideNewMessageAlert(true)}
              />
            </NewMessageAlertWrapper>
            {channel.freeze && <ChannelFrozenStatusBar />}
            <OpenChannelMessagesConnected
              key="open_channel_messages"
              ref={(ref) => {
                // Workaround to avoid typescript error caused by Redux connected component
                scrollElementRef.current = { scrollToBottom: () => ref?.scrollToBottom() };
              }}
              editMessage={editMessage}
              deleteMessage={deleteMessage}
              deleteMessageAndMuteSender={deleteMessageAndMuteSender}
              showDataInformation={showDataInformation}
              fetchPrevMessages={fetchPrevMessages}
              getNextMessages={getNextMessages}
            />
            {scrollLock && <ScrollToBottomButton onClick={fetchInitialMessages} />}
          </ScrollElementWrapper>

          {isPermitted([
            'application.channels.openChannel.all',
            'application.channels.openChannel.chat',
            'application.channels.groupChannel.all',
            'application.channels.groupChannel.chat',
          ]) && (
            <ChatInput
              css={`
                margin: 16px;
                margin-top: 0;
                flex: none;
              `}
              isDisabled={!isEntered || !isConnected || !sdkOpenChannel}
              channelType="open_channels"
              sendFileMessage={handleFileInputChange}
              onSubmit={sendMessage}
            />
          )}
        </>
      )}
    </MTChat>
  );
};

export default OpenChannelChat;
