import { FC, useContext } from 'react';
import { RegisterOptions } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { BotMessagesKey, DeskBotType } from '@constants';

import { BotDetailContext } from '../botDetailContext';
import { useDefaultBotFormValues } from '../useDefaultBotFormValues';
import { FormattedBotMessage } from './FormattedBotMessage';

export const DeskBotQuestionSelectedMessageSetting: FC = () => {
  const intl = useIntl();
  const { queryParams } = useContext(BotDetailContext);
  const defaultValues = useDefaultBotFormValues(queryParams.botType || DeskBotType.CUSTOMIZED);

  const validationOptions: RegisterOptions = {
    required: intl.formatMessage({
      id: 'desk.settings.bots.detail.form.message.questionSelected.input.error.required',
    }),
    maxLength: {
      value: 254,
      message: intl.formatMessage({
        id: 'desk.settings.bots.detail.form.message.questionSelected.input.error.maxLength',
      }),
    },
  };

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.questionSelected.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.questionSelected.desc' })}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
    >
      <FormattedBotMessage
        name="questionSelectedMessage"
        defaultValue={defaultValues.questionSelectedMessage ?? ''}
        registerOptions={validationOptions}
        tags={[BotMessagesKey.TICKET_NAME, BotMessagesKey.CUSTOMER_NAME, BotMessagesKey.SELECTED_QUESTION]}
      />
    </SettingsGridCard>
  );
};
