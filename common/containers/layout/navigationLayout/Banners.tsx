import React, { FC } from 'react';

import { transitionDefault } from 'feather';

import { EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION } from '@constants';
import { BANNER_HEIGHT } from '@constants/ui';

export const Banners: FC<{
  isVisible: boolean;
  banners: React.ReactNodeArray;
}> = ({ isVisible, banners }) => {
  return (
    <div
      css={`
        height: ${isVisible ? BANNER_HEIGHT * banners.length : 0}px;
        overflow: hidden;
        transition: height ${EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION}s ${transitionDefault};
      `}
    >
      {banners}
    </div>
  );
};
