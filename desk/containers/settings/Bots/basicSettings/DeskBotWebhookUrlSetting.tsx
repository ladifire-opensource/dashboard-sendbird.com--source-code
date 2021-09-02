import { FC, useCallback } from 'react';
import { useFormContext, RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { InputText, Button } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { URL_REGEX } from '@constants';
import * as deskApi from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync, useErrorToast } from '@hooks';

import { DeskBotFormMode, useBotDetailContext } from '../botDetailContext';
import { useBotWebhookLogs } from '../useBotWebhookLogs';

const WebhookUrlFieldWrapper = styled.div`
  display: flex;
  flex-direction: row;

  // webhook url input field
  div:first-child {
    flex: 1;
  }
`;

export const DeskBotWebhookUrlSetting: FC = () => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();

  const { errors, register } = useFormContext<BotFormValues>();
  const { mode, bot } = useBotDetailContext();
  const { openWebhookLogs } = useBotWebhookLogs();

  const [{ error: checkWebhookLogsError, status: checkWebhookLogsStatus }, checkWebhookLogs] = useAsync(
    (id: number) => deskApi.updateDeskBot(pid, region, { id, payload: { isUnreadError: false } }),
    [pid, region],
  );
  useErrorToast(checkWebhookLogsError);

  const handleWebhookLogsButtonClick = useCallback(() => {
    if (bot) {
      if (bot.isUnreadError) {
        checkWebhookLogs(bot.id);
      }
      openWebhookLogs(bot.id);
    }
  }, [bot, checkWebhookLogs, openWebhookLogs]);

  const webhookUrlFieldValidationOptions: RegisterOptions = {
    pattern: {
      value: URL_REGEX,
      message: intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.webhookUrl.input.error.invalid' }),
    },
    validate: {
      required: (value: string) =>
        value.trim().length === 0
          ? intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.webhookUrl.input.error.required' })
          : true,
    },
  };

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.webhookUrl.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.webhookUrl.desc' })}
    >
      <WebhookUrlFieldWrapper>
        <InputText
          ref={register(webhookUrlFieldValidationOptions)}
          name="webhookUrl"
          placeholder={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.webhookUrl.input.ph' })}
          error={{
            hasError: !!errors.webhookUrl,
            message: errors.webhookUrl?.message?.toString() ?? '',
          }}
        />
        {mode === DeskBotFormMode.EDIT && (
          <Button
            buttonType="tertiary"
            icon="call-logs"
            disabled={checkWebhookLogsStatus === 'loading'}
            css={css`
              margin-left: 8px;
            `}
            onClick={handleWebhookLogsButtonClick}
          >
            {intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.webhookUrl.button.webhookLogs' })}
          </Button>
        )}
      </WebhookUrlFieldWrapper>
    </SettingsGridCard>
  );
};
