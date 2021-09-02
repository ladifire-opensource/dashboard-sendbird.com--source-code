import styled from 'styled-components';

import { IconButton, cssVariables, Button } from 'feather';

export const TableRowIconButton = styled(IconButton).attrs({ buttonType: 'secondary', size: 'xsmall' })`
  // make buttons darker to make them stand out from row background color

  && button {
    &:not(:disabled):hover {
      background: ${cssVariables('neutral-3')};
    }

    &:active,
    &:focus:active {
      background: ${cssVariables('neutral-3')};
    }
  }
`;

export const TableRowButton = styled(Button)`
  ${({ buttonType }) =>
    buttonType === 'tertiary' &&
    `
    // make background color white (which is originally transparent)

    &,
    &:not(:disabled):hover {
      background: white;
    }

    &:active,
    &:focus:active {
      background: ${cssVariables('purple-2')};
    }
`}
`;
