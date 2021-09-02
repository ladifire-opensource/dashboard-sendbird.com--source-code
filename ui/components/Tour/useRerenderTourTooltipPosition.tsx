import { useContext, useEffect } from 'react';

import { LeftNavigationBar } from 'feather';

import { LNBContext } from '@core/containers/app/lnbContext';

const lnbTransitionDuration = LeftNavigationBar.collapseAnimationDurationSecond * 1000;

/**
 * Re-render tooltip position for tour component
 * when LNB is either collapsed or expanded.
 */
export const useRerenderTourTooltipPosition = () => {
  const { isCollapsed: isLNBCollapsed } = useContext(LNBContext);

  useEffect(() => {
    const now = Date.now();

    window.requestAnimationFrame(function dispatchResizeEvent() {
      window.dispatchEvent(new Event('resize'));

      if (Date.now() - now <= lnbTransitionDuration) {
        window.requestAnimationFrame(dispatchResizeEvent);
      }
    });
  }, [isLNBCollapsed]);
};
