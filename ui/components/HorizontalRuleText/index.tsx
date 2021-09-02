import React from 'react';

import styled, { CSSProperties } from 'styled-components';

import { cssVariables } from 'feather';

interface ContainerProps {
  width: CSSProperties['width'];
  display: CSSProperties['display'];
}

interface TextProps {
  textSize: CSSProperties['fontSize'];
  textColor: CSSProperties['color'];
  textSidePadding?: number;
  textBackground: CSSProperties['backgroundColor'];
}

interface HorizontalRuleProps {
  hrColor: CSSProperties['backgroundColor'];
}

interface Props extends Partial<ContainerProps>, Partial<TextProps>, Partial<HorizontalRuleProps> {
  className?: string;
  children: React.ReactNode;
}

const Container = styled.div<ContainerProps>`
  display: ${({ display }) => display || 'inline-flex'};
  align-items: center;
  justify-content: center;
  position: relative;
  width: ${({ width }) => `${width}px` || '100%'};
`;

const Text = styled.span<TextProps>`
  position: relative;
  z-index: 30;
  padding: 0 ${({ textSidePadding }) => textSidePadding || 8}px;
  font-size: ${({ textSize }) => (textSize ? `${textSize}px` : '12px')};
  font-weight: 500;
  color: ${({ textColor }) => textColor || cssVariables('neutral-6')};
  background: ${({ textBackground }) => textBackground || 'white'};
`;

const HorizontalRule = styled.hr<HorizontalRuleProps>`
  position: absolute;
  z-index: 10;
  width: 100%;
  height: 1px;
  border-width: 0;
  background: ${({ hrColor }) => hrColor || cssVariables('neutral-3')};
`;

export const HorizontalRuleText = React.memo<Props>(
  ({ className, children, width, display, textSize, textColor, textBackground, textSidePadding, hrColor }) => (
    <Container className={className} display={display} width={width}>
      <Text textSidePadding={textSidePadding} textSize={textSize} textColor={textColor} textBackground={textBackground}>
        {children}
      </Text>
      <HorizontalRule hrColor={hrColor} />
    </Container>
  ),
);
