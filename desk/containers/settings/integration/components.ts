import styled from 'styled-components';

import { cssVariables, Subtitles, Body } from 'feather';

import { SettingsCardFooter } from '@common/containers/layout';

/**
 * Integration setting pages use 10 columns in 12-column grid of 1024px width and 32px grid-gap.
 * Each column width is 56px. That's why the width is 848px = 56px * 10 + 32px * 9.
 */
export const ContentWrapper = styled.div<{ isGrid?: boolean }>`
  width: 848px;

  ${({ isGrid = false }) =>
    isGrid &&
    `
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-gap: 32px;
  `}
`;

export const IntegrationHeader = styled.div`
  position: relative;
  grid-column: span 5;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  border: 1px solid ${cssVariables('neutral-3')};
  padding: 24px;
  margin-top: 24px;
  margin-bottom: 16px;
  border-radius: 4px;

  .SocialMediaIcon {
    margin-bottom: 16px;
  }

  .SocialMediaName {
    ${Subtitles['subtitle-03']}
    width: 100%;
    color: ${cssVariables('neutral-10')};
    margin-bottom: 8px;
  }

  .SocialMediaDescription {
    ${Body['body-short-01']}
    width: 70%;
    color: ${cssVariables('neutral-7')};
  }

  .IntegratedMark {
    position: absolute;
    top: 24px;
    right: 24px;
  }

  .CardAction {
    margin-left: -12px;
  }
`;

export const IntegrationTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;

  tbody tr:hover {
    background-color: ${cssVariables('neutral-1')};
  }

  tr {
    display: flex;
    flex-direction: row;
    align-items: center;

    border-bottom: 1px solid ${cssVariables('neutral-3')} !important;
  }

  th {
    font-size: 13px;
    line-height: 16px;
    color: ${cssVariables('neutral-10')};
    font-weight: 600;
    text-align: left;
    padding: 16px;
  }

  td {
    display: flex;
    flex-direction: row;
    align-items: center;

    ${Body['body-short-01']}
    color: ${cssVariables('neutral-10')};
    padding: 8px 16px;
  }

  .IntegrationTable__column--pageName {
    flex: 1;

    a {
      margin-left: 8px;
    }
  }

  .IntegrationTable__column--settings {
    flex: 3;
  }
`;

export const IntegrationEditWrapper = styled(ContentWrapper)`
  .IntegrationFacebookEdit__card,
  .IntegrationTwitterEdit__card {
    margin-top: 24px;

    ${SettingsCardFooter} {
      background-color: transparent;
    }
  }
`;
