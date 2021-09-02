import styled, { css } from 'styled-components';

import { cssVariables, Body } from 'feather';

import { ChevronLink } from './ChevronLink';

export const InformationCard = styled.section`
  padding: 24px;
  background: ${cssVariables('neutral-1')};
  border-radius: 4px;
`;

export const contentStyle = css`
  > h3 {
    font-size: 16px;
    font-weight: 500;
    line-height: 20px;
    letter-spacing: -0.15px;
    color: ${cssVariables('neutral-10')};
  }

  > h4 {
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
    color: ${cssVariables('neutral-6')};
  }

  > p {
    ${Body['body-short-01']}
  }

  > ${ChevronLink} {
    margin-top: 16px;
    font-size: 14px;
    font-weight: 600;
  }

  > h3 + p {
    margin-top: 4px;
  }

  > h4 + p {
    margin-top: 12px;
  }
`;
