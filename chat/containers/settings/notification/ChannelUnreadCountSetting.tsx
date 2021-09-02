import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { toast, LinkVariant, Link } from 'feather';

import { SettingsToggleGrid } from '@common/containers/layout';
import { updatePushSettings } from '@core/api';
import { useAppId, useTypedSelector } from '@hooks';

import { usePushSettingStateUpdater } from './usePushSettingStateUpdater';

export const ChannelUnreadCountSetting: FC<{ disabled?: boolean }> = ({ disabled }) => {
  const intl = useIntl();
  const appId = useAppId();
  const includeChannelUnreadCount = useTypedSelector(
    (state) => state.applicationState.data?.attrs.push_payload.include_channel_unread_count,
  );
  const isLoading = useTypedSelector((state) => state.applicationState.data == null);
  const updatePushSettingState = usePushSettingStateUpdater();

  const confirmDialogProps = useMemo<ConfirmDialogProps>(() => {
    const updateSetting = async (newValue: boolean) => {
      const response = await updatePushSettings({
        appId,
        update: { include_channel_unread_count: newValue },
      });
      updatePushSettingState(response.data);
      toast.success({
        message: intl.formatMessage({
          id: 'chat.settings.notifications.includeChannelUnreadCount.noti.saved',
        }),
      });
    };

    if (includeChannelUnreadCount) {
      return {
        title: intl.formatMessage({
          id: 'chat.settings.notifications.includeChannelUnreadCount.confirmDialog.turnOff.title',
        }),
        description: intl.formatMessage({
          id: 'chat.settings.notifications.includeChannelUnreadCount.confirmDialog.turnOff.body',
        }),
        confirmText: intl.formatMessage({
          id: 'chat.settings.notifications.includeChannelUnreadCount.confirmDialog.turnOff.btn.confirm',
        }),
        onConfirm: async (setIsPending) => {
          setIsPending(true);
          await updateSetting(false);
        },
      };
    }
    return {
      title: intl.formatMessage({
        id: 'chat.settings.notifications.includeChannelUnreadCount.confirmDialog.turnOn.title',
      }),
      description: intl.formatMessage({
        id: 'chat.settings.notifications.includeChannelUnreadCount.confirmDialog.turnOn.body',
      }),
      confirmText: intl.formatMessage({
        id: 'chat.settings.notifications.includeChannelUnreadCount.confirmDialog.turnOn.btn.confirm',
      }),
      onConfirm: async (setIsPending) => {
        setIsPending(true);
        await updateSetting(true);
      },
    };
  }, [appId, includeChannelUnreadCount, intl, updatePushSettingState]);

  return (
    <SettingsToggleGrid
      title={intl.formatMessage({ id: 'chat.settings.notifications.includeChannelUnreadCount.title' })}
      description={intl.formatMessage(
        { id: 'chat.settings.notifications.includeChannelUnreadCount.description' },
        {
          ios: (text) => (
            <Link
              variant={LinkVariant.Inline}
              target="_blank"
              href="https://sendbird.com/docs/chat/v3/ios/guides/push-notifications#2-step-5-handle-a-notification-payload"
              disabled={disabled}
            >
              {text}
            </Link>
          ),
          android: (text) => (
            <Link
              variant={LinkVariant.Inline}
              target="_blank"
              href="https://sendbird.com/docs/chat/v3/android/guides/push-notifications#2-push-notifications-for-fcm-3-step-5-handle-an-fcm-message-payload"
              disabled={disabled}
            >
              {text}
            </Link>
          ),
          js: (text) => (
            <Link
              variant={LinkVariant.Inline}
              target="_blank"
              href="https://sendbird.com/docs/chat/v3/javascript/guides/push-notifications#2-step-3-receive-fcm-notification-messages"
              disabled={disabled}
            >
              {text}
            </Link>
          ),
        },
      )}
      isDisabled={disabled}
      gridItemConfig={{ body: { alignSelf: 'start' } }}
      confirmDialogProps={confirmDialogProps}
      isFetching={isLoading}
      checked={includeChannelUnreadCount}
    />
  );
};
