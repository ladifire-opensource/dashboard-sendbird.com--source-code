import { useEffect, useRef, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';

import { toast } from 'feather';
import isEmpty from 'lodash/isEmpty';
import SendBird from 'sendbird';

import { commonActions, coreActions } from '@actions';
import { useAuthentication } from '@authentication';
import { CLOUD_FRONT_URL } from '@constants';
import { useCurrentSdkUser, useTypedSelector } from '@hooks';
import { logException } from '@utils';

import { useWindowFocusSubscription } from './useWindowFocusSubscription';

export const useConnectSendbird = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const match = useRouteMatch<{ appId: string }>();
  const history = useHistory<{ applicationSummary: ApplicationSummary } | undefined>();
  const initializeSendBird = useRef(() => {});
  const { authenticated } = useAuthentication();
  const { applicationSummary } = history.location.state || {};
  const isWindowFocused = useWindowFocusSubscription();
  const { sdkUser, isFetched: isSdkUserFetched } = useCurrentSdkUser();
  const deskConnected = useTypedSelector((state) => state.desk.connected);
  const application = useTypedSelector((state) => state.applicationState.data);
  const appId = match?.params.appId;

  const isNotificationSupported = useCallback(
    (message: SendBird.UserMessage) => {
      const validNotification = 'Notification' in window && window.Notification;

      if (validNotification) {
        // sender
        const { sender } = message;
        const senderName = sender.nickname;
        const senderProfileUrl = sender.getOriginalProfileUrl();

        // FIXME: check notification message sentence
        const title = `${senderName} just mentioned you`;
        const body = message.message || '';
        const icon = senderProfileUrl || `${CLOUD_FRONT_URL}/favicon/apple-icon-180x180.png`;

        const payload = {
          title,
          body,
          icon,
          callback: () => {
            try {
              window.parent.focus();
              window.focus();
              history.push(`/${appId}/open_channels/${message.channelUrl}`);
            } catch (error) {
              logException({ error });
            }
          },
        };

        dispatch(commonActions.addDesktopNotificationsRequest(payload));
      }
    },
    [dispatch, history, appId],
  );

  useEffect(() => {
    initializeSendBird.current = () => {
      if (!window.dashboardSB || (window.dashboardSB && window.dashboardSB.getApplicationId() !== appId)) {
        window.dashboardSB = new SendBird({
          appId,
          newInstance: true,
        } as any);

        const initialChannelHandler = new window.dashboardSB.ChannelHandler();
        const connectionHandler = new window.dashboardSB.ConnectionHandler();

        initialChannelHandler.onMentionReceived = (channel, message) => {
          const isMentioned = message.mentionedUsers
            .map((user) => user.userId)
            .includes(window.dashboardSB.getCurrentUserId());

          const isNotificationNeeded = channel.isOpenChannel();
          if ((!isWindowFocused() || isNotificationNeeded) && isMentioned) {
            if (message.messageType === 'user') {
              isNotificationSupported(message);
            }
          }
        };
        connectionHandler.onReconnectStarted = () => {
          dispatch(commonActions.sbReconnectRequest());
          toast.warning({ message: intl.formatMessage({ id: 'common.reconnection.try.notification' }) });
        };
        connectionHandler.onReconnectSucceeded = () => {
          dispatch(commonActions.sbReconnectSuccess());
          toast.success({ message: intl.formatMessage({ id: 'common.reconnection.succeeded.notification' }) });
        };
        connectionHandler.onReconnectFailed = () => {
          dispatch(commonActions.sbReconnectFail());
          toast.error({ message: intl.formatMessage({ id: 'common.reconnection.failed.notification' }) });
        };
        window.dashboardSB.addChannelHandler('initialChannelHandler', initialChannelHandler);
        window.dashboardSB.addConnectionHandler('sbConnectionHandler', connectionHandler);
      }
    };
  }, [appId, isWindowFocused, isNotificationSupported, intl, dispatch]);

  useEffect(() => {
    if (authenticated) {
      dispatch(coreActions.fetchApplicationRequest({ app_id: appId ?? '', applicationSummary }));

      // initialize sendbird
      initializeSendBird.current();
    }
  }, [appId, applicationSummary, authenticated, dispatch]);

  useEffect(() => {
    const isConnectedWithSDKUser =
      typeof window.dashboardSB.currentUser?.userId === 'string' &&
      typeof sdkUser?.user_id === 'string' &&
      window.dashboardSB.currentUser.userId === sdkUser.user_id;

    const shouldConnect = isSdkUserFetched && !deskConnected && !isConnectedWithSDKUser;

    if (shouldConnect && sdkUser) {
      dispatch(
        commonActions.sbConnectRequest({
          userInformation: {
            userId: sdkUser.user_id,
            accessToken: sdkUser.access_token,
            nickname: sdkUser.nickname,
          },
        }),
      );
    }
  }, [deskConnected, dispatch, isSdkUserFetched, sdkUser]);

  useEffect(() => {
    if (!isSdkUserFetched && !isEmpty(application)) {
      dispatch(coreActions.fetchSDKUserRequest());
    }
  }, [application, dispatch, isSdkUserFetched]);
};
