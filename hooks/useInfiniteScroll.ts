import { useRef, useEffect, useCallback, useMemo } from 'react';

import { useLatestValue } from './useLatestValue';

/**
 *
 * @param options.handleLoadMore callback called when loading next page is triggered by scrolling to the end of the list
 * @param options.hasMore pass `true` if there is a next page to load
 * @param options.isLoadMoreFailed pass `true` to show an error and Retry button at the end of the list
 *
 * @returns an object with `scrollBarRef` and `spinnerWrapperRef` properties. Set them as `ref`s of the corresponding elements
 */
export const useInfiniteScroll = ({
  handleLoadMore,
  hasMore,
  isLoadMoreFailed = false,
}: {
  handleLoadMore: () => void;
  hasMore: boolean;
  isLoadMoreFailed?: boolean;
}) => {
  const latestHandleLoadMore = useLatestValue(handleLoadMore);
  const scrollBarRef = useRef<HTMLElement | null>(null);
  const spinnerWrapperRef = useRef<HTMLElement | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver>();

  const updateIntersectionObserver = useCallback(() => {
    intersectionObserverRef.current?.disconnect();

    if (scrollBarRef.current == null || spinnerWrapperRef.current == null) {
      // if nodes are not found, stop the execution.
      return;
    }

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            latestHandleLoadMore.current();
          }
        }
      },
      { root: scrollBarRef.current, rootMargin: '100%' },
    );
    intersectionObserverRef.current = intersectionObserver;

    if (spinnerWrapperRef.current) {
      intersectionObserver.observe(spinnerWrapperRef.current);
    }
  }, [latestHandleLoadMore]);

  useEffect(() => {
    updateIntersectionObserver();
  }, [hasMore, isLoadMoreFailed, updateIntersectionObserver]);

  return useMemo(
    () => ({
      scrollBarRef: (node: HTMLElement | null) => {
        // no need to update if ref didn't change
        if (scrollBarRef.current !== node) {
          scrollBarRef.current = node;
          updateIntersectionObserver();
        }
      },
      spinnerWrapperRef: (node: HTMLElement | null) => {
        // no need to update if ref didn't change
        if (scrollBarRef.current !== node) {
          spinnerWrapperRef.current = node;
          updateIntersectionObserver();
        }
      },
    }),
    [updateIntersectionObserver],
  );
};
