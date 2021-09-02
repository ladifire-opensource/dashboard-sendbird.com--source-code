import styled from 'styled-components';

import { cssVariables } from 'feather';

import { StyledProps } from '@ui';
import { clearfix } from '@ui/styles';

import { SettingCheckboxSection } from './checkboxSection';

const SettingSection = styled.div`
  position: relative;
  ${clearfix()};
  & + & {
    margin-top: 30px;
  }
`;

const SettingSectionLeft = styled.div`
  float: left;
  width: 82%;
`;

const SettingSectionRight = styled.div`
  float: left;
  width: 18%;
  text-align: right;
  line-height: 1;
`;

const SettingSectionHeader = styled.div<StyledProps>`
  color: ${cssVariables('neutral-10')};
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
`;

const SettingSectionDescription = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
  margin-bottom: 10px;
  line-height: 1.4;
`;

const SettingSectionDescriptionOnly = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-5')};
  margin-top: 10px;
  margin-bottom: 10px;
`;

const SettingSectionToggle = styled.div`
  position: absolute;
  top: 0;
  right: 0;
`;

const SettingSectionHalf = styled.div`
  width: 50%;
  position: relative;
`;

const SettingSectionAction = styled.div`
  display: flex;
  justify-content: flex-end;
  background: ${cssVariables('neutral-1')};
  padding: 18px 24px;
`;

// inline
const InlineSettingSection = styled.div`
  display: flex;
`;

const InlineSettingSectionLabel = styled.div<StyledProps>`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 25%;
  padding-right: 12px;
  min-width: 100px;
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
  ${(props) => props.styles};
`;

const InlineSettingSectionBody = styled.div<StyledProps>`
  flex: 1;
  position: relative;
  ${(props) => props.styles};
`;

const SettingsTable = styled.table`
  margin-top: 12px;
  thead {
    th {
      height: 30px;
      line-height: 29px;
      text-align: left;
      font-size: 13px;
    }
  }
  tbody {
    td {
      height: auto;
      line-height: 1.5;
      padding: 10px 12px;
      word-break: break-all;
    }
  }
`;

export {
  SettingSection,
  SettingSectionLeft,
  SettingSectionRight,
  SettingSectionHeader,
  SettingSectionDescription,
  SettingSectionDescriptionOnly,
  SettingSectionToggle,
  SettingSectionHalf,
  SettingSectionAction,
  InlineSettingSection,
  InlineSettingSectionLabel,
  InlineSettingSectionBody,
  SettingsTable,
  SettingCheckboxSection,
};
