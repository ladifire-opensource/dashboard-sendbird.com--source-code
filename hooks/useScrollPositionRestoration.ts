import { useRef, useLayoutEffect, useEffect, useCallback } from 'react';

type ScrollToFunction = (y: number) => void;
type FirstMessageNodeUpdater = (node: HTMLDivElement | null) => void;
interface UseScrollPositionRestoration {
  (parameters: { messageCount: number; scrollTo: ScrollToFunction }): FirstMessageNodeUpdater;
}

export const useScrollPositionRestoration: UseScrollPositionRestoration = ({ messageCount, scrollTo }) => {
  const scrollToRef = useRef<ScrollToFunction>(scrollTo);
  const firstMessageNodeWhenFetchingPrevMessages = useRef<{ node: HTMLDivElement; offset: number } | null>(null);

  useEffect(() => {
    scrollToRef.current = scrollTo;
  }, [scrollTo]);

  useLayoutEffect(() => {
    if (firstMessageNodeWhenFetchingPrevMessages.current) {
      const { node, offset } = firstMessageNodeWhenFetchingPrevMessages.current;
      scrollToRef.current(node.offsetTop - offset);
      firstMessageNodeWhenFetchingPrevMessages.current = null;
    }
  }, [messageCount]);

  const setFirstMessageNodeWhenFetchingPrevMessages: FirstMessageNodeUpdater = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        firstMessageNodeWhenFetchingPrevMessages.current = { node, offset: node.offsetTop };
      } else {
        firstMessageNodeWhenFetchingPrevMessages.current = null;
      }
    },
    [],
  );

  return setFirstMessageNodeWhenFetchingPrevMessages;
};
