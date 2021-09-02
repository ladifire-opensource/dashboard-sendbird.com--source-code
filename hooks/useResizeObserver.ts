import { useRef, useCallback, useEffect } from 'react';

import { ResizeObserver } from 'resize-observer';
import { ContentRect } from 'resize-observer/lib/ContentRect';
import { ResizeObserverEntry } from 'resize-observer/lib/ResizeObserverEntry';

import { useLatestValue } from './useLatestValue';

/**
 * Hook to observe resizes of a single element.
 *
 * ### Example
 * ```
 * const observeResize = useResizeObserver((entry) => {
 *   console.log(entry.contentRect, entry.target);
 * });
 *
 * return (
 *   <div ref={(node) => { observeResize(node) }}>
 *     // content with variable size
 *   </div>
 * );
 * ```
 *
 * @param callback callback to run when an observed element resizes.
 * @param options set `mode: 'width'` to observe only width changes, or `mode: 'height'` to observe only height changes
 * (default: `mode: 'both'`)
 *
 * @returns ref callback to pass to the element to observe.
 */
export const useResizeObserver = (
  callback?: (entry: ResizeObserverEntry) => void,
  options: { mode: 'height' | 'width' | 'both' } = { mode: 'both' },
) => {
  const contentRectRef = useRef<ContentRect | null>(null);
  const latestCallback = useLatestValue(callback);
  const resizeObserverRef = useRef<ResizeObserver>(
    new ResizeObserver(([entry]) => {
      const { contentRect } = entry;
      if (
        (options.mode === 'width' && contentRectRef.current?.width !== contentRect.width) ||
        (options.mode === 'height' && contentRectRef.current?.height !== contentRect.height) ||
        options.mode === 'both'
      ) {
        latestCallback.current?.(entry);
      }

      contentRectRef.current = contentRect;
    }),
  );
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    const { current: resizeObserver } = resizeObserverRef;

    // disconnect resize observer on unmount
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const refHandler = useCallback((node: Element | null) => {
    const currentRefValue = elementRef.current;
    if (currentRefValue === node) {
      return;
    }

    // Observed node was updated.
    elementRef.current = currentRefValue;

    if (currentRefValue) {
      resizeObserverRef.current.unobserve(currentRefValue);
    }

    if (node) {
      resizeObserverRef.current.observe(node);
    }
  }, []);

  return refHandler;
};
