import styled from 'styled-components';

import { Body, cssVariables, Headings } from 'feather';

export const TableContainer = styled.div`
  padding: 24px;
  border-radius: 4px;
  border: 1px solid ${cssVariables('neutral-3')};

  > h2 {
    ${Headings['heading-02']}
    margin-bottom: 16px;
  }

  > * + [role='combobox'] {
    transform: translateX(-8px);
    margin-top: 8px;
    min-width: auto;
  }
`;

export const ContentLayout = styled.div`
  > p {
    ${Body['body-short-01']}
    color: ${cssVariables('neutral-7')};
    max-width: 640px;
    margin-bottom: 32px;

    > a {
      ${Headings['heading-01']}
    }
  }

  ${TableContainer} + section {
    margin-top: 32px;
  }
`;
