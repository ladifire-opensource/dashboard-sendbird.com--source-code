import React from 'react';

import styled, { css } from 'styled-components';

import { AppSettingPageHeader } from './AppSettingPageHeader';

const contentWidth = 1024;

type Props = {
  children?: React.ReactNode;
  className?: string;
  isTableView?: boolean;
};

export const PageContent = styled.div<{ $isTableView: boolean }>`
  width: ${contentWidth}px;
  padding-top: 24px;
  padding-bottom: 64px;

  ${AppSettingPageHeader} + * {
    margin-top: 24px;
  }

  ${(props) =>
    props.$isTableView &&
    css`
      display: flex;
      flex-direction: column;
      padding-bottom: 0;
      height: 100%;
      overflow: hidden;

      > *:last-child {
        flex: 1;
        min-height: 0;
      }
    `}
`;

export const AppSettingsContainer = React.memo<Props>(({ children, className, isTableView = false }) => {
  return (
    <PageContent className={className} $isTableView={isTableView}>
      {children}
    </PageContent>
  );
});
