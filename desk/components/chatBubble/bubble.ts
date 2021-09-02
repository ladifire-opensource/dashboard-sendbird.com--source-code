import styled, { css } from 'styled-components';

import { cssVariables } from 'feather';

export const Bubble = styled.div<{
  isOwn?: boolean;
  backgroundColor?: 'white' | 'neutral' | 'yellow' | 'green' | 'red';
}>`
  border-radius: 8px;
  border: 1px solid;

  ${(props) => {
    if (props.backgroundColor === 'white') {
      return css`
        border: 1px solid ${cssVariables('neutral-3')};
        background-color: white;
      `;
    }
    if (props.backgroundColor) {
      return css`
        border-color: transparent;
        background-color: ${cssVariables([props.backgroundColor, 1])};
      `;
    }
    return css`
      border-color: transparent;
      background-color: ${props.isOwn ? cssVariables('purple-3') : cssVariables('neutral-2')};
    `;
  }}
`;

export const WhiteBubble = styled.div`
  border-radius: 8px;
  border: 1px solid ${cssVariables('neutral-3')};
  background-color: white;
`;
