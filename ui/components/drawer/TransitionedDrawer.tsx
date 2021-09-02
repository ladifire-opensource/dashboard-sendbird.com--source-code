import { useContext, forwardRef, ReactNode, useEffect, useState } from 'react';

import styled, { css } from 'styled-components';

import { shadow, transitionDefault, cssColors } from 'feather';
import { rgba } from 'polished';

import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { ZIndexes } from '@ui/zIndexes';

import { Portal } from '../portal';
import { useDrawer } from './useDrawer';

type Props = {
  id: string;
  className?: string;
  children?: ReactNode;
  isFullHeight?: boolean;
  isDarkBackground?: boolean;
};

export const transitionedDrawerTransitionDurationSecond = 0.2;

const Container = styled.div<{ isOpen: boolean; gnbHeight: number; isFullHeight: Props['isFullHeight'] }>`
  position: fixed;
  right: ${({ isOpen }) => (isOpen ? '0' : '-16px')};
  bottom: 0;
  max-width: 100%;
  background: white;
  transform: translateX(${({ isOpen }) => (isOpen ? 0 : '100%')});
  transition: ${transitionedDrawerTransitionDurationSecond}s ${transitionDefault};
  transition-property: transform, box-shadow;
  z-index: ${ZIndexes.drawer};

  ${({ isOpen }) => (isOpen ? shadow[12] : '')}
  ${({ isFullHeight, gnbHeight }) =>
    css`
      top: ${isFullHeight ? 0 : gnbHeight}px;
      height: ${isFullHeight ? '100%' : `calc(100% - ${gnbHeight}px)`};
    `};
`;

const Background = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: ${ZIndexes.drawerBackground};
  background: ${({ isOpen }) => (isOpen ? `${rgba(cssColors('neutral-9'), 0.6)}` : 'rgba(0,0,0,0)')};
  transition: background 0.3s ${transitionDefault};
`;
/**
 * FIXME: 
 * Drawer ? or TransitionedDrawer? 
 * 
 * Drawer is always rendered but invisible.
 * Drawer cannot be conditionally rendered. If you conditionally render the drawer, then it won't show the sliding animation.
 * TransitionedDrawer is initially not rendered, but when it is rendered, it triggers animation.
 * 
 * Drawer is useful if you want Drawer to stay and switch data by interaction
 * TransitionedDrawer is useful if you do not want to render it when there is no use of it.
 
 * e.g. 
 * When you need to keep drawer open and switch data inside of it, Drawer is right component to use. (ref. AgentDetailSidebar.tsx)
 * When you need to give drawer an url which would be rendered conditionally, TransitionedDrawer is right to use. (ref. TicketRuleDetail.tsx)
 * 
 * Those two components are similar and can be merged into one component, but personally did not try it
 * because the Drawer component became too complicated.
 * 
 * If you can merge those two components, please feel free to do so.
 * Will revisit this issue when there is time to work on.
 */
export const TransitionedDrawer = forwardRef<HTMLDivElement, Props>(
  ({ id, children, className, isFullHeight, isDarkBackground }, ref) => {
    const gnbHeight = useContext(GNBHeightContext);
    const { activeDrawerID } = useDrawer();
    const [isTransitioned, setIsTransitioned] = useState(false);
    const isOpen = id === activeDrawerID;

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          setIsTransitioned(true);
        }, transitionedDrawerTransitionDurationSecond * 1000);
        return;
      }

      if (isTransitioned) {
        setTimeout(() => {
          setIsTransitioned(false);
        }, transitionedDrawerTransitionDurationSecond * 1000);
      }
    }, [isOpen, isTransitioned]);

    if (!isOpen && !isTransitioned) {
      return null;
    }

    return (
      <>
        {/* eslint-disable */}
        <Portal>
          <Container
            ref={ref}
            className={className}
            role="complementary"
            isOpen={isOpen && isTransitioned}
            aria-hidden={!isOpen}
            gnbHeight={gnbHeight}
            isFullHeight={isFullHeight}
          >
            {children}
          </Container>
          {isDarkBackground && <Background isOpen={isOpen && isTransitioned} role="background" />}
        </Portal>
        {/* eslint-disable */}
      </>
    );
  },
);
