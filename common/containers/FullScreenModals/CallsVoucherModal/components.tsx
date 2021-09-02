import { FC, ReactNode, ComponentProps } from 'react';

import styled, { SimpleInterpolation, css } from 'styled-components';

import { cssVariables, ContextualHelp, Subtitles, TooltipTargetIcon, Body } from 'feather';

export const Info: FC<{
  tooltip: ReactNode;
  placement?: ComponentProps<typeof ContextualHelp>['placement'];
  preventOverflow?: boolean;
  style?: SimpleInterpolation;
}> = ({ tooltip, placement, preventOverflow = true, style }) => {
  return (
    <ContextualHelp
      content={tooltip}
      placement={placement}
      popperProps={
        preventOverflow ? undefined : { modifiers: { hide: { enabled: false }, preventOverflow: { enabled: false } } }
      }
      tooltipContentStyle={css`
        ${Body['body-short-01']}
        ${style}
      `}
    >
      <TooltipTargetIcon icon="info" />
    </ContextualHelp>
  );
};

const LabelContainer = styled.div`
  ${Subtitles['subtitle-01']}
  display: flex;
  align-items: center;
  color: ${cssVariables('neutral-10')};

  div[role='tooltip'] {
    max-width: auto;
  }
`;

export const Label: FC<{
  text: ReactNode;
  tooltip?: ReactNode;
  tooltipStyle?: SimpleInterpolation;
}> = ({ text, tooltip, tooltipStyle }) => {
  return (
    <LabelContainer>
      {text}
      {tooltip && <Info tooltip={tooltip} style={tooltipStyle} />}
    </LabelContainer>
  );
};
