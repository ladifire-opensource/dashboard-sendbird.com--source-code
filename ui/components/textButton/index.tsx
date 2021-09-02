import styled from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

export const TextButton = styled.button`
  color: ${cssVariables('purple-7')};
  font-size: 14px;
  font-weight: 500;
  border: none;
  background: none;
  outline: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.2s ${transitionDefault};

  &:hover {
    color: ${cssVariables('purple-8')};
    text-decoration: underline;
  }

  &:active {
    color: ${cssVariables('neutral-9')};
  }
`;
