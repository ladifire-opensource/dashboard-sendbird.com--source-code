import styled, { css } from 'styled-components';

import { cssVariables, InputText } from 'feather';

import { StyledProps } from '@ui';
import { BasicTextarea, FormAction } from '@ui/components';

const SupportPolicy = styled.a`
  font-size: 14px;
`;

const SupportInput = styled(InputText)<StyledProps>`
  height: 40px;
  color: ${cssVariables('neutral-10')};
  &:focus {
    box-shadow: none;
  }

  ${(props) =>
    props.readOnly
      ? css`
          &:focus {
            border: 1px solid ${cssVariables('neutral-3')};
          }
        `
      : ''};
`;

const SupportTextarea = styled(BasicTextarea)`
  min-height: 120px;
  color: ${cssVariables('neutral-10')};
`;

const SupportFormSet = styled.div<StyledProps>`
  position: relative;
  & + & {
    margin-top: 24px;
  }
  .Select-control {
    height: 40px;
  }
  .Select-value-label {
    color: ${cssVariables('neutral-10')} !important;
  }
  .Select-value {
    line-height: 38px;
  }
  ${(props) =>
    props.hasError
      ? css`
          ${SupportInput} {
            border: 1px solid ${cssVariables('red-5')};
          }
          ${SupportTextarea} {
            border: 1px solid ${cssVariables('red-5')};
          }
        `
      : ''};
`;

const HalfSupportFormSet = styled(SupportFormSet)`
  width: 48%;
  display: inline-block;
  vertical-align: top;
  & + & {
    margin-left: 4%;
    margin-top: 0;
  }
`;

const SupportFormError = styled.div`
  margin-top: 4px;
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 1;
  color: ${cssVariables('red-5')};
`;

const SupportFormAction = styled(FormAction)`
  margin-top: 24px;
`;

const SupportCommunity = styled.div`
  padding: 16px;
  background: ${cssVariables('neutral-1')};
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.13px;
  color: ${cssVariables('neutral-10')};
  display: flex;
  flex-direction: column;
`;

const SCTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.15px;
  margin-bottom: 8px;
`;

const SCDescription = styled.p`
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-7')};
  margin-bottom: 24px;
`;

const SCLink = styled.div`
  flex-grow: 1;
`;

const CommunityPlanGuide = styled.div`
  margin: 24px 0;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};

  p {
    margin-bottom: 8px;
  }
  & + button {
    width: 100%;
    justify-content: center;
  }
`;

export {
  SupportPolicy,
  SupportInput,
  SupportTextarea,
  SupportFormSet,
  HalfSupportFormSet,
  SupportFormError,
  SupportFormAction,
  // community section
  SupportCommunity,
  SCTitle,
  SCDescription,
  SCLink,
  CommunityPlanGuide,
};
