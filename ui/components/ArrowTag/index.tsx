import { memo } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables } from 'feather';

type Props = {
  text: string;
  minWidth?: string | number;
  size?: 'normal' | 'small';
};

const TAG_HEIGHT = 20;
const TAG_ARROW_BORDER_SIZE = TAG_HEIGHT / 2;
const TAG_ARROW_SIZE = TAG_HEIGHT / 2 - 1;

const getTagStyle = (size: 'small' | 'normal') => {
  switch (size) {
    case 'small':
      return css`
        height: ${TAG_HEIGHT}px;
        border-right: 0;
        border-radius: 1px;
      `;

    default:
      return css`
        height: 40px;
        border-radius: 4px;
      `;
  }
};

const getTagBeforeStyle = (size: 'small' | 'normal') => {
  switch (size) {
    case 'small':
      return css`
        top: -1px;
        right: -8px;
        border-top: ${TAG_ARROW_BORDER_SIZE}px solid transparent;
        border-bottom: ${TAG_ARROW_BORDER_SIZE}px solid transparent;
        border-left: ${TAG_ARROW_BORDER_SIZE}px solid ${cssVariables('neutral-3')};
        border-radius: 1px;
        transform: scaleX(0.7);
      `;

    default:
      return css`
        top: 0px;
        right: -15px;
        border-top: 19px solid transparent;
        border-bottom: 19px solid transparent;
        border-left: 19px solid ${cssVariables('neutral-3')};
        border-radius: 4px;
        -webkit-transform: scaleX(0.7);
        -ms-transform: scaleX(0.7);
        transform: scaleX(0.5) translateX(-1px);
      `;
  }
};

const getTagAfterStyle = (size: 'small' | 'normal') => {
  switch (size) {
    case 'small':
      return css`
        top: 0;
        right: -7px;
        border-top: ${TAG_ARROW_SIZE}px solid transparent;
        border-bottom: ${TAG_ARROW_SIZE}px solid transparent;
        border-left: ${TAG_ARROW_SIZE}px solid white;
        border-radius: 1px;
        transform: scaleX(0.7);
      `;

    default:
      return css`
        top: 1px;
        right: -13px;
        border-top: 18px solid transparent;
        border-bottom: 18px solid transparent;
        border-left: 18px solid white;
        border-radius: 4px;
        -webkit-transform: scaleX(0.7);
        -ms-transform: scaleX(0.7);
        transform: scaleX(0.5);
      `;
  }
};

const Container = styled.div`
  display: inline-flex;
  padding-right: 8px;
`;

const Tag = styled.div<{ minWidth?: number | string; size: 'small' | 'normal' }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding-left: 4px;
  padding-right: 2px;
  min-width: ${({ minWidth }) => (typeof minWidth === 'number' ? `${minWidth - 7}px` : minWidth)};
  font-size: 11px;
  font-weight: 600;
  line-height: 0;
  letter-spacing: 0.25px;
  text-align: center;
  color: ${cssVariables('neutral-6')};
  border: 1px solid ${cssVariables('neutral-3')};
  ${({ size }) => size && getTagStyle(size)};

  &::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    ${({ size }) => size && getTagBeforeStyle(size)};
  }

  &::after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    ${({ size }) => size && getTagAfterStyle(size)};
  }
`;

export const ArrowTag = memo<Props>(({ text, minWidth, size = 'normal' }) => {
  return (
    <Container>
      <Tag minWidth={minWidth} size={size} data-test-id="ArrowTag">
        {text}
      </Tag>
    </Container>
  );
});
