import styled from 'styled-components';

import { Headings, cssVariables, Body } from 'feather';

export const BillingSubtitle = styled.div`
  ${Headings['heading-01']};
`;

export const BillingSubDescription = styled.p`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
  margin-top: 4px;
`;

export const BillingInformationWrapper = styled.dl`
  margin-top: 16px;
  padding: 16px;
  border-radius: 4px;
  background-color: ${cssVariables('neutral-1')};
  display: grid;
  grid-template-columns: 160px 1fr;
  grid-column-gap: 16px;
  grid-row-gap: 8px;
`;

export const BillingInformationLabel = styled.dt`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};
`;

export const BillingInformationContent = styled.div`
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-10')};
  display: flex;
  align-items: center;
`;
