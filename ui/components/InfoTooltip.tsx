import { FC } from 'react';

import { css } from 'styled-components';

import { IconName, Body, TooltipTargetIcon, TooltipProps, Tooltip, TooltipVariant, IconProps } from 'feather';

export type InfoTooltipProps = Omit<TooltipProps, 'variant' | 'children'> & {
  icon?: IconName;
  iconProps?: Omit<IconProps, 'icon' | 'size'>;
};

export const InfoTooltip: FC<InfoTooltipProps> = ({ icon = 'info', iconProps, tooltipContentStyle, ...props }) => {
  return (
    <Tooltip
      variant={TooltipVariant.Light}
      tooltipContentStyle={css`
        ${Body['body-short-01']}
        max-width: 256px;
        ${tooltipContentStyle}
      `}
      {...props}
    >
      <TooltipTargetIcon icon={icon} {...iconProps} />
    </Tooltip>
  );
};
