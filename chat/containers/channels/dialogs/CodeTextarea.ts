import styled from 'styled-components';

import { cssVariables, InputTextarea } from 'feather';

// FIXME: replace with textarea with line numbers https://zpl.io/aRpMMGK
export const CodeTextarea = styled(InputTextarea)`
  textarea {
    height: 120px;
    font-family: 'Roboto Mono', monospace;
    font-size: 13px;
    line-height: 20px;
    color: ${cssVariables('neutral-6')};
    letter-spacing: -0.3px;
    background-color: ${cssVariables('neutral-2')};
    border: 0;
  }
`;
