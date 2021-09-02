import React, { useState, useEffect, useRef, useContext } from 'react';

import styled from 'styled-components';

import { transitions, cssVariables } from 'feather';

export type CollapsibleSide = {
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
};

type Props = {
  collapsibleNode: React.ReactNode;
  contentNode: React.ReactNode;
  collapsedWidthOffset?: number;
  isContentNodeZIndexHigher?: boolean;
};

const Collapsable = styled.div<{ isCollapsed: boolean; isContentNodeZIndexHigher?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: ${({ isCollapsed, isContentNodeZIndexHigher }) => (!isCollapsed && !isContentNodeZIndexHigher ? 40 : 10)};
`;

const Content = styled.div<{ isCollapsed: boolean; collapsableWidth: number; collapsedWidthOffset?: number }>`
  position: relative;
  flex: 1;
  z-index: 30;
  margin-left: ${({ isCollapsed, collapsableWidth, collapsedWidthOffset }) =>
    isCollapsed ? collapsedWidthOffset || 0 : collapsableWidth}px;
  transition: ${transitions({ duration: 0.2, properties: ['margin-left'] })};

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1px;
    width: 1px;
    height: 100%;
    background: ${cssVariables('neutral-2')};
  }
`;

const Container = styled.div`
  display: flex;
  position: relative;
  height: 100%;
`;

export const useCollapsableSide = (defaultIsCollapsed?: boolean): CollapsibleSide => {
  const [isCollapsed, setIsCollapsed] = useState(defaultIsCollapsed || false);

  return {
    isCollapsed,
    setIsCollapsed,
  };
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export const CollapsibleSideContext = React.createContext({
  isCollapsed: false,
  setIsCollapsed: (isCollapsed: boolean) => {},
});
/* eslint-disable @typescript-eslint/no-unused-vars */

export const CollapsibleSide = React.forwardRef<HTMLDivElement, Props>(
  ({ contentNode, collapsibleNode, collapsedWidthOffset, isContentNodeZIndexHigher = true }, ref) => {
    const [collapsableWidth, setCollapsableWidth] = useState(0);
    const collapsibleRef = useRef<HTMLDivElement>(null);
    const collapsibleSideContext = useContext(CollapsibleSideContext);

    useEffect(() => {
      setCollapsableWidth((collapsibleRef.current && collapsibleRef.current.offsetWidth) || 0);
    }, [setCollapsableWidth]);

    return (
      <Container>
        <Collapsable
          ref={collapsibleRef}
          isCollapsed={collapsibleSideContext.isCollapsed}
          isContentNodeZIndexHigher={isContentNodeZIndexHigher}
        >
          {collapsibleNode}
        </Collapsable>
        <Content
          ref={ref}
          isCollapsed={collapsibleSideContext.isCollapsed}
          collapsableWidth={collapsableWidth}
          collapsedWidthOffset={collapsedWidthOffset}
        >
          {contentNode}
        </Content>
      </Container>
    );
  },
);
