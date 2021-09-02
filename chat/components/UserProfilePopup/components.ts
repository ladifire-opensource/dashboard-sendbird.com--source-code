import styled, { css } from 'styled-components';

import { cssVariables, elevation, IconButton } from 'feather';

export const CloseButton = styled(IconButton).attrs({
  icon: 'close',
  buttonType: 'tertiary',
  size: 'small',
  'aria-label': 'Close',
})``;

export const Wrapper = styled.div<{ $align?: 'center' }>`
  ${elevation.popover}
  position: relative;
  width: 320px;
  background: white;
  border-radius: 4px;
  ${({ $align }) =>
    $align === 'center' &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;
    `}

  > ${CloseButton} {
    position: absolute;
    top: 8px;
    right: 8px;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-top: 1px solid ${cssVariables('neutral-3')};
  height: 45px;
`;
