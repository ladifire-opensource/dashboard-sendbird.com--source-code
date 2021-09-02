import { useRef, useEffect, useCallback, useContext, useImperativeHandle, forwardRef, useState } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { toast } from 'feather';
import * as SendBird from 'sendbird';
import { UserMessage, FileMessage } from 'sendbird';

import { deskActions } from '@actions';
import { DeskMessagesMode, URL_PARSE_REGEX, TicketStatus, DeskThumbnailSizes } from '@constants';
import { ChatBubbleMenuPopperBoundariesElementContext } from '@desk/components/chatBubble/chatBubbleRenderer';
import { useMyInAppTicketMessages } from '@desk/containers/useMyInAppTicketMessages';
import { useScrollPositionRestoration, useShallowEqualSelector } from '@hooks';
import { SpinnerFull } from '@ui/components';
import { logException, PropOf } from '@utils';

import { CHAT_HEIGHTS } from '../constants';
import { ConversationContext } from '../conversationTickets/conversationContext';
import { SendBirdInput } from '../input';
import { SendBirdMessages, SendBirdMessagesRef } from '../messages';
import { TypingIndicator } from './typingIndicator';

const MessagesWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const getImageSize = (file: Blob) => {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();
    image.onload = () => {
      resolve({
        width: image.width,
        height: image.height,
      });
    };
    reader.onloadend = () => {
      if (reader.result) {
        image.src = reader.result as string;
      } else {
        reject("FileReader can't read image correctly");
      }
    };
    reader.readAsDataURL(file);
  });
};

type Props = { ticket: Ticket };

const getLastSeenAtByUser = (channel: SendBird.GroupChannel, userId: string) => {
  const readStatus = channel.getReadStatus() as Record<string, { user: SendBird.User; last_seen_at: number }>;
  return readStatus[userId]?.last_seen_at;
};

export const ChatSendBird = forwardRef<{ appendMessages: (messages: SendBirdSDKTicketMessage[]) => void }, Props>(
  ({ ticket }, ref) => {
    const dispatch = useDispatch();

    const { conversationTickets: conversationTicketsContext } = useContext(ConversationContext);
    const { updateTickets, updateTicketsAssignment } = conversationTicketsContext;

    const { typingStatus, agent, project, isConnected, isFetchingConversation } = useShallowEqualSelector((state) => ({
      typingStatus: state.conversation.typingStatus,
      agent: state.desk.agent,
      project: state.desk.project,
      isConnected: state.sendbird.isConnected,
      isFetchingConversation: state.conversation.isFetching,
    }));

    const [lastSeenByCustomerAt, setLastSeenByCustomerAt] = useState(0);

    const textRef = useRef('');
    const messagesComponent = useRef<SendBirdMessagesRef | null>(null);
    const messagesWrapperRef = useRef<HTMLDivElement>(null);
    const channelRef = useRef<SendBird.GroupChannel | null>(null);

    const markAsReadAfterRead = useCallback(() => {
      if (project.markAsReadType === 'AFTER_READ_MESSAGE') {
        dispatch(
          deskActions.markAsReadRequest({
            ticketId: ticket.id,
            onSuccess: updateTickets,
          }),
        );
        channelRef.current?.markAsRead();
      }
    }, [dispatch, project.markAsReadType, ticket.id, updateTickets]);

    const markAsReadAfterSend = (
      channel: SendBird.GroupChannel,
      message: SendBird.UserMessage | SendBird.FileMessage,
    ) => {
      if (project.markAsReadType === 'AFTER_SEND_MESSAGE') {
        dispatch(
          deskActions.markAsReadRequest({
            ticketId: ticket.id,
            onSuccess: updateTickets,
          }),
        );
        channel.markAsRead();
        channel.lastMessage = message;
      }
    };

    const [
      { isFetching, messages, initialOrNextFetchedTimestamp },
      { setGroupChannel, appendMessages, updateMessage, loadPreviousMessages },
    ] = useMyInAppTicketMessages(ticket, {
      usePlatformAPI: true,
      onLoad: () => {
        markAsReadAfterRead();
      },
    });

    useImperativeHandle(ref, () => ({ appendMessages }), [appendMessages]);

    const setFirstMessageNode = useScrollPositionRestoration({
      messageCount: messages.length,
      scrollTo: useCallback((y) => {
        if (messagesComponent.current) {
          messagesComponent.current.scrollTo(y);
        }
      }, []),
    });

    const setTextRef = (newText) => {
      textRef.current = newText;
    };

    const updateChannel = useCallback(
      (channel: SendBird.GroupChannel | undefined) => {
        setGroupChannel(channel);
        channelRef.current = channel || null;
      },
      [setGroupChannel],
    );

    const initializeSendBird = useCallback(() => {
      window.dashboardSB.GroupChannel.getChannel(ticket.channelUrl, (activeChannel, error) => {
        if (error) {
          logException({ error });
          return;
        }

        updateChannel(activeChannel);
        setLastSeenByCustomerAt(getLastSeenAtByUser(activeChannel, ticket.customer.sendbirdId) || 0);

        const channelHandler = new window.dashboardSB.ChannelHandler();

        channelHandler.onMessageReceived = (incomingChannel: SendBird.BaseChannel, message) => {
          if (incomingChannel.isGroupChannel() && incomingChannel.url === ticket.channelUrl) {
            appendMessages([message]);
            markAsReadAfterRead();
          }
        };

        channelHandler.onMessageUpdated = (incomingChannel: SendBird.BaseChannel, message) => {
          if (incomingChannel.isGroupChannel() && incomingChannel.url === ticket.channelUrl) {
            updateMessage(message);
          }
        };

        channelHandler.onReadReceiptUpdated = (incomingChannel: SendBird.BaseChannel) => {
          if (incomingChannel.isGroupChannel() && incomingChannel.url === ticket.channelUrl) {
            const groupChannel = incomingChannel as SendBird.GroupChannel;
            updateChannel(groupChannel);

            const lastSeenByCustomerAt = getLastSeenAtByUser(groupChannel, ticket.customer.sendbirdId);
            if (lastSeenByCustomerAt) {
              setLastSeenByCustomerAt(lastSeenByCustomerAt);
            }
          }
        };

        channelHandler.onTypingStatusUpdated = (incomingChannel: SendBird.BaseChannel) => {
          if (incomingChannel.isGroupChannel() && incomingChannel.url === ticket.channelUrl) {
            const typingMembers = (incomingChannel as SendBird.GroupChannel).getTypingMembers();
            if (typingMembers.length > 0) {
              dispatch(deskActions.setOthersTypingStatus({ othersTyping: true, typingMembers }));
            } else {
              dispatch(deskActions.setOthersTypingStatus({ othersTyping: false, typingMembers }));
            }
          }
        };

        window.dashboardSB.addChannelHandler('CONVERSATION_CHANNEL_HANDLER', channelHandler);
      });
    }, [
      ticket.channelUrl,
      ticket.customer.sendbirdId,
      updateChannel,
      appendMessages,
      markAsReadAfterRead,
      updateMessage,
      dispatch,
    ]);

    /**
     * Initializer
     */
    useEffect(() => {
      initializeSendBird();
      return () => {
        updateChannel(undefined);
        window.dashboardSB.removeChannelHandler('CONVERSATION_CHANNEL_HANDLER');
      };
    }, [initializeSendBird, ticket.channelUrl, updateChannel]);

    // SDK Typing Functions
    const typingStart = useCallback(() => {
      channelRef.current?.startTyping();
    }, [channelRef]);

    const typingEnd = useCallback(() => {
      channelRef.current?.endTyping();
    }, [channelRef]);

    const fetchMessagesPrev = () => {
      loadPreviousMessages({
        onBeforePrepend: () => {
          // Save the first message node now to restore the scroll position after the messages are added.
          setFirstMessageNode(messagesComponent.current?.findFirstMessageNode() || null);
        },
      });
    };

    const updateConversationTicketAssignment = () => {
      if (ticket.recentAssignment?.status === 'NOT_RESPONSED' || ticket.recentAssignment?.status === 'IDLE') {
        dispatch(
          deskActions.updateConversationTicketAssignmentRequest({
            assignmentId: ticket.recentAssignment.id,
            payload: {
              status: 'RESPONSED',
            },
            onSuccess: (assignment: Assignment) => {
              dispatch(deskActions.fetchConversationRequest({ ticketId: ticket.id }));
              updateTicketsAssignment({ assignment });
            },
          }),
        );
      }
    };

    const sendUserMessage = (userMessage: string) => {
      if (channelRef.current) {
        channelRef.current.sendUserMessage(userMessage, (message: UserMessage, error) => {
          if (error?.code === 90060) {
            toast.warning({ message: error.message });
            return;
          }
          typingEnd();
          appendMessages([message]);
          markAsReadAfterSend(channelRef.current as SendBird.GroupChannel, message);

          const cleanMessage = userMessage.replace(/</gi, '&lt;').replace(/>/gi, '&gt;');
          const matchedUrls = cleanMessage.match(URL_PARSE_REGEX);
          if (matchedUrls) {
            dispatch(
              deskActions.fetchURLPreviewRequest({
                url: matchedUrls[0],
                onSuccess: (payload) => {
                  const data = {
                    type: 'SENDBIRD_DESK_URL_PREVIEW',
                    body: {
                      url: payload.url,
                      site_name: payload.siteName,
                      title: payload.title,
                      description: payload.description,
                      image: payload.image,
                    },
                  };
                  channelRef.current?.updateUserMessage(
                    message.messageId,
                    userMessage,
                    JSON.stringify(data),
                    'SENDBIRD_DESK_RICH_MESSAGE',
                    (newMessage) => {
                      updateMessage(newMessage);
                    },
                  );
                },
              }),
            );
          }
        });
      }
    };

    const sendAgentMessage = (agentMessage: string) => {
      const trimmedMessage = agentMessage.trim();
      if (trimmedMessage !== '') {
        sendUserMessage(trimmedMessage);
        updateConversationTicketAssignment();
      }
    };

    const sendFileMessage: PropOf<typeof SendBirdInput, 'onFileChange'> = async (event) => {
      event.persist();
      const file = event.target.files?.[0];

      if (file && channelRef.current) {
        const params = new (window.dashboardSB.FileMessageParams as any)();
        params.file = file;
        params.thumbnailSizes = DeskThumbnailSizes;

        const imageType = /^image.*/;
        let originalImageDimension: { width: number; height: number } | null = null;

        if (file.type.match(imageType)) {
          try {
            originalImageDimension = await getImageSize(file);
          } catch (error) {
            logException({ error });
          }
        }

        if (originalImageDimension) {
          params.data = JSON.stringify({
            originalImageDimension,
          });
        }

        // Reset file input value so that `onFileChange` is triggered when a user selects the same file again after a success or failure.
        event.target.value = '';

        channelRef.current.sendFileMessage(params, (message: FileMessage, error) => {
          if (error) {
            toast.warning({ message: error.message });
            return;
          }

          appendMessages([message]);
          if (channelRef.current) {
            markAsReadAfterSend(channelRef.current, message);
            channelRef.current.lastMessage = message;
          }
          updateConversationTicketAssignment();
        });
      }
    };

    const typingStatusHandler = (text: string) => {
      if (text.length > 0 && text !== textRef.current) {
        typingStart();
      }
      if (text.length === 0 && !!textRef.current) {
        typingEnd();
      }
    };

    const handleMessageInputKeyUp: PropOf<typeof SendBirdInput, 'onKeyUp'> = (_, text) => {
      typingStatusHandler(text);
      setTextRef(text);
    };

    const setAgentTypingStatus = useCallback(
      (isTyping: boolean) => {
        dispatch(deskActions.setAgentTypingStatus(isTyping));
      },
      [dispatch],
    );

    const handleDeleteMessage = useCallback(
      (messageId: number) => {
        const deletedMessage = (messages as SendBirdAPIMessage[]).find((message) => message.message_id === messageId);
        if (deletedMessage) {
          updateMessage({ ...deletedMessage, is_removed: true });
        }
      },
      [messages, updateMessage],
    );

    const isSendBirdTicket =
      ticket.channelType === 'SENDBIRD' ||
      ticket.channelType === 'SENDBIRD_JAVASCRIPT' ||
      ticket.channelType === 'SENDBIRD_IOS' ||
      ticket.channelType === 'SENDBIRD_ANDROID';

    const shouldShowInput =
      (ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE) &&
      ticket.recentAssignment?.agent.id === agent.id;

    return (
      <ChatBubbleMenuPopperBoundariesElementContext.Provider value={messagesWrapperRef.current || undefined}>
        {isFetching && <SpinnerFull transparent={true} />}
        <MessagesWrapper ref={messagesWrapperRef} data-test-id="MessagesWrapper">
          {isSendBirdTicket && (
            <SendBirdMessages
              ref={messagesComponent}
              lastSeenByCustomerAt={lastSeenByCustomerAt}
              ticket={ticket}
              messagesMode={DeskMessagesMode.SENDBIRD}
              messages={messages}
              initialOrNextFetchedTimestamp={initialOrNextFetchedTimestamp || undefined}
              fetchMessagesPrev={fetchMessagesPrev}
              onDeleteMessage={handleDeleteMessage}
            />
          )}
        </MessagesWrapper>
        <TypingIndicator typingStatus={typingStatus} />
        {shouldShowInput && (
          <SendBirdInput
            currentTicket={ticket}
            isDisabled={!isConnected || isFetchingConversation}
            maxHeight={CHAT_HEIGHTS.INPUT_MAX_HEIGHT}
            onKeyUp={handleMessageInputKeyUp}
            onSubmit={sendAgentMessage}
            onFileChange={sendFileMessage}
            sendMessage={sendAgentMessage}
            setAgentTyping={setAgentTypingStatus}
            agentTyping={typingStatus.agentTyping}
          />
        )}
      </ChatBubbleMenuPopperBoundariesElementContext.Provider>
    );
  },
);
