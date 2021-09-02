import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { InputText, Field, Form } from 'feather';

import { SettingsCardProps } from '.';
import { SettingsGridCard } from '../settingsGrid';

type Props = {
  title: SettingsCardProps['title'];
  description?: SettingsCardProps['description'];
  form: Form;
  field: Field<string>;
  readOnly?: boolean;
  isFetching?: boolean;
};

export const SettingsTextInputCard: React.FC<Props> = ({
  title,
  description,
  field,
  form,
  isFetching,
  readOnly = false,
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
      title={title}
      titleColumns={4}
      description={description}
      actions={[
        {
          key: 'cancel',
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: form.reset,
        },
        {
          key: 'save',
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          onClick: onSaveButtonClick,
          isLoading: isFetching,
          disabled: isFetching,
        },
      ]}
      showActions={field.updatable}
    >
      <form onSubmit={onFormInputTriggerSubmit}>
        <InputText
          ref={field.ref}
          name={field.name}
          onChange={field.onChange}
          placeholder={field.placeholder}
          disabled={isFetching}
          error={field.error}
          readOnly={readOnly}
        />
      </form>
    </SettingsGridCard>
  );
};
