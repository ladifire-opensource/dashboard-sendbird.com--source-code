import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Radio } from 'feather';

import { TicketRuleConsequentType } from './constants';

type Props = {
  value: TicketRuleConsequentType;
  name: string;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const RadioGroup = styled.div`
  display: flex;
  align-items: flex-start;

  & > * + * {
    margin-left: 8px;
  }
`;

const RADIO_OPTIONS = [
  { value: TicketRuleConsequentType.GROUP, intlKey: 'desk.settings.assignmentRulesDetail.form.consequent.type.team' },
  {
    value: TicketRuleConsequentType.GROUP_WITH_BOT_AGENT,
    intlKey: 'desk.settings.assignmentRulesDetail.form.consequent.type.bot',
  },
];

export const AssignmentConsequentTypeRadioGroup = React.memo<Props>(({ value, name, disabled, onChange }) => {
  const intl = useIntl();

  return (
    <RadioGroup>
      {RADIO_OPTIONS.map((option) => (
        <Radio
          key={name}
          name={name}
          label={intl.formatMessage({ id: option.intlKey })}
          value={option.value}
          checked={value === option.value}
          disabled={disabled}
          onChange={onChange}
        />
      ))}
    </RadioGroup>
  );
});
