import { useEffect, RefObject } from 'react';
import { useLocation } from 'react-router-dom';

import { ScrollBarRef } from 'feather';

import { useLatestValue } from './useLatestValue';

export const useScrollBarRefScrollToTop = (
  scrollBarRef: RefObject<ScrollBarRef>,
  preventScrollToTopPages?: string[],
) => {
  const location = useLocation();
  const preventScrollToTopPagesRef = useLatestValue(preventScrollToTopPages);
  useEffect(() => {
    if (preventScrollToTopPagesRef.current?.some((path) => location.pathname.includes(path))) {
      return;
    }

    scrollBarRef?.current?.scrollTo(0, 0);
  }, [location.pathname, preventScrollToTopPagesRef, scrollBarRef]);
};
