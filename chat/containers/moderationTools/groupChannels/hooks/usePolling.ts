import { useRef, useEffect, useCallback } from 'react';

import { useLatestValue } from '@hooks';
import usePageVisibility from '@hooks/usePageVisibility';

/**
 * A hook to call a function periodically when the page is visible
 *
 * @param intervalInSeconds Polling interval in seconds
 * @param callback Function to call periodically
 * @returns Functions to start and stop polling
 */
const usePolling = (intervalInSeconds: number, callback: () => void) => {
  const setIntervalIdRef = useRef<number>(-1);
  const isPageVisible = usePageVisibility();
  const callbackRef = useLatestValue(callback);
  const intervalInSecondsRef = useLatestValue(intervalInSeconds);

  const isPollingPaused = useRef(false);

  const stopPolling = useCallback(() => {
    if (setIntervalIdRef.current > -1) {
      window.clearInterval(setIntervalIdRef.current);
      setIntervalIdRef.current = -1;
    }
  }, []);

  const startPolling = useCallback(() => {
    stopPolling();

    callbackRef.current(); // call the callback immediately when polling starts
    const setIntervalId = window.setInterval(() => callbackRef.current(), intervalInSecondsRef.current * 1000);
    setIntervalIdRef.current = setIntervalId;
  }, [callbackRef, intervalInSecondsRef, stopPolling]);

  useEffect(() => {
    // If the page is in the background or an invisible tab, pause polling and resume when it becomes visible.
    if (isPageVisible) {
      if (isPollingPaused.current) {
        // If isPollingPaused.current is true, resume polling.
        startPolling();
        isPollingPaused.current = false;
      }
    } else {
      // the page became invisible
      if (setIntervalIdRef.current) {
        // If the polling is running, set isPollingPaused.current true and stop polling.
        isPollingPaused.current = true;
        stopPolling();
      }
    }
  }, [isPageVisible, startPolling, stopPolling]);

  return { startPolling, stopPolling };
};

export default usePolling;
