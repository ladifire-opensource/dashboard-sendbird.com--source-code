import { useMemo } from 'react';

import { css } from 'styled-components';

import { SideMenu, SideMenuProps, LeftNavigationBar, transitionDefault } from 'feather';

import { EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION } from '@constants';

import { ZIndexes } from '../../zIndexes';

export const FixedSideMenu = (props: SideMenuProps) => {
  return useMemo(
    () => (
      <SideMenu
        {...props}
        css={css`
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: ${ZIndexes.navigation};
          background-color: white;
          transition: left ${LeftNavigationBar.collapseAnimationDurationSecond}s,
            top ${EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION}s;
          transition-timing-function: ${transitionDefault};
        `}
      />
    ),
    [props],
  );
};
