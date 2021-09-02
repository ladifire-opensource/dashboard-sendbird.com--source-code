import { useRef, useEffect, useCallback } from 'react';

import { fromEvent, Subscription } from 'rxjs';

export const useWindowFocusSubscription = () => {
  const windowFocusSubscription = useRef<Subscription>();
  const windowBlurSubscription = useRef<Subscription>();
  const isWindowFocused = useRef(false);

  useEffect(() => {
    windowFocusSubscription.current = fromEvent(window, 'focus').subscribe(() => {
      isWindowFocused.current = true;
    });

    windowBlurSubscription.current = fromEvent(window, 'blur').subscribe(() => {
      isWindowFocused.current = false;
    });

    // copy ref values for cleanup
    const focusSubscription = windowFocusSubscription.current;
    const blurSubscription = windowBlurSubscription.current;

    return () => {
      if (focusSubscription) {
        focusSubscription.unsubscribe();
      }
      if (blurSubscription) {
        blurSubscription.unsubscribe();
      }
    };
  }, []);

  return useCallback(() => isWindowFocused.current, []);
};
