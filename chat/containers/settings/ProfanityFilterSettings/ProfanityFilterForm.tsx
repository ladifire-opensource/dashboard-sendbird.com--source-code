import { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { useForm, Controller, UseFormMethods } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Button, cssVariables, Subtitles, Toggle, Typography } from 'feather';

import { SettingsGridGroup } from '@common/containers/layout';
import { useFormErrorFromFieldError } from '@desk/containers/settings/TicketTags/useFormErrorFromFieldError';
import { useLatestValue } from '@hooks';
import { ProfanityFilterTypeEnum } from '@interfaces/core/ChannelSettingsEnums';
import { UnsavedPrompt } from '@ui/components';

import { CustomChannelTypeField } from './CustomChannelTypeField';
import ExplicitWordsFormRow from './ExplicitWordsFormRow';
import { FilterMethodDropdown, FilterMethodDropdownRef } from './FilterMethodDropdown';
import RegexFormRow from './RegexFormRow';
import FormRow from './components/FormRow';
import { FormValues } from './types';

type Props = {
  hasCustomChannelTypeField: boolean;
  defaultValues?: FormValues;
  submitStatus?: 'init' | 'pending' | 'done';
  onSubmit: (data: FormValues) => void;
  onCancel?: () => void;
};

export type ProfanityFilterFormRef = { setError: UseFormMethods<FormValues>['setError'] };

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 16px 0;

  > *:not(:first-child) {
    margin-left: 8px;
  }

  button:not([type='submit']) {
    &,
    &:hover:not(:active) {
      background: white;
    }
  }
`;

const OnOffStatus = styled.div`
  ${Typography['caption-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 8px;
`;

export const ProfanityFilterForm = forwardRef<ProfanityFilterFormRef, Props>(
  ({ hasCustomChannelTypeField, submitStatus = 'init', onSubmit: onSubmitProp, onCancel, defaultValues }, ref) => {
    const formContextValues = useForm<FormValues>({ defaultValues });
    const { register, control, handleSubmit, setError, errors, clearErrors, formState, trigger } = formContextValues;
    const intl = useIntl();
    const filterMethodDropdownRef = useRef<FilterMethodDropdownRef>(null);
    const [isFilterOn, setIsFilterOn] = useState(defaultValues && defaultValues.type !== ProfanityFilterTypeEnum.none);
    const latestIsFilterOn = useLatestValue(isFilterOn);

    const shouldDisableConfigFields = !isFilterOn;

    useImperativeHandle(ref, () => ({ setError }));

    const onSubmit = async (data: FormValues) => {
      if (await trigger('type')) {
        // If filter is off, ignore the selected type.
        onSubmitProp(isFilterOn ? data : { ...data, type: ProfanityFilterTypeEnum.none });
      }
    };

    const customChannelTypeFieldError = useFormErrorFromFieldError(errors.customChannelType, (error) => {
      if (error.type === 'duplicated') {
        return intl.formatMessage({
          id: 'chat.settings.profanityFilter.form.field.customChannelType.error.duplicated',
        });
      }
      if (error.type === 'required') {
        return intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.customChannelType.error.required' });
      }
      return error.message;
    });

    return (
      <form onSubmit={handleSubmit(onSubmit)}>
        <UnsavedPrompt when={formState.isDirty && submitStatus !== 'done'} />
        <SettingsGridGroup>
          {hasCustomChannelTypeField ? (
            <FormRow
              title={intl.formatMessage({
                id: 'chat.settings.profanityFilter.form.field.customChannelType.title',
              })}
              description={intl.formatMessage({
                id: 'chat.settings.profanityFilter.form.field.customChannelType.desc',
              })}
            >
              <CustomChannelTypeField
                name="customChannelType"
                ref={register({ required: true })}
                aria-label={intl.formatMessage({
                  id: 'chat.settings.profanityFilter.form.field.customChannelType.title',
                })}
                placeholder={intl.formatMessage({
                  id: 'chat.settings.profanityFilter.form.field.customChannelType.placeholder',
                })}
                error={customChannelTypeFieldError}
                readOnly={!!defaultValues?.customChannelType}
                setFormError={(type: string | null) => {
                  if (type) {
                    setError('customChannelType', { type });
                  } else {
                    clearErrors('customChannelType');
                  }
                }}
              />
            </FormRow>
          ) : (
            <FormRow title={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.targetChannel' })}>
              <span css={Subtitles['subtitle-01']}>
                {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.targetChannel.global' })}
              </span>
            </FormRow>
          )}

          <FormRow
            title={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.isFilterOn.title' })}
            gridItemConfig={{ subject: { alignSelf: 'start' } }}
          >
            <Toggle checked={isFilterOn} onChange={(checked) => setIsFilterOn(checked)} />
            {hasCustomChannelTypeField && isFilterOn && (
              <OnOffStatus role="status">
                {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.isFilterOn.status.customType.on' })}
              </OnOffStatus>
            )}
          </FormRow>
          <FormRow
            title={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.filterMethod.title' })}
            description={intl.formatMessage({ id: 'chat.settings.profanityFilter.form.field.filterMethod.desc' })}
            gridItemConfig={{ subject: { alignSelf: 'start' } }}
            isDisabled={shouldDisableConfigFields}
          >
            <Controller
              name="type"
              control={control}
              rules={{
                validate: (value: ProfanityFilterTypeEnum) => {
                  if (latestIsFilterOn.current && (value == null || value === ProfanityFilterTypeEnum.none)) {
                    return intl.formatMessage({
                      id: 'chat.settings.profanityFilter.form.field.filterMethod.error.required',
                    });
                  }
                  return true;
                },
              }}
              defaultValue={ProfanityFilterTypeEnum.none}
              onFocus={() => {
                filterMethodDropdownRef.current?.focus();
              }}
              render={({ onChange, value }) => {
                return (
                  <FilterMethodDropdown
                    filterType={value}
                    onChange={onChange}
                    ref={filterMethodDropdownRef}
                    disabled={shouldDisableConfigFields}
                    error={errors.type?.message}
                  />
                );
              }}
            />
          </FormRow>
          <ExplicitWordsFormRow isDisabled={shouldDisableConfigFields} formContextValues={formContextValues} />
          <RegexFormRow isDisabled={shouldDisableConfigFields} formContextValues={formContextValues} />
        </SettingsGridGroup>
        <FormActions>
          <Button type="button" buttonType="tertiary" onClick={onCancel}>
            {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.btn.cancel' })}
          </Button>
          <Button
            type="submit"
            buttonType="primary"
            disabled={submitStatus === 'pending'}
            isLoading={submitStatus === 'pending'}
          >
            {intl.formatMessage({ id: 'chat.settings.profanityFilter.form.btn.submit' })}
          </Button>
        </FormActions>
      </form>
    );
  },
);
