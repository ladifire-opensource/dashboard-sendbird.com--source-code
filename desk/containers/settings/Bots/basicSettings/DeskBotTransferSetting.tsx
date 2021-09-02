import { useFormContext, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { Toggle } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { DeskBotType } from '@constants';

import { useBotDetailContext } from '../botDetailContext';
import { useDefaultBotFormValues } from '../useDefaultBotFormValues';

const TRANSFER_SETTING_ID = 'can-receive-transferred-tickets';

export const DeskBotTransferSetting = () => {
  const intl = useIntl();
  const { control } = useFormContext<BotFormValues>();
  const { queryParams } = useBotDetailContext();
  const defaultValues = useDefaultBotFormValues(queryParams.botType || DeskBotType.CUSTOMIZED);

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.transfer.title' })}
      titleId={TRANSFER_SETTING_ID}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.transfer.desc' })}
    >
      <Controller
        control={control}
        name="canReceiveTransferredTickets"
        defaultValue={defaultValues.canReceiveTransferredTickets}
        render={({ onChange, onBlur, value, name, ref }) => {
          return (
            <Toggle
              ref={ref}
              name={name}
              checked={value}
              aria-labelledby={TRANSFER_SETTING_ID}
              onChange={onChange}
              onBlur={onBlur}
            />
          );
        }}
      />
    </SettingsGridCard>
  );
};
