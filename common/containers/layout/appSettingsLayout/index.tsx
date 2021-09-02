import React, { useEffect, useContext, useRef } from 'react';

import styled, { css } from 'styled-components';

import { ScrollBar, ScrollBarRef } from 'feather';

import { LNBContext } from '@core/containers/app/lnbContext';
import { useUnsaved, useScrollBarRefScrollToTop } from '@hooks';
import { ContentContainer, UnsavedPrompt } from '@ui/components';

import { AppSettingsSideMenu } from './AppSettingsSideMenu';

type Props = {
  className?: string;
  preventScrollToTopPages?: string[];
  children:
    | React.ReactNode
    | ((params: { setUnsaved: ReturnType<typeof useUnsaved>['setUnsaved'] }) => React.ReactNode);
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  position: relative;
  background-color: white;
`;

const ContentWrapper = styled(ContentContainer)`
  height: 100%;
`;

export const AppSettingsLayout: React.FC<Props> = ({ className, preventScrollToTopPages, children }) => {
  const { unsaved, setUnsaved, pushTo } = useUnsaved();
  const scrollBarRef = useRef<ScrollBarRef>(null);
  const { setIsSideMenuVisible } = useContext(LNBContext);

  useScrollBarRefScrollToTop(scrollBarRef, preventScrollToTopPages);

  useEffect(() => {
    setIsSideMenuVisible(true);
    return () => {
      setIsSideMenuVisible(false);
    };
  }, [setIsSideMenuVisible]);

  return (
    <Container className={className}>
      <UnsavedPrompt when={unsaved} />
      <AppSettingsSideMenu
        css={`
          height: 100%;
        `}
        onMenuItemClick={pushTo}
      />
      <ScrollBar
        ref={scrollBarRef}
        css={css`
          flex: 1;
          width: auto;
          height: 100%;
        `}
      >
        <ContentWrapper>{children instanceof Function ? children({ setUnsaved }) : children}</ContentWrapper>
      </ScrollBar>
    </Container>
  );
};

export * from './appSettingsContainer';
export * from './AppSettingPageHeader';
