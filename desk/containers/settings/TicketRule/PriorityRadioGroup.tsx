import { memo, ChangeEventHandler } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio, ErrorMessage } from 'feather';

import { TicketPriority } from '@constants';
import { PriorityBadge } from '@ui/components';

type Value = TicketPriority | null;
type Props = {
  value: Value;
  hasError: boolean;
  disabled?: boolean;
  onChange: (value: Value) => void;
};

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 8px;

  & > * + * {
    margin-top: 8px;
  }
`;

export const PriorityRadioGroup = memo<Props>(({ value, hasError, disabled, onChange }) => {
  const intl = useIntl();

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (event.currentTarget.checked) {
      onChange(event.currentTarget.value as Value);
    }
  };

  return (
    <>
      <RadioGroup>
        {[TicketPriority.URGENT, TicketPriority.HIGH, TicketPriority.MEDIUM, TicketPriority.LOW].map((priority) => (
          <Radio
            key={priority}
            name="conditional.consequent.value"
            label={<PriorityBadge priority={priority} showLabel={true} />}
            value={priority}
            checked={value === priority}
            hasError={hasError}
            disabled={disabled}
            onChange={handleChange}
          />
        ))}
      </RadioGroup>
      <ErrorMessage
        error={{
          hasError,
          message: intl.formatMessage({
            id: `desk.settings.priorityRulesDetail.form.consequent.value.error.required`,
          }), // error case for priority is only when the consequent value is removed
        }}
        fallbackErrorMessage=""
      />
    </>
  );
});
