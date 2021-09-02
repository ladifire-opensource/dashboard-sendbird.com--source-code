import React, { useEffect } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import { SpinnerFull } from 'feather';

import { coreActions } from '@actions';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { Unsaved, useAuthorization } from '@hooks';
import { UrlForm, WebhookToggle } from '@ui/components';

import { EventsToSend } from './eventsToSend';

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
};

export type UpdateWebhookParams = Parameters<typeof coreActions.updateWebhookInformationRequest>[0];

export const WebhooksSettings: React.FC<Props> = ({ setUnsaved }) => {
  const intl = useIntl();
  const settings = useSelector((state: RootState) => state.settings);
  const dispatch = useDispatch();

  const { isPermitted, isSelfService } = useAuthorization();
  const isEditable = isPermitted(['application.settings.all']);
  const { enabled, url, include_members, include_unread_count } = settings.webhook;

  useEffect(() => {
    dispatch(coreActions.getWebhookAllCategoriesRequest());
  }, [dispatch]);

  useEffect(() => {
    dispatch(coreActions.getWebhooksInformationRequest());
  }, [dispatch, settings.webhookAllEvents.length]);

  const dispatchUpdateRequest = (params: UpdateWebhookParams) => {
    dispatch(coreActions.updateWebhookInformationRequest(params));
  };

  const handleUrlSubmit = (url: string) => {
    dispatchUpdateRequest({ enabled, url, include_members, include_unread_count });
  };

  const handleWebhookToggleConfirm = (enabled: boolean) => {
    dispatchUpdateRequest({ enabled, url, include_members, include_unread_count });
  };

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'calls.settings.application.tab.webhooks' })}
          {isSelfService ? undefined : <WebhookToggle checked={enabled} onConfirm={handleWebhookToggleConfirm} />}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Description>
          <FormattedMessage
            id="core.settings.application.tab.webhooks.description"
            values={{
              a: (text: string) => (
                <a href="https://sendbird.com/docs/chat/v3/platform-api/guides/webhooks" target="_blank">
                  {text}
                </a>
              ),
            }}
          />
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      {settings.isFetchedWebhook ? (
        <SettingsGridGroup>
          <UrlForm
            defaultValue={settings.webhook.url}
            isLoading={settings.isFetchingWebhookInformation}
            disabled={!settings.webhook.enabled || !isEditable}
            onChange={setUnsaved}
            onSubmit={handleUrlSubmit}
          />
          <EventsToSend
            setUnsaved={setUnsaved}
            isEditable={isEditable}
            isFetchingWebhookInformation={settings.isFetchingWebhookInformation}
            webhookSetting={settings.webhook}
            webhookAllEvents={settings.webhookAllEvents}
            updateWebhookInformationRequest={dispatchUpdateRequest}
          />
        </SettingsGridGroup>
      ) : (
        <SpinnerFull />
      )}
    </AppSettingsContainer>
  );
};
