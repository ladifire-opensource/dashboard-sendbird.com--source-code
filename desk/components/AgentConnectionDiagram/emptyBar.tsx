import React from 'react';

import styled from 'styled-components';

import { cssColors } from 'feather';

const SVGContainer = styled.svg<{ width: number; detailed: boolean }>`
  fill: transparent;
  width: ${(props) => props.width}px;

  text {
    font-size: 11px;
    line-height: ${(props) => (props.detailed ? 12 : 16)}px;
    fill: ${(props) => (props.detailed ? cssColors('neutral-10') : cssColors('neutral-6'))};
  }
`;

type EmptyBarProps = {
  children: React.ReactNode;
  className?: string;
  detailed: boolean;
  barRect: { x: number; y: number; width: number; height: number };
  viewBoxHeight: number;
  onMouseMove: React.MouseEventHandler;
};

export const EmptyBar = ({ children, className, detailed, barRect, viewBoxHeight, onMouseMove }: EmptyBarProps) => {
  const numbers = detailed ? ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00', '0:00'] : ['0', '12', '24'];

  return (
    <SVGContainer
      width={barRect.width}
      viewBox={`0 0 ${barRect.width} ${viewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      detailed={detailed}
      onMouseMove={onMouseMove}
    >
      <rect
        x={barRect.x}
        y={barRect.y}
        width="100%"
        height={barRect.height}
        fill={detailed ? undefined : cssColors('neutral-3')}
      />
      {numbers.map((text, index) => {
        let textAnchor: string | undefined;
        if (index === 0) {
          textAnchor = undefined;
        } else if (index === numbers.length - 1) {
          textAnchor = 'end';
        } else {
          textAnchor = 'middle';
        }
        return (
          <text
            key={`number-${text}-${index}`}
            x={`${(index / (numbers.length - 1)) * 100}%`}
            y={viewBoxHeight}
            textAnchor={textAnchor}
          >
            {text}
          </text>
        );
      })}
      {children}
    </SVGContainer>
  );
};
