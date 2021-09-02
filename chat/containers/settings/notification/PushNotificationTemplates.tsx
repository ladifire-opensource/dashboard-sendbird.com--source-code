import React, { useEffect, useMemo, ReactElement } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Link, LinkVariant } from 'feather';

import { coreActions } from '@actions';
import { SettingsDescription, SettingsGridGroup, SettingsGridGroupChild } from '@common/containers/layout/settingsGrid';

import { TemplateFormGridCard } from './TemplateFormGridCard';

type Props = {
  settings: SettingsState;
  application: Application;
  isEditable: boolean;

  fetchPushMessageTemplatesRequest: typeof coreActions.fetchPushMessageTemplatesRequest;
  updatePushMessageTemplatesRequest: typeof coreActions.updatePushMessageTemplatesRequest;
};

const formattedTemplateVariables = [
  'sender_name',
  'message',
  'filename',
  'channel_name',
  'file_type_friendly',
].reduce<ReactElement>(
  (result, variable, index, list) => (
    <>
      {result}
      <b key={variable}>{`{${variable}}`}</b>
      {index < list.length - 1 && ', '}
    </>
  ),
  <></>,
);

const Title = styled.h2`
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.25;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
`;

const Header = styled(SettingsGridGroupChild)`
  padding: 24px;

  &[aria-disabled='true'] * {
    color: ${cssVariables('neutral-5')};
  }
`;

const normalizePushMessageTemplate = (template: PushMessageTemplate) => {
  return typeof template === 'string' ? { title: '', body: template } : template;
};

export const PushNotificationTemplates: React.FC<Props> = ({
  settings,
  application,
  isEditable,
  fetchPushMessageTemplatesRequest,
  updatePushMessageTemplatesRequest,
}) => {
  const intl = useIntl();
  const isDisabled = !application.push_enabled;

  useEffect(() => {
    if (!settings.isPushMessageTemplatesFetched) {
      fetchPushMessageTemplatesRequest();
    }
  }, [fetchPushMessageTemplatesRequest, settings.isPushMessageTemplatesFetched]);

  const pushMessageTemplates = useMemo(() => {
    return {
      default: {
        MESG: normalizePushMessageTemplate(application.attrs.push_message_templates.default.MESG),
        FILE: normalizePushMessageTemplate(application.attrs.push_message_templates.default.FILE),
        ADMM: normalizePushMessageTemplate(application.attrs.push_message_templates.default.ADMM),
      },
      alternative: {
        MESG: normalizePushMessageTemplate(application.attrs.push_message_templates.alternative.MESG),
        FILE: normalizePushMessageTemplate(application.attrs.push_message_templates.alternative.FILE),
        ADMM: normalizePushMessageTemplate(application.attrs.push_message_templates.alternative.ADMM),
      },
    };
  }, [
    application.attrs.push_message_templates.alternative.ADMM,
    application.attrs.push_message_templates.alternative.FILE,
    application.attrs.push_message_templates.alternative.MESG,
    application.attrs.push_message_templates.default.ADMM,
    application.attrs.push_message_templates.default.FILE,
    application.attrs.push_message_templates.default.MESG,
  ]);

  return (
    <SettingsGridGroup>
      <Header aria-disabled={isDisabled}>
        <Title>{intl.formatMessage({ id: 'chat.settings.notifications.template.title' })}</Title>
        <SettingsDescription>
          <FormattedMessage
            id="chat.settings.notifications.template.desc"
            values={{
              variables: formattedTemplateVariables,
              a: (text) => (
                <Link
                  variant={LinkVariant.Inline}
                  href="https://sendbird.com/docs/chat/v3/platform-api/guides/application#2-update-a-push-notification-content-template"
                  target="_blank"
                  disabled={isDisabled}
                >
                  {text}
                </Link>
              ),
            }}
          />
        </SettingsDescription>
      </Header>
      <TemplateFormGridCard
        formId="defaultPushNotificationTemplateForm"
        title={intl.formatMessage({ id: 'chat.settings.notifications.template.default.title' })}
        description={intl.formatMessage({
          id: 'chat.settings.notifications.template.default.description',
        })}
        defaultValues={{
          textMessageTemplateTitle: pushMessageTemplates.default.MESG.title,
          textMessageTemplateBody: pushMessageTemplates.default.MESG.body,
          fileMessageTemplateTitle: pushMessageTemplates.default.FILE.title,
          fileMessageTemplateBody: pushMessageTemplates.default.FILE.body,
          adminMessageTemplateBody: pushMessageTemplates.default.ADMM.body,
        }}
        onSubmit={(
          {
            textMessageTemplateTitle,
            textMessageTemplateBody,
            fileMessageTemplateTitle,
            fileMessageTemplateBody,
            adminMessageTemplateBody,
          },
          onSuccess,
        ) =>
          updatePushMessageTemplatesRequest({
            templateName: 'default',
            payload: {
              template: {
                MESG: { title: textMessageTemplateTitle.trim(), body: textMessageTemplateBody.trim() },
                FILE: { title: fileMessageTemplateTitle.trim(), body: fileMessageTemplateBody.trim() },
                ADMM: adminMessageTemplateBody,
              },
            },
            onSuccess,
          })
        }
        disabled={isDisabled}
        readOnly={!isEditable}
        isSubmitting={settings.isFetchingPushMessageTemplates}
        getRequiredErrorMessage={(name) =>
          ({
            textMessageTemplateBody: intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.error.required',
            }),
            fileMessageTemplateBody: intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.error.required',
            }),
            adminMessageTemplateBody: intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.error.required',
            }),
          }[name])
        }
      />

      <TemplateFormGridCard
        formId="alternativePushNotificationTemplateForm"
        title={intl.formatMessage({ id: 'chat.settings.notifications.template.alternative.title' })}
        description={intl.formatMessage({
          id: 'chat.settings.notifications.template.alternative.description',
        })}
        defaultValues={{
          textMessageTemplateTitle: pushMessageTemplates.alternative.MESG.title,
          textMessageTemplateBody: pushMessageTemplates.alternative.MESG.body,
          fileMessageTemplateTitle: pushMessageTemplates.alternative.FILE.title,
          fileMessageTemplateBody: pushMessageTemplates.alternative.FILE.body,
          adminMessageTemplateBody: pushMessageTemplates.alternative.ADMM.body,
        }}
        onSubmit={(
          {
            textMessageTemplateTitle,
            textMessageTemplateBody,
            fileMessageTemplateTitle,
            fileMessageTemplateBody,
            adminMessageTemplateBody,
          },
          onSuccess,
        ) =>
          updatePushMessageTemplatesRequest({
            templateName: 'alternative',
            payload: {
              template: {
                MESG: { title: textMessageTemplateTitle.trim(), body: textMessageTemplateBody.trim() },
                FILE: { title: fileMessageTemplateTitle.trim(), body: fileMessageTemplateBody.trim() },
                ADMM: adminMessageTemplateBody,
              },
            },
            onSuccess,
          })
        }
        disabled={isDisabled}
        readOnly={!isEditable}
        isSubmitting={settings.isFetchingPushMessageTemplates}
        getRequiredErrorMessage={(name) =>
          ({
            textMessageTemplateBody: intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.error.required',
            }),
            fileMessageTemplateBody: intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.error.required',
            }),
            adminMessageTemplateBody: intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.error.required',
            }),
          }[name])
        }
      />
    </SettingsGridGroup>
  );
};
