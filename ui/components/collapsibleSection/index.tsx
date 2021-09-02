import { useCallback, useState, useRef, useLayoutEffect, createContext, useEffect } from 'react';

import styled, { css, SimpleInterpolation } from 'styled-components';

import { Icon, cssVariables, transitionDefault, ScrollBarRef } from 'feather';

import { usePrevious } from '../../../hooks/usePrevious';

const collapsedHeight = 48;
const paddingBottom = 16;

const Title = styled.h4<{ isCollapsible: boolean; styles?: SimpleInterpolation }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  margin-left: -16px;
  margin-right: -16px;
  padding-left: 16px;

  font-size: 14px;
  line-height: 20px;
  font-weight: 600;

  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  cursor: ${(props) => (props.isCollapsible ? 'pointer' : 'normal')};
  user-select: none;

  ${(props) => props.styles};
`;

const ToggleButtonIcon = styled(Icon)`
  > svg {
    fill: ${cssVariables('neutral-5')};
    transition: fill 0.15s ${transitionDefault};

    &:hover {
      fill: ${cssVariables('neutral-6')};
    }
  }
`;

const Container = styled.div<{
  isHidden: boolean;
  isCollapsed: boolean;
  disabled: boolean;
  childrenHeight?: number;
  isInitialChildrenHeight: boolean;
}>`
  border-top: 1px solid ${cssVariables('neutral-3')};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  padding: 0 16px;

  overflow: ${(props) => (props.isHidden ? 'hidden' : 'visible')};
  transition: max-height 0.2s ${transitionDefault};
  will-change: max-height;

  & + & {
    border-top: none;
  }

  h4 {
    ${(props) =>
      props.disabled &&
      css`
        cursor: not-allowed;
        color: ${cssVariables('neutral-5')};
      `}

    & > .btn-agent-sidebar-section-toggle {
      width: 48px;
      height: 48px;
      border: 0;
      outline: 0;
      cursor: pointer;
      overflow: hidden;
      background: none;

      ${ToggleButtonIcon} {
        transform: rotate(${(props) => (props.isCollapsed ? '-90deg' : 0)});
        transition: transform 0.2s ${transitionDefault};
      }

      ${(props) =>
        props.disabled &&
        css`
          cursor: not-allowed;
        `}
    }
  }
`;

const ChildrenWrapper = styled.div`
  padding-bottom: 16px;
`;

type Props = {
  className?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  initialCollapsed?: boolean;
  isCollapsible?: boolean;
  disabled?: boolean;
  styles?: SimpleInterpolation;
  scrollBarRef?: React.RefObject<ScrollBarRef>;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
export const CollapsibleSectionContext = createContext({
  resizeSection: ({ scrollToTop }: { scrollToTop: boolean }) => {},
});
/* eslint-disable @typescript-eslint/no-unused-vars */

export const CollapsibleSection: React.FC<Props> = ({
  className,
  title,
  children,
  initialCollapsed = false,
  isCollapsible = true,
  disabled = false,
  styles,
  scrollBarRef,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isHidden, setIsHidden] = useState(initialCollapsed);

  // NOTICE: To prevent that dropdown popover is hidden
  useEffect(() => {
    if (isCollapsed) {
      setIsHidden(true);
    } else {
      setTimeout(() => {
        setIsHidden(false);
      }, 100);
    }
  }, [isCollapsed]);

  const childrenContainerRef = useRef<HTMLDivElement>(null);
  const ContainerRef = useRef<HTMLDivElement>(null);
  const [childrenHeight, setChildrenHeight] = useState<number | undefined>(undefined);
  const prevChildrenHeight = usePrevious(childrenHeight);

  const onToggleButtonClick = useCallback(() => {
    if (!disabled && isCollapsible) {
      setIsCollapsed(!isCollapsed);
      if (isCollapsed && childrenContainerRef.current) {
        setChildrenHeight(childrenContainerRef.current.clientHeight);
      }
    }
  }, [isCollapsed, disabled, isCollapsible]);

  useLayoutEffect(() => {
    if (childrenContainerRef.current) {
      if (prevChildrenHeight !== childrenContainerRef.current.clientHeight) {
        setChildrenHeight(childrenContainerRef.current.clientHeight);
      }
    }
  }, [children, prevChildrenHeight, children]);

  const resizeSection = useCallback(
    ({ scrollToTop = false }: { scrollToTop: boolean }) => {
      if (childrenContainerRef.current) {
        setChildrenHeight(childrenContainerRef.current.clientHeight);
        if (scrollToTop && scrollBarRef && scrollBarRef.current && ContainerRef.current) {
          scrollBarRef.current.scrollTo(0, ContainerRef.current.offsetTop);
        }
      }
    },
    [scrollBarRef],
  );

  return (
    <Container
      ref={ContainerRef}
      className={className}
      childrenHeight={childrenHeight}
      isInitialChildrenHeight={prevChildrenHeight === undefined}
      isHidden={isHidden}
      isCollapsed={isCollapsed}
      disabled={disabled}
      style={{
        maxHeight: `${isCollapsed ? collapsedHeight : (childrenHeight || 0) + collapsedHeight + paddingBottom}px`,
      }}
    >
      {title && (
        <Title onClick={onToggleButtonClick} isCollapsible={isCollapsible} styles={styles}>
          {title}
          {isCollapsible && (
            <button type="button" className="btn-agent-sidebar-section-toggle">
              <ToggleButtonIcon icon="chevron-down" size={20} />
            </button>
          )}
        </Title>
      )}
      <CollapsibleSectionContext.Provider value={{ resizeSection }}>
        <ChildrenWrapper ref={childrenContainerRef}>{children}</ChildrenWrapper>
      </CollapsibleSectionContext.Provider>
    </Container>
  );
};
