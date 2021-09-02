import { FC, useContext } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { css } from 'styled-components';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { BotMessagesKey, DeskBotType } from '@constants';

import { BotDetailContext } from '../botDetailContext';
import { useDefaultBotFormValues } from '../useDefaultBotFormValues';
import { FormattedBotMessage } from './FormattedBotMessage';

export const DeskBotHandoverMessageSetting: FC = () => {
  const intl = useIntl();
  const { queryParams } = useContext(BotDetailContext);
  const defaultValues = useDefaultBotFormValues(queryParams.botType || DeskBotType.CUSTOMIZED);

  const validationOptions: RegisterOptions = {
    required: intl.formatMessage({
      id: 'desk.settings.bots.detail.form.message.handover.input.error.required',
    }),
    maxLength: {
      value: 254,
      message: intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.handover.input.error.maxLength' }),
    },
  };

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.handover.title' })}
      description={intl.formatMessage(
        { id: 'desk.settings.bots.detail.form.message.handover.desc' },
        {
          b: (text) => (
            <b
              css={css`
                font-weight: 600;
              `}
            >
              {text}
            </b>
          ),
        },
      )}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <FormattedBotMessage
        name="handoverMessage"
        defaultValue={defaultValues.handoverMessage ?? ''}
        registerOptions={validationOptions}
        tags={[BotMessagesKey.TICKET_NAME, BotMessagesKey.CUSTOMER_NAME]}
      />
    </SettingsGridCard>
  );
};
