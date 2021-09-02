import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Field, Form, InputTextarea, Toggle, HTMLToggleElement } from 'feather';

import { SettingsGridCard, SettingsGridCardProps } from './index';

interface SettingsTextareaGridProps extends SettingsGridCardProps {
  field: Field<string, HTMLTextAreaElement>;
  toggleField?: Field<boolean, HTMLToggleElement>;
  onToggleChange?: (value: boolean) => void;
  form: Form;
  isFetching?: boolean;
  showActions?: boolean;
  saveText?: string;
  cancelText?: string;
}

type Props = SettingsTextareaGridProps;

const ToggleContainer = styled.div`
  margin-bottom: 16px;
`;

export const SettingsTextareaGrid: React.FC<Props> = ({
  field,
  form,
  isFetching,
  showActions = false,
  toggleField,
  onToggleChange,
  cancelText,
  saveText,
  ...settingsGridProps
}) => {
  const intl = useIntl();

  const handleSaveClick = useCallback((e) => form.onSubmit(e), [form]);
  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = useCallback(
    (e) => {
      e.preventDefault();
      form.onSubmit(e);
    },
    [form],
  );

  const handleToggleClick = useCallback(
    (checked: boolean) => {
      onToggleChange?.(checked);
    },
    [onToggleChange],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        form.onSubmit(e);
      }
    },
    [form],
  );

  const enabledActions = toggleField
    ? (toggleField.value && (field.updatable || showActions)) ?? false
    : field.updatable || showActions;

  return (
    <SettingsGridCard
      {...settingsGridProps}
      showActions={enabledActions}
      actions={[
        {
          key: `${field.name}-cancel`,
          label: cancelText ?? intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: form.reset,
        },
        {
          key: `${field.name}-save`,
          label: saveText ?? intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          onClick: handleSaveClick,
          isLoading: isFetching,
          disabled: isFetching || field.error.hasError,
        },
      ]}
    >
      <form onSubmit={handleFormSubmit}>
        {toggleField && (
          <ToggleContainer>
            <Toggle checked={toggleField.value} onChange={handleToggleClick} />
          </ToggleContainer>
        )}
        <InputTextarea
          data-test-id="InputTextarea"
          ref={field.ref}
          name={field.name}
          error={field.error}
          disabled={isFetching || (toggleField && !toggleField.value)}
          onChange={field.onChange}
          onKeyDown={handleKeyDown}
        />
      </form>
    </SettingsGridCard>
  );
};
