import { useIntl } from 'react-intl';

import { InputText } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { useCopy } from '@hooks';

import { useBotDetailContext } from '../botDetailContext';

export const DeskBotSecretKeyReadonly = () => {
  const intl = useIntl();
  const copyAndAlert = useCopy();
  const { bot } = useBotDetailContext();

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.secretKey.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.secretKey.desc' })}
    >
      <InputText
        value={bot?.secretKey}
        readOnly={true}
        icons={[
          {
            icon: 'copy',
            title: intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.secretKey.input.copy' }),
            onClick: () => {
              if (bot) {
                copyAndAlert(bot.secretKey, {
                  copySuccessMessage: intl.formatMessage({
                    id: 'desk.settings.bots.detail.form.basic.secretKey.input.copy.toast.success',
                  }),
                });
              }
            },
          },
        ]}
        data-test-id="BotSecretKeyInput"
      />
    </SettingsGridCard>
  );
};
