import React from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { InputCheckbox } from '@ui/components/input';

type Props = {
  label: string;
  description?: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checkboxRef?: React.RefObject<HTMLInputElement>;
  className?: string;
};

const Container = styled.label`
  display: flex;
  flex-direction: row;
  padding-top: 2px;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 20px;
`;

const Text = styled.div`
  flex: 1;
  margin-left: 8px;
  margin-top: -2px;
`;

const Label = styled.div`
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 4px;
`;

const Description = styled.div`
  font-weight: 400;
  color: ${cssVariables('neutral-6')};
`;

export const SettingCheckboxSection: React.FC<Props> = ({
  label,
  description,
  checked,
  onChange,
  checkboxRef,
  className,
  disabled = false,
}) => {
  return (
    <Container className={className}>
      <InputCheckbox refHandler={checkboxRef} checked={checked} onChange={onChange} disabled={disabled} />
      <Text>
        <Label>{label}</Label>
        <Description>{description}</Description>
      </Text>
    </Container>
  );
};
