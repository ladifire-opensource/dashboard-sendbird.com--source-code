import React from 'react';

import styled from 'styled-components';

import { transitionDefault } from 'feather';

import { NavigationBar } from '@common/containers/navigationBar';
import { NAVIGATION_BAR_HEIGHT, EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION } from '@constants';
import { BANNER_HEIGHT } from '@constants/ui';
import { ZIndexes } from '@ui';

import { Banners } from './Banners';
import { GNBHeightContext } from './gnbHeightContext';
import { useBanners } from './useBanners';

const GNBArea = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: ${ZIndexes.navigation};
`;

const ContentWrapper = styled.div`
  height: 100%;
  transition: padding-top ${EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION}s ${transitionDefault};
`;

export const NavigationLayout: React.FC = ({ children }) => {
  const { loading, isBannerVisible, banners } = useBanners();

  if (loading) {
    return null;
  }

  const gnbHeight = isBannerVisible ? NAVIGATION_BAR_HEIGHT + BANNER_HEIGHT * banners.length : NAVIGATION_BAR_HEIGHT;
  return (
    <GNBHeightContext.Provider value={gnbHeight}>
      <ContentWrapper
        css={`
          padding-top: ${gnbHeight}px;
        `}
      >
        {children}
      </ContentWrapper>
      <GNBArea>
        <Banners isVisible={isBannerVisible} banners={banners} />
        <NavigationBar />
      </GNBArea>
    </GNBHeightContext.Provider>
  );
};
