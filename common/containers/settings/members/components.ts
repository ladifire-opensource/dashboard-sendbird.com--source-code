import styled from 'styled-components';

import { cssVariables, Headings, Subtitles } from 'feather';

import { Paginator } from '@ui/components';

export const CountLabel = styled.span`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-10')};
  white-space: pre;
`;

export const CountNumber = styled.span`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
`;

export const NameWrapper = styled.span`
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  letter-spacing: -0.3px;
  flex: 1;
`;

export const MembersPagination = styled(Paginator)`
  margin-left: auto;
`;
