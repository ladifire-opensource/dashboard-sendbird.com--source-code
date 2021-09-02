import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { transitions } from 'feather';

const verticals = ['top', 'bottom'];
const isVertical = (from) => verticals.includes(from);

const reversed = ['top', 'left'];
const isReversed = (from) => reversed.includes(from);

const TransitionRenderer = styled.div<{
  $duration: number;
  $from: 'top' | 'right' | 'bottom' | 'left';
  $isTransitionedToZero: boolean;
  $distance: number;
  $delay: number;
}>`
  opacity: ${({ $isTransitionedToZero }) => ($isTransitionedToZero ? 1 : 0)};
  transform: ${({ $from, $isTransitionedToZero, $distance }) =>
    `translate${isVertical($from) ? 'Y' : 'X'}(${isReversed($from) && !$isTransitionedToZero ? '-' : ''}${
      $isTransitionedToZero ? 0 : $distance
    }px)`};
  transition: ${({ $duration }) => transitions({ duration: $duration, properties: ['transform', 'opacity'] })};
  transition-delay: ${({ $delay }) => $delay}s;
`;

type Props = {
  show?: boolean;
  from?: 'top' | 'right' | 'bottom' | 'left';
  distance?: number;
  duration?: number;
  delay?: number;
  className?: string;
  shouldUnmountAfterFadeOut?: boolean;
  as?: keyof JSX.IntrinsicElements | React.ComponentType<any>;
  children: React.ReactNode | React.ReactNode[];
};

export const SlideTransition = React.memo<Props>(
  ({
    className,
    show = true,
    from = 'right',
    distance = 16,
    duration = 0.3,
    delay = 0,
    shouldUnmountAfterFadeOut = true,
    as,
    children,
  }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isTransitionedToZero, setIsTransitionedToZero] = useState(false);

    useEffect(() => {
      if (show) {
        setIsMounted(true);
        setTimeout(() => {
          setIsTransitionedToZero(true);
        }, duration * 1000);
        return;
      }

      if (isTransitionedToZero) {
        setIsTransitionedToZero(false);
        setTimeout(() => {
          setIsMounted(false);
        }, duration * 1000);
      }
    }, [duration, isTransitionedToZero, show]);

    if (!isMounted && !isTransitionedToZero && shouldUnmountAfterFadeOut) {
      return null;
    }

    return (
      <TransitionRenderer
        className={className}
        as={as}
        $from={from}
        $distance={distance}
        $duration={duration}
        $delay={delay}
        $isTransitionedToZero={isTransitionedToZero}
      >
        {children}
      </TransitionRenderer>
    );
  },
);
