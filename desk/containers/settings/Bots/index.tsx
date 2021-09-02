import { FC } from 'react';
import { useIntl } from 'react-intl';

import { Button, Link } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { useShowDialog } from '@hooks/useShowDialog';

import { BotList } from './BotList';

const BOT_USER_GUIDE_LINK =
  'https://www.notion.so/sendbirddesk/User-guide-for-Bots-Teams-and-Assignment-rules-6be1ae3219f2451497b9b11a2af0e5a6';

export const Bots: FC = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const handleClickAddBotButton = () => showDialog({ dialogTypes: DialogType.CreateDeskBot });

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.bots.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Actions>
          <Button size="small" buttonType="primary" icon="plus" onClick={handleClickAddBotButton}>
            {intl.formatMessage({ id: 'desk.settings.bots.button.add' })}
          </Button>
        </AppSettingPageHeader.Actions>
        <AppSettingPageHeader.Description>
          {intl.formatMessage(
            { id: 'desk.settings.bots.desc' },
            {
              a: (text) => (
                <Link href={BOT_USER_GUIDE_LINK} target="_blank">
                  {text}
                </Link>
              ),
            },
          )}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      <BotList />
    </AppSettingsContainer>
  );
};
