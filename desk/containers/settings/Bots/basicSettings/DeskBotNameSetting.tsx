import { FC, useEffect, useRef } from 'react';
import { RegisterOptions, useFormContext } from 'react-hook-form';
import { useIntl } from 'react-intl';

import { InputText } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';

import { DeskBotFormMode, useBotDetailContext } from '../botDetailContext';

export const DeskBotNameSetting: FC = () => {
  const intl = useIntl();

  const { mode, bot } = useBotDetailContext();
  const { formState, register, errors, watch, setValue } = useFormContext<BotFormValues>();
  const fetchedBotName = bot?.name;

  const nameFieldInputRef = useRef<HTMLInputElement>();
  const watchedBotName = watch('name');

  const nameFieldValidationOptions: RegisterOptions = {
    validate: {
      maxLength: (value: string) =>
        value.trim().length > 80
          ? intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botName.input.error.maxLength' })
          : true,
      required: (value: string) =>
        value.trim().length === 0
          ? intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botName.input.error.required' })
          : true,
    },
  };

  useEffect(() => {
    if (
      mode === DeskBotFormMode.DUPLICATE &&
      fetchedBotName &&
      fetchedBotName === watchedBotName &&
      !formState.isSubmitted
    ) {
      setValue(
        'name',
        intl.formatMessage(
          { id: 'desk.settings.bots.detail.form.basic.botName.input.value.duplicated' },
          { name: fetchedBotName },
        ),
      );
      nameFieldInputRef.current?.focus();
    }
  }, [fetchedBotName, formState.isSubmitted, intl, mode, setValue, watchedBotName]);

  return (
    <SettingsGridCard title={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botName.title' })}>
      <InputText
        ref={(element: HTMLInputElement) => {
          nameFieldInputRef.current = element;
          register(element, nameFieldValidationOptions);
        }}
        name="name"
        placeholder={intl.formatMessage({ id: 'desk.settings.bots.detail.form.basic.botName.input.ph' })}
        error={{
          hasError: !!errors.name,
          message: errors.name?.message?.toString() ?? '',
        }}
      />
    </SettingsGridCard>
  );
};
