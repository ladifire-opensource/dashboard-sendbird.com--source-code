import { useEffect, useRef, useMemo, useCallback } from 'react';

import { TooltipTrigger, TooltipRef } from 'feather';

import { useLatestValue } from '@hooks';

export const useDropdownButtonTooltip = ({ isMenuOpen }: { isMenuOpen: boolean }) => {
  const latestIsMenuOpen = useLatestValue(isMenuOpen);
  const tooltipRef = useRef<TooltipRef>(null);

  useEffect(() => {
    if (isMenuOpen) {
      tooltipRef.current?.hide();
    }
  }, [isMenuOpen]);

  const getTooltipProps = useCallback(() => {
    return { ref: tooltipRef, trigger: TooltipTrigger.Manual };
  }, []);

  const getButtonProps = useCallback(() => {
    return {
      onMouseEnter: () => {
        if (!latestIsMenuOpen.current) {
          // avoid showing tooltip when dropdown menu is open so they won't be overlapped.
          tooltipRef.current?.show();
        }
      },
      onMouseLeave: () => {
        tooltipRef.current?.hide();
      },
    };
  }, [latestIsMenuOpen]);

  return useMemo(() => ({ getTooltipProps, getButtonProps }), [getButtonProps, getTooltipProps]);
};
