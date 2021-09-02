import styled, { SimpleInterpolation, css } from 'styled-components';

import { cssVariables, transitions, transitionDefault, elevation } from 'feather';

export const MonthTarget = styled.div<{ isActive: boolean; styles: SimpleInterpolation }>`
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  min-width: 127px;
  height: 32px;
  background-color: white;

  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};
  outline: 0;

  transition: ${transitions({ duration: 0.2, properties: ['color', 'border', 'box-shadow', 'background-color'] })};
  cursor: pointer;

  svg {
    flex: none;
    fill: ${cssVariables('neutral-9')};

    transition: fill 0.2s ${transitionDefault};
  }

  &:hover,
  &:focus {
    color: ${cssVariables('purple-7')};

    svg {
      fill: ${cssVariables('purple-7')};
    }
  }

  &:hover,
  &:active {
    border: 1px solid ${cssVariables('purple-7')};
  }

  &:focus:not(:active) {
    border: 1px solid ${cssVariables('purple-7')};
  }

  ${({ isActive }) =>
    isActive &&
    css`
      color: ${cssVariables('purple-7')};
      border: 1px solid ${cssVariables('purple-7')} !important;
      background-color: ${cssVariables('purple-2')};
      box-shadow: none !important;

      svg {
        fill: ${cssVariables('purple-7')};
      }
    `}

  ${({ styles }) => styles};
`;

export const MonthTargetStart = styled.div`
  flex: 1;
  padding-left: 12px;
`;

export const MonthIcon = styled.div`
  display: flex;
  align-items: flex-end;
  padding: 0 12px 0 8px;
  font-size: 0;
  vertical-align: middle;
`;

export const MonthWrapper = styled.div`
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 4px;
  min-width: 200px;
  ${elevation.popover};
`;
