import styled from 'styled-components';

import { cssVariables } from 'feather';

import { StyledProps } from '@ui';

const FormSet = styled.div`
  position: relative;
  & + & {
    margin-top: 16px;
  }
`;

const FormSetDivide = styled.div`
  display: flex;
  margin: 0 -8px;
  ${FormSet} {
    flex: 1;
    padding: 0 8px;
    margin: 0;
    label {
      height: 14px;
    }
  }
  & + & {
    margin-top: 10px;
  }
  + ${FormSet} {
    margin-top: 16px;
  }
`;

const FormAction = styled.div`
  margin-top: 16px;
`;

const FormSetLabel = styled.label<StyledProps>`
  display: inline-block;
  font-size: 14px;
  margin-bottom: 6px;
  color: ${cssVariables('neutral-6')};
  line-height: 1;
  ${(props) => props.styles};
`;

const SettingsFormSetLabel = styled(FormSetLabel)`
  font-size: 15px;
  margin-bottom: 8px;
  color: ${cssVariables('neutral-8')};
  font-weight: 600;
`;

const FormSetLabelDescription = styled.label<StyledProps>`
  display: block;
  font-size: 12px;
  margin-bottom: 8px;
  color: ${cssVariables('neutral-6')};
  line-height: 1;
  ${(props) => props.styles};
`;

const SettingsFormSetDescription = styled(FormSetLabelDescription)`
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
`;

const FormSetFooter = styled.div<StyledProps>`
  padding: 10px 0 0;
  ${(props) => props.styles};
`;

const InlineFormSet = styled.div`
  display: flex;
  & + & {
    margin-top: 20px;
  }
`;

const InlineFormSetLabel = styled.div<StyledProps>`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 40%;
  padding-right: 12px;
  min-width: 100px;
  font-size: 15px;
  font-weight: 500;
  color: #292855;
  display: flex;
  align-items: center;
  ${(props) => props.styles};
`;

const InlineFormSetBody = styled.div<StyledProps>`
  flex: 1;
  position: relative;
  ${(props) => props.styles};
`;

export {
  FormSet,
  FormSetDivide,
  FormAction,
  FormSetLabel,
  FormSetLabelDescription,
  FormSetFooter,
  SettingsFormSetLabel,
  SettingsFormSetDescription,
  InlineFormSet,
  InlineFormSetLabel,
  InlineFormSetBody,
};
