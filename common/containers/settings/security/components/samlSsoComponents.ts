import styled from 'styled-components';

import { cssVariables } from 'feather';

import { SettingsCard } from '@common/containers/layout/settingsLayout/settingsCard';
import { StyledProps } from '@ui';

export const VerticalDivider = styled.div`
  display: inline-block;
  width: 1px;
  height: 16px;
  margin: 0 12px;
  background-color: ${cssVariables('neutral-3')};
  vertical-align: middle;
`;

export const TooltipWrapper = styled.div`
  display: inline-block;
  vertical-align: middle;
  margin-left: 4px;
  position: relative;
  top: -3px;
`;

export const TooltipContent = styled.div`
  width: 221px;
  text-align: left;
  font-size: 14px;
  line-height: 20px;
`;

export const FormRow = styled.div<StyledProps>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 24px;

  ${(props) => props.styles}
`;

export const FormColumn = styled.div`
  width: calc(50% - 10px);
`;

export const TopSettingsCard = styled(SettingsCard)<{ isExpanded: boolean }>`
  ${(props) => props.isExpanded && `min-height: initial !important;`}
`;

export const InputHelperText = styled.p`
  margin: 0;
  margin-top: 4px;
  font-size: 12px;
  color: ${cssVariables('neutral-6')};
`;

export const HelpCenterLinkContainer = styled.span`
  font-size: 14px;
  align-self: center;
  font-weight: 500;
`;

export const DeleteDialogBody = styled.span`
  font-size: 15px;
  line-height: 1.5;
  letter-spacing: -0.25px;
`;
