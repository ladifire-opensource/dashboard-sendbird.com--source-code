import { FC, useCallback, useEffect, useRef, useState, ReactNode } from 'react';

import throttle from 'lodash/throttle';

type IsScrollPassedState = Record<string, { isPassed: boolean; order: number }>;

export type ScrollTriggerProp = { isScrollPassed: IsScrollPassedState | null; currentKey: string | null };

type ScrollDirection = 'UP' | 'DOWN';

type Props = {
  children: (params: ScrollTriggerProp) => ReactNode;
  verticalOffset?: number;
};

/**
 * VerticalScrollTrigger
 *
 * @callback children passes two parameters to its children, `isScrollPassed`  and `currentKey`
 * @param isScrollPassed {Object} state of scroll passed for elements having [data-trigger] attribute
 * @param currentKey {string} key of the element scroll just passed
 *
 * @param verticalOffset: offset for scroll event to be triggered. The default value is 0.
 *
 * @description [data-scroll] attribute should be used for the scrolling target, otherwise window scroll point will be listened
 * @description [data-trigger] attribute should be assigned to the each element you want to trigger scroll event.
 */
export const VerticalScrollTrigger: FC<Props> = ({ children, verticalOffset = 0 }) => {
  const [isScrollPassed, setIsScrollPassed] = useState<IsScrollPassedState | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<ScrollDirection>('DOWN');

  const triggerTargetRef = useRef<Element[] | null>(null);
  const isScrollPassedRef = useRef(isScrollPassed);
  const prevScrollPointRef = useRef(0);
  const directionRef = useRef<ScrollDirection>('DOWN');

  const setTriggerTargetRef = () => {
    const scrollBodyElement = document.querySelector('[data-scroll]') ?? document;
    triggerTargetRef.current = [...scrollBodyElement.querySelectorAll('[data-trigger]')];
  };

  const getScrollListenerTarget = useCallback(() => {
    const scrollBodyElement = document.querySelector('[data-scroll]');
    return scrollBodyElement ?? (window || document.documentElement);
  }, []);

  const getCurrentScrollPoint = useCallback(() => {
    const scrollBodyElement = document.querySelector('[data-scroll]');
    return scrollBodyElement?.scrollTop ?? (window.pageYOffset || document.documentElement.scrollTop);
  }, []);

  const updateDirection = useCallback(() => {
    const currentScrollPoint = getCurrentScrollPoint();
    const currentDirection = currentScrollPoint > prevScrollPointRef.current ? 'DOWN' : 'UP';

    if (direction !== currentDirection) {
      setDirection(currentDirection);
    }
    prevScrollPointRef.current = currentScrollPoint;
    directionRef.current = currentDirection;
  }, [direction, getCurrentScrollPoint]);

  /**
   * @function generateIsScrollPassedData
   * @return {Object} isScrollPassed
   * @description
   * It measures whether current scroll point is passed the each element or not.
   * The `verticalOffset` is not applied for the first trigger-target element because it can cause unexpected behavior.
   * The created value will be set to `isScrollPassed`
   */
  const generateIsScrollPassedData = useCallback(() => {
    return triggerTargetRef.current?.reduce<IsScrollPassedState>((acc, curr, currIndex) => {
      const { top } = curr.getBoundingClientRect();
      const boundary = currIndex === 0 ? 0 : verticalOffset;
      const isPassed = top < boundary;
      const key = curr['dataset']['trigger'];
      if (key) {
        acc[key] = { isPassed, order: currIndex };
      }
      return acc;
    }, {});
  }, [verticalOffset]);

  /**
   * @function updateScrollTriggeredStates
   * @description When current scrollTop passes an [data-trigger] element, this method will assign value of [data-trigger] to `currentKey` and update `isScrollPassed`
   */
  const updateScrollTriggeredStates = useCallback(() => {
    const currentIsScrollPassed = generateIsScrollPassedData();

    if (isScrollPassedRef.current != null && currentIsScrollPassed) {
      let updatedKey: string | null = null;

      const isUpdatable = Object.keys(isScrollPassedRef.current).some((key) => {
        const isUpdated = isScrollPassedRef.current?.[key].isPassed !== currentIsScrollPassed[key].isPassed;
        if (isUpdated) {
          updatedKey = key;
        }
        return isUpdated;
      });

      if (isUpdatable && updatedKey) {
        if (directionRef.current === 'DOWN') {
          setCurrentKey(updatedKey);
        }

        if (directionRef.current === 'UP') {
          const prevKeys: string[] = [];
          Object.keys(isScrollPassedRef.current)
            .sort(
              (a, b) =>
                (isScrollPassedRef.current?.[a].order as number) - (isScrollPassedRef.current?.[b].order as number),
            )
            .forEach((key) => {
              if (isScrollPassedRef.current?.[key].isPassed) {
                prevKeys.push(key);
              }
            });
          const prevKey = prevKeys[prevKeys.length - 2] ?? null;
          setCurrentKey(prevKey);
        }
        setIsScrollPassed(currentIsScrollPassed);
        isScrollPassedRef.current = currentIsScrollPassed;
      }
    }
  }, [generateIsScrollPassedData, isScrollPassedRef]);

  const init = useCallback(() => {
    setTriggerTargetRef();
    const initialIsScrollPassedState = generateIsScrollPassedData();
    if (initialIsScrollPassedState) {
      setIsScrollPassed(initialIsScrollPassedState);
    }
  }, [generateIsScrollPassedData]);

  const register = useCallback(() => {
    throttle(() => {
      updateDirection();
      updateScrollTriggeredStates();
    }, 100)();
  }, [updateDirection, updateScrollTriggeredStates]);

  useEffect(() => {
    isScrollPassedRef.current = isScrollPassed;
  }, [isScrollPassed]);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const eventListenerTarget = getScrollListenerTarget();
    if (eventListenerTarget) {
      eventListenerTarget.addEventListener('scroll', register);
    }

    return () => {
      if (eventListenerTarget) {
        eventListenerTarget.removeEventListener('scroll', register);
      }
    };
  }, [generateIsScrollPassedData, getScrollListenerTarget, isScrollPassedRef, register]);

  return <>{children({ isScrollPassed, currentKey })}</>;
};

export default VerticalScrollTrigger;
