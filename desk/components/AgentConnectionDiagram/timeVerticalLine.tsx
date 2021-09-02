import styled, { css } from 'styled-components';

import { cssVariables } from 'feather';

type Props = {
  x: number;
  y1: number;
  y2: number;
  opacity?: number;
  color?: string;
  strokeStyle?: 'solid' | 'dashed';
  strokeWidth?: number;
  testId?: string;
};

const Line = styled.line<{
  strokeStyle: 'solid' | 'dashed';
  color: string;
  opacity: number;
  strokeWidth: number;
}>`
  stroke: ${(props) => props.color};
  stroke-width: ${({ strokeWidth }) => strokeWidth};
  ${(props) =>
    props.strokeStyle === 'dashed' &&
    css`
      stroke-dasharray: 3;
    `}
  pointer-events: none;
`;

export const TimeVerticalLine = ({
  x,
  y1,
  y2,
  opacity = 1,
  color = cssVariables('neutral-10'),
  strokeStyle = 'solid',
  strokeWidth = 1,
  testId,
}: Props) => (
  <Line
    x1={x}
    y1={y1}
    x2={x}
    y2={y2}
    color={color}
    opacity={opacity}
    strokeStyle={strokeStyle}
    strokeWidth={strokeWidth}
    data-test-id={testId}
  />
);
