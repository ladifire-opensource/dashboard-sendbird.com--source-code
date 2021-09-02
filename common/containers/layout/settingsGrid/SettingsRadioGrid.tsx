import { MouseEventHandler, FormEvent, useState, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio, cssVariables, Body } from 'feather';
import { nanoid } from 'nanoid';

import { SettingsGridCard, SettingsGridCardProps } from './index';

type RadioValue = string | number;

interface SettingsRadioType<T> {
  label: ReactNode;
  description?: ReactNode;
  value: T;
}

type Props<T extends RadioValue> = Omit<SettingsGridCardProps, 'onChange'> & {
  radioItems: SettingsRadioType<T>[];

  /**
   * name attribute for radio button elements. If undefined, it will be generated.
   */
  name?: string;

  /**
   * onSaved is called when the form is submitted. It won't be called when value is undefined.
   */
  onSave: (value: T, event: FormEvent) => void;

  /**
   * onReset is called when "Cancel" button is pressed. Reset the selectedValue in the handler.
   */
  onReset: MouseEventHandler<HTMLButtonElement>;

  /**
   * onChange is called when onChange of a radio button is triggered. Update the selectedValue in the handler.
   */
  onChange: (value: T) => void;

  /**
   * Currently selected value
   */
  selectedValue?: T;

  /**
   * Initial value. Save/Cancel button will be shown when initialValue !== selectedValue.
   */
  initialValue?: T;

  isFetching?: boolean;
  isEditable?: boolean;
};

const Options = styled.ul`
  list-style: none;
`;

const Description = styled.p<{ isDisabled?: boolean }>`
  margin-top: 4px;
  padding-left: 28px;
  color: ${(props) => (props.isDisabled ? cssVariables('neutral-5') : cssVariables('neutral-7'))};
  ${Body['body-short-01']};
`;

const Option = styled.li`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;

  & + & {
    margin-top: 8px;
  }

  &:not(:last-child) ${Description} {
    margin-bottom: 8px;
  }

  label {
    font-weight: 500 !important;
    color: ${cssVariables('neutral-10')};
  }
`;

export const SettingsRadioGrid = <T extends RadioValue = RadioValue>({
  name,
  radioItems,
  isFetching,
  isEditable = true,
  onReset,
  onSave,
  onChange,
  selectedValue,
  initialValue,
  isDisabled: isGridCardDisabled,
  ...settingsGridProps
}: Props<T>) => {
  const intl = useIntl();
  const [formId] = useState(nanoid());
  const [radioName] = useState(name || nanoid());

  return (
    <SettingsGridCard
      isDisabled={isGridCardDisabled}
      {...settingsGridProps}
      showActions={initialValue !== selectedValue}
      actions={[
        {
          key: 'cancel',
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: onReset,
        },
        {
          key: 'save',
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          type: 'submit',
          isLoading: isFetching,
          disabled: isFetching || !isEditable,
          form: formId,
        },
      ]}
    >
      <form
        id={formId}
        onSubmit={(event) => {
          event.preventDefault();
          if (!selectedValue) {
            return;
          }
          onSave(selectedValue, event);
        }}
      >
        <Options>
          {radioItems.map(({ label, description, value }) => {
            const isSelected = selectedValue === value;
            const descriptionId = `${formId}-${value}-description`;
            return (
              <Option key={String(value)}>
                <Radio
                  name={radioName}
                  checked={isSelected}
                  label={label}
                  aria-describedby={descriptionId}
                  disabled={isGridCardDisabled || (isFetching && !isSelected) || !isEditable}
                  onChange={() => {
                    onChange(value);
                  }}
                />
                {description && (
                  <Description
                    id={descriptionId}
                    isDisabled={isGridCardDisabled}
                    data-test-id="SettingsRadioDescription"
                  >
                    {description}
                  </Description>
                )}
              </Option>
            );
          })}
        </Options>
      </form>
    </SettingsGridCard>
  );
};
