import { useEffect, FC, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useField, useForm, InputText } from 'feather';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';

export const UrlForm: FC<{
  defaultValue?: string;
  isLoading?: boolean;
  disabled?: boolean;
  onChange?: (isUnsaved: boolean) => void;
  onSubmit: (url: string) => void;
}> = ({ defaultValue = '', isLoading, disabled, onChange, onSubmit }) => {
  const intl = useIntl();

  const form = useForm({
    onSubmit: ({ url }) => {
      onSubmit(url);
    },
  });

  const urlField = useField('url', form, {
    defaultValue,
    validate: (url) => {
      if (!url.trim()) {
        return intl.formatMessage({ id: 'core.settings.application.webhooks.endpoint.error_url.required' });
      }
      if (!url.match(/http(s)?:\/\//)) {
        return intl.formatMessage({ id: 'core.settings.application.webhooks.endpoint.error_url.mustStart' });
      }
      return '';
    },
  });

  const handleSubmit = (e: any) => {
    form.onSubmit(e);
  };

  const onChangeRef = useRef<typeof onChange>();
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current?.(urlField.updatable);
  }, [urlField.updatable]);

  const onSuccessRef = useRef<typeof form.onSuccess>();
  useEffect(() => {
    onSuccessRef.current = form.onSuccess;
  }, [form]);

  /* call form.onSuccess when defaultValue is updated to re-initilize form instance */
  useEffect(() => {
    onSuccessRef.current?.();
  }, [defaultValue]);

  return (
    <SettingsGridCard
      data-test-id="UrlForm"
      title={intl.formatMessage({ id: 'core.settings.application.webhooks.endpoint.title' })}
      titleColumns={6}
      description={<FormattedMessage id="core.settings.application.webhooks.endpoint.desc" />}
      gap={['0', '32px']}
      showActions={urlField.updatable}
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
          onClick: handleSubmit,
          isLoading,
          disabled: isLoading || disabled,
        },
      ]}
    >
      <InputText
        ref={urlField.ref}
        name={urlField.name}
        aria-label={intl.formatMessage({ id: 'core.settings.application.webhooks.endpoint.title' })}
        error={urlField.error}
        placeholder={intl.formatMessage({ id: 'core.settings.application.webhooks.endpoint.placeholder.mustStart' })}
        disabled={disabled}
        readOnly={disabled}
        onChange={urlField.onChange}
      />
    </SettingsGridCard>
  );
};
