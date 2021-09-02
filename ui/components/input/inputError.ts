import styled, { css } from 'styled-components';

import { cssVariables } from 'feather';

export const InputError = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: ${cssVariables('red-5')};
  font-style: italic;
`;

export const errorInputStyles = css`
  border-color: ${cssVariables('red-5')} !important;
  &:focus {
    border-color: ${cssVariables('red-5')} !important;
  }
`;
