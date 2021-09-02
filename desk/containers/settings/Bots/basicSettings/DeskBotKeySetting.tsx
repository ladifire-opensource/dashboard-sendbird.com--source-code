import { FC } from 'react';
import { RegisterOptions, useFormContext, Validate } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { InputText } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import * as deskApi from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useCopy } from '@hooks';
import { debouncePromise } from '@utils/debouncePromise';

import { useBotDetailContext, DeskBotFormMode } from '../botDetailContext';

export const DeskBotKeySetting: FC = () => {
  const intl = useIntl();
  const copyAndAlert = useCopy();
  const { pid, region } = useProjectIdAndRegion();
  const { errors, register, trigger, getValues } = useFormContext<BotFormValues>();
  const { mode } = useBotDetailContext();

  const debounceIsBotKeyUnique = debouncePromise(async (value: string) => {
    try {
      const { data } = await deskApi.checkIsBotKeyDuplicated(pid, region, { botKey: value });
      const isValid = data.result;
      return isValid
        ? true
        : intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.error.unique' });
    } catch {
      return true;
    }
  }, 200);

  const checkKeyFieldUnique: Validate = (value: string) => {
    if (mode === DeskBotFormMode.CREATE || (mode === DeskBotFormMode.DUPLICATE && errors.key?.type !== 'allowed')) {
      return debounceIsBotKeyUnique(value);
    }
    return true;
  };

  const keyFieldValidationOptions: RegisterOptions = {
    validate: {
      maxLength: (value: string) =>
        value.trim().length > 30
          ? intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.error.maxLength' })
          : true,
      required: (value: string) =>
        value.trim().length === 0
          ? intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.error.required' })
          : true,
      allowed: (value: string) => {
        if (value.length > 1) {
          if (!value.match(/^[a-z0-9-]*$/)) {
            return intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.error.allowed' });
          }
          return true;
        }
        if (!value.match(/^[a-z0-9]/)) {
          return intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.error.startWith' });
        }
        return true;
      },
      unique: checkKeyFieldUnique,
    },
  };

  return (
    <SettingsGridCard
      title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.title' })}
      description={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.desc' })}
    >
      <InputText
        ref={register(keyFieldValidationOptions)}
        name="key"
        readOnly={mode === DeskBotFormMode.EDIT}
        placeholder={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.ph' })}
        helperText={
          mode === DeskBotFormMode.CREATE
            ? intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.desc' })
            : undefined
        }
        icons={
          mode === DeskBotFormMode.EDIT
            ? [
                {
                  icon: 'copy',
                  title: intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botKey.input.copy' }),
                  onClick: () => {
                    copyAndAlert(getValues('key'), {
                      copySuccessMessage: intl.formatMessage({
                        id: 'desk.settings.bots.detail.form.basic.botKey.input.copy.toast.success',
                      }),
                    });
                  },
                },
              ]
            : undefined
        }
        error={{
          hasError: !!errors.key,
          message: errors.key?.message?.toString() ?? '',
        }}
        onChange={() => trigger('key')}
      />
    </SettingsGridCard>
  );
};
