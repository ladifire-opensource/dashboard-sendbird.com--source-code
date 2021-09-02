import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { InputText, Field, Form } from 'feather';

import { SettingsGridCard, SettingsGridCardProps } from './index';

interface SettingsInputTextGridProps extends SettingsGridCardProps {
  field: Field<string>;
  form: Form;
  isFetching?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  additionalComponents?: React.ReactNode[];
}

type Props = SettingsInputTextGridProps;

export const SettingsInputTextGrid: React.FC<Props> = ({
  field,
  form,
  isFetching,
  disabled = false,
  readOnly = false,
  additionalComponents,
  ...settingsGridProps
}) => {
  const intl = useIntl();

  const onSaveButtonClick = useCallback((e) => form.onSubmit(e), [form]);
  const onFormInputTriggerSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      form.onSubmit(e);
    },
    [form],
  );

  return (
    <SettingsGridCard
      {...settingsGridProps}
      showActions={field.updatable}
      actions={[
        {
          key: `${field.name}-cancel`,
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: form.reset,
        },
        {
          key: `${field.name}-save`,
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          onClick: onSaveButtonClick,
          isLoading: isFetching,
          disabled: isFetching || disabled,
        },
      ]}
    >
      <form onSubmit={onFormInputTriggerSubmit}>
        <InputText
          ref={field.ref}
          name={field.name}
          error={field.error}
          onChange={field.onChange}
          disabled={disabled}
          readOnly={readOnly}
          aria-label={typeof settingsGridProps.title === 'string' ? settingsGridProps.title : undefined}
        />
        {additionalComponents}
      </form>
    </SettingsGridCard>
  );
};
