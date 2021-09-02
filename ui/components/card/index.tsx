import styled, { SimpleInterpolation } from 'styled-components';

import { cssVariables } from 'feather';

import { StyledProps } from '@ui';

type DisabledOption = {
  disabled?: boolean;
};

const CardHeader = styled.div`
  position: relative;
  padding: 24px 24px 20px;
`;

const CardHeaderTitle = styled.div<DisabledOption>`
  font-size: 18px;
  font-weight: 500;
  line-height: 1.33;
  letter-spacing: -0.3px;
  color: ${(props) => (props.disabled ? cssVariables('neutral-6') : cssVariables('neutral-10'))};
`;

const CardHeaderDescription = styled.div<DisabledOption>`
  font-size: 14px;
  margin-top: 8px;
  line-height: 1.43;
  color: ${(props) => (props.disabled ? cssVariables('neutral-6') : cssVariables('neutral-7'))};
`;

const CardBody = styled.div<StyledProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => (props.noPadding ? '0' : '24px')};

  ${CardHeader} + & {
    padding-top: 0;
  }

  ${(props) => props.styles};
`;

const CardBodyColumn = styled.div<StyledProps>`
  display: flex;
  flex-direction: column;
  padding: ${(props) => (props.noPadding ? '0' : '24px')};
  position: relative;
  ${(props) => props.styles};
`;

const CardBodyTitle = styled.div`
  background: #f4f6f9;
  height: 56px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.5px;
  color: ${cssVariables('neutral-10')};
  padding: 0 24px;
`;

const CardAction = styled.div<StyledProps>`
  display: flex;
  justify-content: flex-end;
  background: ${cssVariables('neutral-1')};
  padding: 18px 24px;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  ${(props) => (props.align ? `align-items: ${props.align};` : '')};
`;

const CardPack = styled.div`
  display: flex;
  align-items: stretch;
  margin: 0 -16px 16px;
`;

const CardPackItem = styled.div`
  flex: 1;
  margin: 16px;
  min-height: 235px;
  position: relative;
  padding: 0;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};
`;

const Card = styled.div<{ styles?: SimpleInterpolation }>`
  margin: 0 auto;
  border-radius: 4px;
  background-color: white;
  border: 1px solid ${cssVariables('neutral-3')};
  ${(props) => props.styles};
`;

export {
  Card,
  CardHeader,
  CardHeaderTitle,
  CardHeaderDescription,
  CardBody,
  CardBodyColumn,
  CardBodyTitle,
  CardAction,
  CardPack,
  CardPackItem,
};
