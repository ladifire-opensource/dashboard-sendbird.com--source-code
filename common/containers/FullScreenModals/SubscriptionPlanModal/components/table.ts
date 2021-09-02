import styled from 'styled-components';

import { cssVariables, Subtitles, Body, Headings, Typography } from 'feather';

export const TableSection = styled.section`
  width: 1024px;
  margin: 0 auto;
`;

export const TitleContainer = styled.div`
  ${Subtitles['subtitle-02']};
  width: 100%;
  margin-top: 32px;
  margin-bottom: 12px;
  text-align: left;
  display: grid;
  grid-template-columns: 1fr 160px 142px;
  grid-column-gap: 24px;
`;

export const TitleText = styled.h2`
  ${Headings['heading-02']};
  color: ${cssVariables('neutral-7')};
`;

export const TitleSuffix = styled.div`
  display: flex;
  align-items: center;
  ${Body['body-short-01']};
  color: ${cssVariables('neutral-7')};

  b {
    margin-right: 4px;
    font-weight: 600;
    color: ${cssVariables('purple-7')};
  }

  a {
    margin-right: 4px;
  }
`;

export const TableWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 24px 24px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

export const Column = styled.div`
  display: flex;
  align-items: center;
  ${Body['body-short-01']};
  padding-left: 8px;
`;

export const Row = styled.div`
  display: grid;
  align-items: center;
  grid-template-columns: 36px 544px 1fr 1fr 1fr;
  grid-auto-flow: row;
  padding: 8px 0;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

export const Header = styled(Row)`
  padding: 28px 8px;

  ${Column} {
    ${Typography['label-03']};
    color: ${cssVariables('neutral-10')};
  }
`;
