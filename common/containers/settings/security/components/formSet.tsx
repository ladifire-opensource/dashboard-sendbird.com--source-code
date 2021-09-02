import React from 'react';

import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  line-height: 20px;
  color: #1f232a;
  font-weight: 500;
  margin-bottom: 4px;
`;

const Description = styled.p`
  font-weight: 400;
  letter-spacing: -0.2px;
  color: #878d99;
`;

const HelperText = styled.p`
  font-size: 12px;
  line-height: 16px;
  color: #878d99;
  margin-top: 8px;
`;

type Props = {
  label: string;
  inputId: string;
  description?: string;
  helperText?: string;
  children: React.ReactNode;
};

export const FormSet: React.NamedExoticComponent<Props> = React.memo(
  ({ label, inputId, description, helperText, children }) => {
    return (
      <Container>
        <Label htmlFor={inputId}>
          <p>{label}</p>
          <Description>{description}</Description>
        </Label>
        {children}
        {helperText && <HelperText>{helperText}</HelperText>}
      </Container>
    );
  },
);
