import React, { useEffect, useContext, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { ScrollBar, ScrollBarRef } from 'feather';

import { LNBContext } from '@core/containers/app/lnbContext';
import { useUnsaved } from '@hooks';
import { ContentContainer, UnsavedPrompt } from '@ui/components';

import { AgentSettingsSideMenu } from './AgentSettingsSideMenu';

type Props = {
  className?: string;
  children: (params: { setUnsaved: ReturnType<typeof useUnsaved>['setUnsaved'] }) => React.ReactNode;
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

export const AgentSettingsLayout: React.FC<Props> = ({ className, children }) => {
  const location = useLocation();
  const { unsaved, setUnsaved, pushTo } = useUnsaved();
  const scrollBarRef = useRef<ScrollBarRef>(null);
  const { setIsSideMenuVisible } = useContext(LNBContext);

  useEffect(() => {
    scrollBarRef?.current?.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setIsSideMenuVisible(true);
    return () => {
      setIsSideMenuVisible(false);
    };
  }, [setIsSideMenuVisible]);

  return (
    <Container className={className}>
      <UnsavedPrompt when={unsaved} />
      <AgentSettingsSideMenu
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
        <ContentWrapper>{children({ setUnsaved })}</ContentWrapper>
      </ScrollBar>
    </Container>
  );
};
