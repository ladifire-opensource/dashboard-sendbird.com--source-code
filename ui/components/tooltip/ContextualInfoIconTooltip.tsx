import React from 'react';

import styled, { css } from 'styled-components';

import { TooltipTargetIcon, TooltipProps, Tooltip, TooltipVariant } from 'feather';

const ContextualTooltipTargetIcon = styled(TooltipTargetIcon).attrs({
  icon: 'info',
})`
  margin-left: 4px;
`;

type StatsTooltipProps = Omit<TooltipProps, 'children' | 'variant'>;

export const ContextualInfoIconTooltip: React.FC<StatsTooltipProps> = ({
  placement = 'top',
  tooltipContentStyle = css`
    width: 256px;
    font-weight: 400;
  `,
  ...props
}) => {
  return (
    <Tooltip variant={TooltipVariant.Light} placement={placement} tooltipContentStyle={tooltipContentStyle} {...props}>
      <ContextualTooltipTargetIcon />
    </Tooltip>
  );
};
