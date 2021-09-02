import React, { useCallback, useRef, useMemo, useEffect } from 'react';

type UseOutsideEventByRef = {
  (options: {
    ref: React.RefObject<any>;
    exceptionRefs?: React.RefObject<any>[];
    isExceptionsPreventOutsideClickEvent?: boolean;
    onOutsideClick: EventListener;
  }): {
    isSubscribed: boolean;
    subscribe: () => void;
    unsubscribe: () => void;
  };
};

export const useOutsideEventByRef: UseOutsideEventByRef = ({
  ref,
  exceptionRefs = [],
  isExceptionsPreventOutsideClickEvent = false,
  onOutsideClick,
}) => {
  const isSubscribedRef = useRef(false);
  const handleOutsideClick: EventListenerOrEventListenerObject = useCallback(
    (event) => {
      event.stopPropagation();

      if (ref.current == null || ref.current.contains(event.target)) {
        return;
      }

      if (!isExceptionsPreventOutsideClickEvent) {
        onOutsideClick?.(event);
      }

      if (
        exceptionRefs.filter((element) => element.current).some((element) => element.current.contains(event.target))
      ) {
        // event target is inside an exception element
        return;
      }

      onOutsideClick?.(event);
    },
    [exceptionRefs, isExceptionsPreventOutsideClickEvent, onOutsideClick, ref],
  );
  const handleOutsideClickRef = useRef(handleOutsideClick);

  const subscribe = useCallback(() => {
    if (!isSubscribedRef.current) {
      window.addEventListener('mousedown', handleOutsideClickRef.current, false);
      isSubscribedRef.current = true;
    }
  }, []);

  const unsubscribe = useCallback(() => {
    if (isSubscribedRef.current) {
      window.removeEventListener('mousedown', handleOutsideClickRef.current, false);
      isSubscribedRef.current = false;
    }
  }, []);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return useMemo(
    () => ({
      isSubscribed: isSubscribedRef.current,
      subscribe,
      unsubscribe,
    }),
    [subscribe, unsubscribe],
  );
};
