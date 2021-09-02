import { FC, useMemo } from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Icon, cssVariables, TooltipProps, IconProps, ContextualHelp } from 'feather';

import { useDimension } from '@hooks';

const StyledInputInform = styled.div<{ styles: SimpleInterpolation }>`
  display: inline-block;
  margin-left: 4px;
  vertical-align: middle;

  ${(props) => props.styles};

  svg {
    fill: ${cssVariables('neutral-6')};
  }
`;

type Props = {
  content: TooltipProps['content'];
  size?: IconProps['size'];
  styles?: SimpleInterpolation;
};

export const InputInform: FC<Props> = ({ content = '', styles = css``, size = 16 }) => {
  const dimension = useDimension();
  return useMemo(() => {
    const tooltipContentStyle = css`
      width: ${dimension.x < 768 ? '300px' : '320px'};
    `;
    return (
      <StyledInputInform styles={styles}>
        <ContextualHelp content={content} tooltipContentStyle={tooltipContentStyle} placement="top">
          <Icon icon="info" size={size} />
        </ContextualHelp>
      </StyledInputInform>
    );
  }, [content, dimension.x, size, styles]);
};
