import { useIntl } from 'react-intl';

import { BotSettingsGroup } from './BotSettingsGroup';
import {
  DeskBotAssignmentRuleLink,
  DeskBotKeySetting,
  DeskBotNameSetting,
  DeskBotPhotoSetting,
  DeskBotSecretKeyReadonly,
  DeskBotTransferSetting,
  DeskBotWebhookUrlSetting,
} from './basicSettings';
import { DeskBotFormMode } from './botDetailContext';
import {
  DeskBotFallbackMessageSetting,
  DeskBotHandoverMessageSetting,
  DeskBotNoResultMessageSetting,
  DeskBotQuestionSelectedMessageSetting,
  DeskBotWelcomeMessageSetting,
} from './messageSettings';
import { useDeskBotFormMode } from './useDeskBotFormMode';

export const CustomizedBotSettings = () => {
  const intl = useIntl();
  const { mode } = useDeskBotFormMode();

  return (
    <>
      <BotSettingsGroup title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.title' })}>
        <DeskBotNameSetting />
        <DeskBotPhotoSetting />
        <DeskBotKeySetting />
        <DeskBotWebhookUrlSetting />
        {mode === DeskBotFormMode.EDIT && <DeskBotSecretKeyReadonly />}
        <DeskBotTransferSetting />
        {mode === DeskBotFormMode.EDIT && <DeskBotAssignmentRuleLink />}
      </BotSettingsGroup>
      <BotSettingsGroup title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.title' })}>
        <DeskBotWelcomeMessageSetting />
        <DeskBotFallbackMessageSetting />
        <DeskBotHandoverMessageSetting />
      </BotSettingsGroup>
    </>
  );
};

export const FAQBotSettings = () => {
  const intl = useIntl();
  const { mode } = useDeskBotFormMode();

  return (
    <>
      <BotSettingsGroup title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.title' })}>
        <DeskBotNameSetting />
        <DeskBotPhotoSetting />
        <DeskBotKeySetting />
        {mode === DeskBotFormMode.EDIT && <DeskBotSecretKeyReadonly />}
        <DeskBotTransferSetting />
        {mode === DeskBotFormMode.EDIT && <DeskBotAssignmentRuleLink />}
      </BotSettingsGroup>
      <BotSettingsGroup title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.message.title' })}>
        <DeskBotWelcomeMessageSetting />
        <DeskBotNoResultMessageSetting />
        <DeskBotHandoverMessageSetting />
        <DeskBotQuestionSelectedMessageSetting />
      </BotSettingsGroup>
    </>
  );
};
