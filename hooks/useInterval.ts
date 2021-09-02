import { useEffect, useRef, useCallback } from 'react';

export function useInterval(callback: (() => void) | undefined, delay: number) {
  const savedCallback = useRef<() => void>();
  const savedId = useRef<any>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  function tick() {
    if (savedCallback.current) {
      savedCallback.current();
    }
  }

  const startInterval = useCallback(() => {
    if (savedCallback.current) {
      savedId.current = setInterval(tick, delay);
    }
  }, [delay]);

  const stopInterval = useCallback(() => {
    clearInterval(savedId.current);
  }, []);

  useEffect(() => {
    if (savedCallback.current) {
      startInterval();
    } else {
      stopInterval();
    }

    return () => stopInterval();
  }, [delay, callback, startInterval, stopInterval]);

  return {
    startInterval,
    stopInterval,
  };
}
