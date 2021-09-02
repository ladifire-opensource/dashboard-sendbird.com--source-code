import { useIntl } from 'react-intl';

import { DeskBotType } from '@constants';

export const useDefaultBotFormValues = (botType: DeskBotType): BotFormValues => {
  const intl = useIntl();

  if (botType === DeskBotType.FAQBOT) {
    const formValues: DeskFAQBotFormValues = {
      type: DeskBotType.FAQBOT,
      name: '',
      key: '',
      profileFile: null,
      canReceiveTransferredTickets: false,
      welcomeMessage: intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.welcome.input.default' }),
      handoverMessage: intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.handover.input.default' }),
      noResultsMessage: intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.noResult.input.default' }),
      questionSelectedMessage: intl.formatMessage({
        id: 'desk.settings.bots.detail.form.message.questionSelected.input.default',
      }),
    };

    return formValues;
  }

  const formValues: DeskCustomizedBotFormValues = {
    type: DeskBotType.CUSTOMIZED,
    name: '',
    key: '',
    profileFile: null,
    webhookUrl: '',
    canReceiveTransferredTickets: false,
    welcomeMessage: intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.welcome.input.default' }),
    fallbackRetryLimit: 1,
    serverErrorMessage: intl.formatMessage({
      id: 'desk.settings.bots.detail.form.message.fallback.serverMessage.input.default',
    }),
    timeoutMessage: intl.formatMessage({
      id: 'desk.settings.bots.detail.form.message.fallback.timeoutMessage.input.default',
    }),
    timeLimitMinutes: 1,
    timeLimitSeconds: 0,
    handoverMessage: intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.handover.input.default' }),
  };

  return formValues;
};
