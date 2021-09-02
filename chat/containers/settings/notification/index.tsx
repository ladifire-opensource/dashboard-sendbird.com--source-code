import { useCallback, FC } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';

import styled, { css } from 'styled-components';

import { Toggle, Link, LinkVariant, InlineNotification } from 'feather';

import { commonActions, coreActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard, SettingsGridGroup } from '@common/containers/layout';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { useAuthorization, useIsCallsEnabled, useShallowEqualSelector } from '@hooks';

import { ChannelUnreadCountSetting } from './ChannelUnreadCountSetting';
import { PushNotificationServices } from './PushNotificationServices';
import { PushNotificationTemplates } from './PushNotificationTemplates';
import { MultiDevicePush } from './multiDevicePush';

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  togglePushEnabledRequest: coreActions.togglePushEnabledRequest,

  // templates
  fetchPushMessageTemplatesRequest: coreActions.fetchPushMessageTemplatesRequest,
  updatePushMessageTemplatesRequest: coreActions.updatePushMessageTemplatesRequest,
};

type Props = typeof mapDispatchToProps;

const ToggleWrapper = styled.div`
  font-size: 0;
  margin-left: 16px;
`;

export const NotificationSettingsConnectable: FC<Props> = ({
  showDialogsRequest,
  togglePushEnabledRequest,
  fetchPushMessageTemplatesRequest,
  updatePushMessageTemplatesRequest,
}) => {
  const intl = useIntl();

  const settings = useShallowEqualSelector((state) => state.settings);
  const application = useShallowEqualSelector((state) => state.applicationState.data);

  const { isPermitted } = useAuthorization();
  const isEditable = isPermitted(['application.settings.all']);
  const isPushEnabled = application?.push_enabled ?? false;
  const isCallsEnabled = useIsCallsEnabled();

  const onToggleChange = useCallback(() => {
    showDialogsRequest({
      dialogTypes: DialogType.Confirm,
      dialogProps: isPushEnabled
        ? {
            title: intl.formatMessage({ id: 'chat.settings.notifications.dialog.push_title.turnOff' }),
            description: intl.formatMessage({ id: 'chat.settings.notifications.dialog.push_desc.turnOff' }),
            confirmText: intl.formatMessage({ id: 'chat.settings.notifications.dialog.push_button_off' }),
            onConfirm: () => togglePushEnabledRequest(false),
          }
        : {
            title: intl.formatMessage({ id: 'chat.settings.notifications.dialog.push_title.turnOn' }),
            description: intl.formatMessage({ id: 'chat.settings.notifications.dialog.push_desc.turnOn' }),
            confirmText: intl.formatMessage({ id: 'chat.settings.notifications.dialog.push_button_on' }),
            onConfirm: () => togglePushEnabledRequest(true),
          },
    });
  }, [intl, isPushEnabled, showDialogsRequest, togglePushEnabledRequest]);

  if (!application) {
    return null;
  }

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader
        css={css`
          ${AppSettingPageHeader.Description} {
            margin-top: 24px;
          }
        `}
      >
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'chat.settings.notifications.header.title' })}
          <ToggleWrapper>
            <Toggle checked={application.push_enabled} disabled={!isEditable} onChange={onToggleChange} />
          </ToggleWrapper>
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Description $textOnly={true}>
          <FormattedMessage
            id="chat.settings.notifications.header.description"
            values={{
              ios: (text) => (
                <Link
                  variant={LinkVariant.Inline}
                  href="https://sendbird.com/docs/chat/v3/ios/guides/push-notifications"
                  target="_blank"
                >
                  {text}
                </Link>
              ),
              android: (text) => (
                <Link
                  variant={LinkVariant.Inline}
                  href="https://sendbird.com/docs/chat/v3/android/guides/push-notifications"
                  target="_blank"
                >
                  {text}
                </Link>
              ),
            }}
          />
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      {isCallsEnabled && (
        <InlineNotification
          type="info"
          message={intl.formatMessage(
            { id: 'chat.settings.notifications.alerts.callsMoved' },
            {
              a: (text) => (
                <Link variant={LinkVariant.Inline} href="../calls/settings/notifications" useReactRouter={true}>
                  {text}
                </Link>
              ),
            },
          )}
          css="margin-bottom: 24px;"
        />
      )}
      <MultiDevicePush application={application} />
      <ChannelUnreadCountSetting disabled={!application.push_enabled} />
      <SettingsGridGroup>
        <SettingsGridCard
          isDisabled={!application.push_enabled}
          title={intl.formatMessage({ id: 'core.settings.application.notification.push_title' })}
          titleColumns={8}
          gap={['0', '32px']}
          gridItemConfig={{
            body: {
              justifySelf: 'end',
            },
          }}
          extra={<PushNotificationServices isEditable={isEditable} />}
        />
      </SettingsGridGroup>
      <PushNotificationTemplates
        application={application}
        settings={settings}
        isEditable={isEditable}
        fetchPushMessageTemplatesRequest={fetchPushMessageTemplatesRequest}
        updatePushMessageTemplatesRequest={updatePushMessageTemplatesRequest}
      />
    </AppSettingsContainer>
  );
};

export const NotificationSettings = connect(null, mapDispatchToProps)(NotificationSettingsConnectable);
