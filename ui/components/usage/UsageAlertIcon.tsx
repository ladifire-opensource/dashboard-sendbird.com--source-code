import { FC, ReactNode, HTMLAttributes, ComponentProps } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, TooltipTargetIcon, ContextualHelp, ContextualHelpContent, CSSVariableKey } from 'feather';

const StyledUsageAlert = styled.div`
  .qi__tooltip {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
  }
`;
type Props = {
  color: CSSVariableKey;
  tooltip?: ReactNode;
  icon?: 'warning-filled' | 'error-filled' | 'success-filled';
  placement?: ComponentProps<typeof ContextualHelp>['placement'];
} & HTMLAttributes<HTMLDivElement>;

export const UsageAlertIcon: FC<Props> = ({ icon = 'warning-filled', color, tooltip, placement, ...props }) => {
  return (
    <StyledUsageAlert {...props}>
      <ContextualHelp
        className="qi__tooltip"
        content={<ContextualHelpContent.Body className="qi__tooltipContent">{tooltip}</ContextualHelpContent.Body>}
        placement={placement}
        tooltipContentStyle={css`
          max-width: 256px;
        `}
        disabled={!tooltip}
      >
        <TooltipTargetIcon icon={icon} size={16} color={cssVariables(color)} />
      </ContextualHelp>
    </StyledUsageAlert>
  );
};
