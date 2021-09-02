import { useContext, forwardRef, ReactNode } from 'react';
import { CSSTransition } from 'react-transition-group';

import styled, { css } from 'styled-components';

import { shadow, transitionDefault } from 'feather';

import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { ZIndexes } from '@ui/zIndexes';

import { Portal } from '../portal';
import { DrawerContext } from './drawerContext';

type Props = { id: string; className?: string; children?: ReactNode };

export const drawerTransitionDurationSecond = 0.2;

// should be added to react-transition-group `-active` classes
const transitionCss = css`
  transition: ${drawerTransitionDurationSecond}s ${transitionDefault};
`;

const Container = styled.aside<{ isOpen: boolean; gnbHeight: number }>`
  position: fixed;
  bottom: 0;
  transition-property: transform, box-shadow, right;
  z-index: ${ZIndexes.drawer};
  background: white;
  max-width: 100%;

  ${({ gnbHeight }) => {
    return css`
      top: ${gnbHeight}px;
      height: calc(100% - ${gnbHeight}px);
    `;
  }};

  &.Drawer__slide-enter {
    right: -16px;
    transform: translateX(320px);
  }

  &.Drawer__slide-enter-active,
  &.Drawer__slide-enter-done {
    right: 0;
    transform: translateX(0);
    ${transitionCss};
    ${shadow[12]};
  }

  &.Drawer__slide-exit {
    right: 0;
    transform: translateX(0);
    ${shadow[12]};
  }

  &.Drawer__slide-exit-active,
  &.Drawer__slide-exit-done {
    right: -16px;
    transform: translateX(320px);
    ${transitionCss};
  }
`;

export const Drawer = forwardRef<HTMLDivElement, Props>(({ id, children, className }, ref) => {
  const gnbHeight = useContext(GNBHeightContext);
  const { activeDrawerID } = useContext(DrawerContext);
  const isOpen = id === activeDrawerID;

  return (
    <Portal>
      <CSSTransition
        in={isOpen}
        timeout={drawerTransitionDurationSecond * 1000}
        classNames="Drawer__slide"
        unmountOnExit={true}
      >
        <Container ref={ref} isOpen={isOpen} aria-hidden={!isOpen} gnbHeight={gnbHeight} className={className}>
          {children}
        </Container>
      </CSSTransition>
    </Portal>
  );
});

export * from './drawerContext';
export * from './drawerContextProvider';
