import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Field, Form, Radio, cssVariables, Lozenge, LozengeVariant, Body } from 'feather';

import { SettingsGridCard, SettingsGridCardProps } from './index';

interface SettingsRadioType {
  label: string;
  description?: string;
  inlineTooltipContent?: string;
  value: string | number;
}

interface SettingsRadioGridProps extends SettingsGridCardProps {
  field: Field<string>;
  form: Form;
  radioItems: SettingsRadioType[];
  isFetching?: boolean;
  isEditable?: boolean;
}

type Props = SettingsRadioGridProps;

const Types = styled.ul`
  list-style: none;
`;
const Type = styled.li`
  display: flex;
  align-items: center;
  padding: 4px 0;

  &:first-child {
    padding-top: 0;
  }

  > div {
    justify-content: start;
  }

  label {
    font-weight: 500 !important;
    color: ${cssVariables('neutral-10')};
  }
`;

const Description = styled.p`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  padding-left: 28px;
  & + ${Type} {
    margin-top: 12px;
  }
`;

const InlineTooltip = styled(Lozenge)`
  margin-left: 8px;
`;

export const SettingsRadioGridDeprecated: React.FC<Props> = ({
  field,
  form,
  radioItems,
  isFetching,
  isEditable = true,
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

  const handleRadioChange = (type) => () => {
    field.updateValue(type);
  };

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
          disabled: isFetching || !isEditable,
        },
      ]}
    >
      <form onSubmit={onFormInputTriggerSubmit}>
        <Types>
          {radioItems.map(({ label, description, inlineTooltipContent, value }) => {
            const valueString = typeof value === 'number' ? value.toString() : value;
            return (
              <React.Fragment key={label}>
                <Type>
                  <Radio
                    name={field.name}
                    checked={field.value === valueString}
                    label={label}
                    disabled={(isFetching && field.value !== valueString) || !isEditable}
                    onChange={handleRadioChange(valueString)}
                  />
                  {inlineTooltipContent && (
                    <InlineTooltip color="neutral" variant={LozengeVariant.Dark}>
                      {inlineTooltipContent}
                    </InlineTooltip>
                  )}
                </Type>
                {description && <Description data-test-id="SettingsRadioDescription">{description}</Description>}
              </React.Fragment>
            );
          })}
        </Types>
      </form>
    </SettingsGridCard>
  );
};
