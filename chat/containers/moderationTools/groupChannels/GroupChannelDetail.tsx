import { FC, useCallback, useEffect, useMemo, useState, useContext, useRef, useLayoutEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import styled, { css } from 'styled-components';

import parse from 'date-fns/fp/parse';
import setHours from 'date-fns/fp/setHours';
import setMinutes from 'date-fns/fp/setMinutes';
import startOfMinute from 'date-fns/fp/startOfMinute';
import { Button, Icon, toast } from 'feather';
import { flow } from 'lodash/fp';

import { chatActions } from '@actions';
import { fetchGroupChannelsMessages } from '@chat/api/moderation';
import { UserProfilePopupContext } from '@chat/components/UserProfilePopup/UserProfilePopupContextProvider';
import { getErrorMessage } from '@epics';
import { useAppId, useCurrentSdkUser, useErrorToast, useLatestValue, useShallowEqualSelector } from '@hooks';
import { useIsNCSoft } from '@hooks/useIsNCSoft';
import { SpinnerFull } from '@ui/components';
import { ReconnectNotification } from '@ui/components/reconnectionNotification';

import { ModerationToolHeader } from '../ModerationToolHeader';
import { ChangeLayoutDropdown } from '../ModerationToolHeader/ChangeLayoutDropdown';
import { OperatorFilter } from '../ModerationToolHeader/OperatorFilter';
import { ZoomLevelPercentageValue, TextZoomButton } from '../ModerationToolHeader/TextZoomButton';
import { MT, MTBody, MTInfoSidebar, MTChat } from '../components';
import NewMessageAlert, { NewMessageAlertWrapper } from '../components/NewMessageAlert';
import { maxNewMessageCount } from '../constants';
import defineSizeCSSVariables from '../defineSizeCSSVariables';
import { useBannedUsers } from '../hooks/useBannedUsers';
import { useMutedUsers } from '../hooks/useMutedUsers';
import useSdkChannel from '../hooks/useSdkChannel';
import BaseMessageTypeConverter from '../utils/BaseMessageTypeConverter';
import { GroupChannelInfo } from './GroupChannelInfo';
import GroupChannelMessages from './GroupChannelMessages';
import MessagesContext from './MessagesContext';
import { usePreviousChatDialog } from './PreviousChatDialog/usePreviousChatDialog';
import useMembers from './hooks/useMembers';
import useMessagesStateReducer from './hooks/useMessagesStateReducer';
import usePolling from './hooks/usePolling';
import useScrollLock from './hooks/useScrollLock';

const StyledGroupChannels = styled.div`
  flex: 1;
  min-width: 0;
`;

const operatorFilterItems: OperatorFilter[] = ['all', 'operator', 'nonoperator'];

type State = {
  zoomLevel: ZoomLevelPercentageValue;
  isInformationSidebarHidden: boolean;
  operatorFilter: OperatorFilter;
};

const initialOperatorFilter = window.sessionStorage.getItem('operatorFilter');

export const useChannelAccessAuthorization = (): {
  result: 'unknown' | 'allowed' | 'blocked';
  blockReason: 'moderator' | 'allowed_channel_custom_types' | null;
} => {
  const isNCSoft = useIsNCSoft();
  const channel = useShallowEqualSelector((state) => state.groupChannels.current);
  const { sdkUser, isFetched: isSdkUserFetched } = useCurrentSdkUser();

  const authorization = useMemo(() => {
    if (!isSdkUserFetched) {
      return { result: 'unknown' as const, blockReason: null };
    }

    if (!sdkUser) {
      return { result: 'blocked' as const, blockReason: 'moderator' as const };
    }

    const channelCustomType = channel?.custom_type;

    if (
      isNCSoft &&
      channel &&
      (!channelCustomType || (channelCustomType && !sdkUser.allowed_channel_custom_types.includes(channelCustomType)))
    ) {
      return { result: 'blocked' as const, blockReason: 'allowed_channel_custom_types' as const };
    }
    return { result: 'allowed' as const, blockReason: null };
  }, [channel, isNCSoft, isSdkUserFetched, sdkUser]);

  return authorization;
};

/**
 * Count the number of new messages since when scrollLock is on.
 */
const useNewMessagesSinceScrollUp = ({
  operatorFilter,
  channelUrl,
  didScrollToBottomToRecentMessage,
}: {
  operatorFilter: OperatorFilter;
  channelUrl: string;
  didScrollToBottomToRecentMessage: boolean;
}) => {
  const appId = useAppId();
  const scrolledUpAt = useRef(-1);
  const cancelRequest = useRef<() => void>();
  const [newMessageCount, setNewMessageCount] = useState(0);

  useLayoutEffect(() => {
    if (didScrollToBottomToRecentMessage) {
      // When scrolled to the most recent message, reset scrollLockOnAt and newMessageCount.
      scrolledUpAt.current = -1;
      setNewMessageCount(0);
    } else {
      scrolledUpAt.current = Date.now();
    }
  }, [didScrollToBottomToRecentMessage]);

  const updateCount = useCallback(async () => {
    if (scrolledUpAt.current < 0) {
      return;
    }

    try {
      /**
       * FIXME: The payload can be big if there are many messages to fetch. Instead, we can cache the ID of the last
       * message fetched. For the next request, fetch the new messages after the cached message ID, adding the number of
       * the new messages to the current count.
       */
      const request = fetchGroupChannelsMessages({
        appId,
        channelUrl,
        include: true,
        nextLimit: maxNewMessageCount + 1,
        prevLimit: 0,
        operatorFilter,
        ts: scrolledUpAt.current,
      });
      cancelRequest.current = request.cancel;
      const response = await request;

      if (response == null) {
        // the request has been canceled - do nothing
        return;
      }

      const {
        data: { messages },
      } = response;
      setNewMessageCount(messages.length);
    } catch (error) {
      // do nothing
    }
  }, [appId, channelUrl, operatorFilter]);

  const cancelPendingUpdate = useCallback(() => {
    cancelRequest.current?.();
  }, []);

  return { newMessageCount, updateCount, cancelPendingUpdate };
};

const useNewMessageCountFromEventHandler = ({
  channelUrl,
  didScrollToBottomToRecentMessage,
  didUserHideNewMessageAlert,
}: {
  channelUrl: string;
  didScrollToBottomToRecentMessage: boolean;
  didUserHideNewMessageAlert: boolean;
}) => {
  const [newMessageCount, setNewMessageCount] = useState(0);
  const newMessageCountRef = useLatestValue(newMessageCount);
  const didUserHideNewMessageAlertRef = useLatestValue(didUserHideNewMessageAlert);

  useEffect(() => {
    if (didScrollToBottomToRecentMessage) {
      setNewMessageCount(0);
    }
  }, [didScrollToBottomToRecentMessage]);

  useEffect(() => {
    const channelHandler = new window.dashboardSB.ChannelHandler();

    channelHandler.onMessageReceived = (channel) => {
      if (channel.isGroupChannel() && channel.url === channelUrl) {
        if (
          !didScrollToBottomToRecentMessage &&
          !didUserHideNewMessageAlertRef.current &&
          newMessageCountRef.current <= maxNewMessageCount
        ) {
          setNewMessageCount((prevCount) => prevCount + 1);
        }
      }
    };

    const handlerId = `groupChannelHandler_${channelUrl}_newMessageCountUpdater`;
    window.dashboardSB.addChannelHandler(handlerId, channelHandler);

    return () => {
      window.dashboardSB.removeChannelHandler(handlerId);
    };
  }, [channelUrl, didScrollToBottomToRecentMessage, didUserHideNewMessageAlertRef, newMessageCountRef]);

  return newMessageCount;
};

const GroupChannelDetail: FC<{ channelUrl: string }> = ({ channelUrl }) => {
  const intl = useIntl();
  const { messageId: messageIdParam } = useParams<{ messageId?: string }>();
  const members = useMembers(channelUrl);
  const mutedMembers = useMutedUsers({ channelUrl, channelType: 'group_channels' });
  const bannedUsers = useBannedUsers({ channelUrl, channelType: 'group_channels' });
  const history = useHistory();
  const isNCSoft = useIsNCSoft();
  const appId = useAppId();
  const dispatch = useDispatch();
  const showPreviousChatDialog = usePreviousChatDialog();
  const messagesRef = useRef<HTMLDivElement>(null);

  const [{ zoomLevel, isInformationSidebarHidden, operatorFilter }, setState] = useState<State>({
    zoomLevel: 100,
    isInformationSidebarHidden: false,
    operatorFilter: (initialOperatorFilter as OperatorFilter) ?? operatorFilterItems[0],
  });

  const { channel, isFetchingChannel } = useShallowEqualSelector((state) => ({
    channel: state.groupChannels.current,
    isFetchingChannel: state.groupChannels.isFetchingChannel,
  }));

  const messageId = useMemo(() => {
    const messageId = Number(messageIdParam);
    return Number.isNaN(messageId) ? undefined : messageId;
  }, [messageIdParam]);

  const authorization = useChannelAccessAuthorization();

  useEffect(() => {
    if (authorization.result === 'blocked') {
      switch (authorization.blockReason) {
        case 'allowed_channel_custom_types':
          toast.warning({ message: intl.formatMessage({ id: 'chat.groupChannels.toast.noAccess' }) });
          break;
        case 'moderator':
          toast.warning({
            message: intl.formatMessage({ id: 'chat.moderationTool.noti.setModeratorInformationFirst' }),
          });
          break;
        default:
      }

      if (appId) {
        history.push(`/${appId}/group_channels`);
      } else {
        history.push('/');
      }
    }
  }, [appId, authorization.blockReason, authorization.result, history, intl]);

  const {
    loadSdkChannel,
    updateSdkChannel,
    status: sdkChannelLoadingStatus,
    channel: sdkChannel,
    error: sdkChannelLoadingError,
  } = useSdkChannel({
    channelUrl,
    channelType: 'group_channels',
  });

  const isLoadingSdkChannel = sdkChannelLoadingStatus === 'loading' || sdkChannelLoadingStatus === 'init';
  const canUseSdkChannel = !!sdkChannel;

  useEffect(() => {
    if (authorization.result === 'allowed') {
      loadSdkChannel();
    }
  }, [authorization.result, loadSdkChannel]);

  useEffect(() => {
    if (sdkChannelLoadingError == null) {
      return;
    }
    if (sdkChannelLoadingError.code === 400108 || sdkChannelLoadingError.code === 800220) {
      // Request failed with Current SDK user is not a member.
      // error code changed after sdk version upgraded to 3.0.144
      // preserve server error code to protect further error
      return;
    }
    toast.error({ message: getErrorMessage(sdkChannelLoadingError) });
  }, [sdkChannelLoadingError]);

  useEffect(() => {
    if (authorization.result === 'allowed') {
      // Load channel information and reset redux store.
      dispatch(chatActions.resetGroupChannelsModerationData());
      dispatch(chatActions.fetchGroupChannelRequest(channelUrl));
    }
  }, [authorization.result, channelUrl, dispatch]);

  const messagesContextValue = useMessagesStateReducer({
    channelUrl,
    operatorFilter,
  });

  const {
    actions: {
      fetchMessagesAround,
      fetchLatestMessages,
      fetchNextMessages,
      deleteMessage,
      replaceMessage,
      appendMessage,
    },
    state: { error, previousMessagesRequest, nextMessagesRequest, hasNextMessages },
  } = messagesContextValue;

  // FIXME: Better way to show errors?
  useErrorToast(error);
  useErrorToast(previousMessagesRequest.error);
  useErrorToast(nextMessagesRequest.error);

  useEffect(() => {
    if (authorization.result === 'allowed') {
      // Load initial messages.
      if (messageId) {
        fetchMessagesAround({ messageId });
      } else {
        fetchLatestMessages();
      }
    }
  }, [authorization.result, fetchLatestMessages, fetchMessagesAround, isLoadingSdkChannel, messageId]);

  const { addChangeListener, removeChangeListener } = useContext(UserProfilePopupContext);

  useEffect(() => {
    const handleUserBanStateChange = (userId: string, isBanned: boolean) => {
      bannedUsers.handleUserBanStateChange(userId, isBanned);
      members.handleMemberStateChange(userId, isBanned ? 'banned' : 'unbanned');
    };
    const handleUserMuteStateChange = (userId: string, isMuted: boolean) => {
      mutedMembers.handleUserMuteStateChange(userId, isMuted);
      members.handleMemberStateChange(userId, isMuted ? 'muted' : 'unmuted');
    };
    const handleUserDeactivated = (userId: string) => {
      members.handleMemberStateChange(userId, 'deactivated');
    };

    addChangeListener('ban', handleUserBanStateChange);
    addChangeListener('mute', handleUserMuteStateChange);
    addChangeListener('deactivate', handleUserDeactivated);

    return () => {
      removeChangeListener('ban', handleUserBanStateChange);
      removeChangeListener('mute', handleUserMuteStateChange);
      removeChangeListener('deactivate', handleUserDeactivated);
    };
  }, [addChangeListener, bannedUsers, members, mutedMembers, removeChangeListener]);

  const [didScrollUp] = useScrollLock();

  const [didUserHideNewMessageAlert, setDidUserHideNewMessageAlert] = useState(false);

  // True if the user scrolled to the bottom of the scrollable element and `messages` includes the most recent message.
  const didScrollToBottomToRecentMessage = !didScrollUp && !hasNextMessages;

  const {
    newMessageCount: newMessageCountSinceScrollLock,
    updateCount: updateNewMessageCountSinceScrollLock,
    cancelPendingUpdate: cancelPendingNewMessageCountUpdate,
  } = useNewMessagesSinceScrollUp({ operatorFilter, channelUrl, didScrollToBottomToRecentMessage });

  /**
   * If the moderator is a member of the current channel, this state will be updated
   * by JS SDK Event handlers to show the new message count.
   */
  const newMessageCountFromEventHandler = useNewMessageCountFromEventHandler({
    channelUrl,
    didScrollToBottomToRecentMessage,
    didUserHideNewMessageAlert,
  });

  /**
   * When using SDK channel, use `newMessageCountFromEventHandler` to show the new message count which will be updated
   * by JS SDK (in `useNewMessageCountFromEventHandler`). If not using SDK channel, use `newMessageCountSinceScrollLock`
   * which will be updated by Platform API (in `useNewMessagesSinceScrollLock`).
   */
  const newMessageAlertCount = sdkChannel ? newMessageCountFromEventHandler : newMessageCountSinceScrollLock;

  useEffect(() => {
    const isCurrentChannel = (channel: SendBird.GroupChannel | SendBird.OpenChannel) =>
      channel.isGroupChannel() && channel.url === channelUrl;

    const channelHandler = new window.dashboardSB.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      if (isCurrentChannel(channel)) {
        /**
         * Append the new message to the existing messages if `hasNextMessages` is false,
         * which means the existing messages contain the most recent message.
         */
        if (!hasNextMessages) {
          appendMessage(BaseMessageTypeConverter.fromSdkMessage(message));

          if (didScrollToBottomToRecentMessage && messagesRef.current) {
            // Scroll to the bottom to show the new message.
            messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight);
          }
        }
      }
    };

    channelHandler.onMessageUpdated = (channel, message) => {
      if (isCurrentChannel(channel)) {
        replaceMessage(BaseMessageTypeConverter.fromSdkMessage(message));
      }
    };

    channelHandler.onMessageDeleted = (channel, messageId) => {
      if (isCurrentChannel(channel)) {
        deleteMessage(messageId);
      }
    };

    channelHandler.onChannelChanged = (channel) => {
      if (isCurrentChannel(channel)) {
        updateSdkChannel(channel);
      }
    };

    const handlerId = `groupChannelHandler_${channelUrl}`;
    window.dashboardSB.addChannelHandler(handlerId, channelHandler);

    return () => {
      window.dashboardSB.removeChannelHandler(handlerId);
    };
  }, [
    appendMessage,
    channelUrl,
    deleteMessage,
    hasNextMessages,
    replaceMessage,
    didScrollToBottomToRecentMessage,
    updateSdkChannel,
  ]);

  const { startPolling, stopPolling } = usePolling(5, () => {
    if (didScrollToBottomToRecentMessage) {
      // Fetch new messages using Platform API every 5 seconds.
      if (nextMessagesRequest.status !== 'loading') {
        fetchNextMessages({ isAutoScrolling: true });
      }
      return;
    }

    // Do not update new message count if user has hidden the new message alert or the count reached its max value.
    if (!didUserHideNewMessageAlert && newMessageCountSinceScrollLock <= maxNewMessageCount) {
      updateNewMessageCountSinceScrollLock();
    }
  });

  useEffect(() => {
    if (didScrollToBottomToRecentMessage) {
      setDidUserHideNewMessageAlert(false);
      cancelPendingNewMessageCountUpdate();
    }
  }, [cancelPendingNewMessageCountUpdate, didScrollToBottomToRecentMessage]);

  useEffect(() => {
    if (!canUseSdkChannel) {
      startPolling();
    }
    return () => {
      stopPolling();
    };
  }, [canUseSdkChannel, startPolling, stopPolling]);

  return (
    <StyledGroupChannels
      css={
        isInformationSidebarHidden
          ? css`
              ${MTInfoSidebar} {
                display: none;
              }

              ${MTChat} {
                padding-left: 16px;
                padding-right: 16px;
              }
            `
          : undefined
      }
    >
      {channel == null ? (
        isFetchingChannel && <SpinnerFull />
      ) : (
        <MT>
          <ModerationToolHeader channel={channel}>
            {{
              operatorFilter: isNCSoft && (
                <OperatorFilter
                  operatorFilter={operatorFilter}
                  onItemSelected={(item) => {
                    if (item && channel) {
                      setState((currState) => ({ ...currState, operatorFilter: item }));
                    }
                  }}
                />
              ),
              textZoomButton: (
                <TextZoomButton
                  value={zoomLevel}
                  onChange={(value) => setState((currState) => ({ ...currState, zoomLevel: value }))}
                />
              ),
              changeLayoutButton: (
                <ChangeLayoutDropdown
                  isInformationSidebarHidden={isInformationSidebarHidden}
                  onChange={(value) => setState((currState) => ({ ...currState, isInformationSidebarHidden: value }))}
                />
              ),
              previousChatButton: isNCSoft && (
                <Button
                  buttonType="secondary"
                  variant="ghost"
                  size="small"
                  onClick={() => {
                    showPreviousChatDialog({
                      onApply: (date, hour, minute) => {
                        const dateObject = flow(
                          parse(new Date(), 'yyyy-MM-dd'),
                          setHours(hour),
                          setMinutes(minute),
                          startOfMinute,
                        )(date);

                        fetchMessagesAround({ timestamp: dateObject.valueOf() });
                      },
                    });
                  }}
                >
                  <Icon icon="timeline" color="currentColor" size={20} css="margin-right: 6px;" />
                  {intl.formatMessage({ id: 'chat.channelDetail.header.btn.previousChat' })}
                </Button>
              ),
            }}
          </ModerationToolHeader>
          <MTBody>
            {channel && (
              <>
                <GroupChannelInfo
                  channel={channel}
                  mutedMembers={mutedMembers}
                  bannedUsers={bannedUsers}
                  members={members}
                />
                <MessagesContext.Provider value={messagesContextValue}>
                  <MTChat css={defineSizeCSSVariables(zoomLevel)}>
                    <ReconnectNotification />
                    <NewMessageAlertWrapper>
                      <NewMessageAlert
                        count={newMessageAlertCount}
                        isHidden={newMessageAlertCount === 0 || didUserHideNewMessageAlert}
                        onClick={fetchLatestMessages}
                        onClose={() => setDidUserHideNewMessageAlert(true)}
                      />
                    </NewMessageAlertWrapper>
                    <GroupChannelMessages
                      ref={messagesRef}
                      key={channelUrl}
                      messageId={messageId}
                      onMessageDeleteSuccess={canUseSdkChannel ? undefined : deleteMessage}
                      onMessageEditSuccess={canUseSdkChannel ? undefined : replaceMessage}
                      channel={channel}
                      isLoadingSdkChannel={sdkChannelLoadingStatus === 'init' || sdkChannelLoadingStatus === 'loading'}
                      sdkChannel={sdkChannel}
                      didScrollToBottomToRecentMessage={didScrollToBottomToRecentMessage}
                    />
                  </MTChat>
                </MessagesContext.Provider>
              </>
            )}
          </MTBody>
        </MT>
      )}
    </StyledGroupChannels>
  );
};

export default GroupChannelDetail;
