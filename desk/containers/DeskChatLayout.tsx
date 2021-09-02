/**
                      Container

  +---------+----------------------------+---------+---- top
  |         |                            |         |
  |         |                            |         |
  +---------+                            +-------------- ticket-list-top
  |         |                            |         |
  |         |                            |         |
  |         |        MainGridItem        |         |
  |         |                            |         |
  |         |                            |         |
  +---------+                            +-------------- ticket-list-bottom
  |         |                            |         |
  |         |                            |         |
  +----------------------------------------------------- bottom
  |         |                            |         |
start    chat-thread-start       iframe-sidebar   end



                     MainGridItem

            +-------------------+--------+---- top
            |                   |        |
            |                   |        |
            +--------------------------------- chat-titlebar-bottom
            |                   |        |
            |                   |        |
            |                   |        |
            |                   |        |
            |                   |        |
            |                   |        |
            +--------------------------------- bottom
            |                   |        |
 chat-thread-start   chat-thread-end    end

 */
import React, { useRef, useState, useEffect, useMemo, useCallback, FC } from 'react';
import { createPortal } from 'react-dom';

import styled, { SimpleInterpolation, css, createGlobalStyle, StyledComponent } from 'styled-components';

import { detect } from 'detect-browser';
import { cssVariables, transitionDefault, LeftNavigationBar } from 'feather';
import { ResizeObserver } from 'resize-observer';

import { DEFAULT_IFRAME_WIDTH } from '@constants';

type Props = { children?: React.ReactNode };
type SidebarWidthState = 'min' | 'max' | 'normal';

const SIDEBAR_MINIMUM_WIDTH = 288;
export const SIDEBAR_MAXIMUM_WIDTH = 336;
const CONTENT_MINIMUM_WIDTH = 304;
const CONTENT_MAXIMUM_WIDTH = 960;
const CONTENT_HORIZONTAL_PADDING = 16;
const CONTAINER_MIN_WIDTH = SIDEBAR_MINIMUM_WIDTH * 2 + CONTENT_MINIMUM_WIDTH + CONTENT_HORIZONTAL_PADDING * 2;

const Container = styled.div<{ sidebarWidth: string; minWidth: number }>`
  position: relative;
  display: grid;
  grid-gap: 1px;
  min-width: ${({ minWidth }) => minWidth}px;
  height: 100%;
  grid-template-rows: [top] 56px [ticket-list-top] auto [ticket-list-bottom] 64px [bottom];
  grid-template-columns: [start] ${({ sidebarWidth }) => sidebarWidth} [chat-thread-start] 1fr [iframe-sidebar] min-content [end];
  background-color: ${cssVariables('neutral-3')};
`;

const GridItem = styled.div<{ styles?: SimpleInterpolation }>`
  background-color: white;
  min-width: 0;
  min-height: 0;
  ${(props) => props.styles}
`;

const MainGridItem = styled(GridItem)<{ sidebarWidth: string }>`
  grid-row: top / bottom;
  grid-column: chat-thread-start / end;
  display: grid;
  grid-template-rows: [top] auto [chat-titlebar-bottom] 1fr [bottom];
  grid-template-columns: [chat-thread-start] 1fr [chat-thread-end] ${({ sidebarWidth }) => sidebarWidth} [end];
  grid-gap: 1px;

  min-width: 0;
  min-height: 0;
  background-color: ${cssVariables('neutral-3')};
`;

const TicketSidebarHeaderGridItem = styled(GridItem)`
  grid-column: start / chat-thread-start;
  grid-row: top / ticket-list-top;
`;

const ChatTitleBarGridItem = styled(GridItem)`
  grid-row: top / chat-titlebar-bottom;
  grid-column: chat-thread-start / end;
`;

const TicketSidebarBodyGridItem = styled(GridItem)`
  position: relative;
  grid-column: start / chat-thread-start;
  grid-row: ticket-list-top / ticket-list-bottom;
`;

const TicketSidebarFooterGridItem = styled(GridItem)`
  grid-column: start / chat-thread-start;
  grid-row: ticket-list-bottom / bottom;
`;

const TicketSidebarFooterlessBodyGridItem = styled(GridItem)`
  grid-column: start / chat-thread-start;
  grid-row: ticket-list-top / bottom;
`;

const ChatThreadGridItem = styled(GridItem)`
  grid-row: chat-titlebar-bottom / bottom;
  grid-column: chat-thread-start / chat-thread-end;
`;

interface GetChatBubbleMaxWidth {
  (parameters: { adjacentComponentWidth: number; bubbleHorizontalSpacing: number }): number | undefined;
}

// Troubleshooting: https://sendbird.atlassian.net/wiki/spaces/FEND/pages/133234978/Scroll+to+top+issue+in+flexible+layout
const browser = detect();
const browserMajorVersion = Number(browser?.version?.match(/^(\d+)\./)?.[1] ?? 0);
const hasScrollIssue =
  browserMajorVersion &&
  ((browser?.name === 'safari' && browserMajorVersion < 12) ||
    (browser?.name === 'chrome' && browserMajorVersion < 70));

export const ChatBubbleMaxWidthGetterContext = React.createContext<GetChatBubbleMaxWidth>(() => undefined);

const ChatThreadMessagesContainer: FC = ({ children }) => {
  const [wrapperWidth, setWrapperWidth] = useState<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef(
    new ResizeObserver(
      ([
        {
          contentRect: { width },
        },
      ]) => {
        if (width !== wrapperWidth) {
          setWrapperWidth(width);
        }
      },
    ),
  );

  useEffect(() => {
    const { current: resizeObserver } = resizeObserverRef;
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const getChatBubbleMaxWidth = useCallback<GetChatBubbleMaxWidth>(
    ({ adjacentComponentWidth, bubbleHorizontalSpacing }) =>
      wrapperWidth
        ? wrapperWidth - CONTENT_HORIZONTAL_PADDING * 2 - adjacentComponentWidth * 2 - bubbleHorizontalSpacing * 2
        : undefined,
    [wrapperWidth],
  );

  // Troubleshooting: https://sendbird.atlassian.net/wiki/spaces/FEND/pages/133234978/Scroll+to+top+issue+in+flexible+layout
  const preventScrollIssue = css`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
  `;

  return (
    <ChatBubbleMaxWidthGetterContext.Provider value={getChatBubbleMaxWidth}>
      <div
        ref={wrapperRef}
        css={css`
          ${hasScrollIssue && preventScrollIssue}
          padding: 0 ${CONTENT_HORIZONTAL_PADDING}px 12px ${CONTENT_HORIZONTAL_PADDING}px;
          min-width: ${CONTENT_MINIMUM_WIDTH + CONTENT_HORIZONTAL_PADDING * 2}px;
          max-width: ${CONTENT_MAXIMUM_WIDTH + CONTENT_HORIZONTAL_PADDING * 2}px;
          margin-left: auto;
          margin-right: auto;
          transition: all 0.15s ${transitionDefault};
        `}
      >
        {children}
      </div>
    </ChatBubbleMaxWidthGetterContext.Provider>
  );
};

/**
 * Note that HistoryTicket's wrapper element is positioned absolutely to this element. If you remove
 * "position: relative" statement from this styled component, ensure that HistoryTicket is positioned correctly on
 * both TicketDetail component and Conversation component.
 */
const InformationSidebarGridItem = styled(GridItem)`
  position: relative;
  z-index: 0;
  grid-row: chat-titlebar-bottom / bottom;
  grid-column: chat-thread-end / -1;
`;

const createProxyComponent = (container: HTMLElement | null): FC<{ styles?: SimpleInterpolation }> => ({
  children,
  styles,
}) => {
  if (container) {
    const containerId = container.id;
    const ContainerStyle = styles ? createGlobalStyle`#${containerId} { ${styles} }` : null;

    return createPortal(
      ContainerStyle ? (
        <>
          <ContainerStyle />
          {children}
        </>
      ) : (
        children
      ),
      container,
    );
  }
  return null;
};

type ProxyComponentItems = Record<
  'ChatTitleBarGridItem' | 'ChatThreadGridItem' | 'InformationSidebarGridItem',
  FC<{ styles?: SimpleInterpolation }>
>;

type GridItems = ProxyComponentItems &
  Record<
    | 'TicketSidebarHeaderGridItem'
    | 'TicketSidebarBodyGridItem'
    | 'TicketSidebarFooterGridItem'
    | 'TicketSidebarFooterGridItem'
    | 'TicketSidebarFooterlessBodyGridItem'
    | 'ChatThreadMessagesContainer',
    StyledComponent<any, any> | FC
  >;

const gridItems: GridItems = {
  TicketSidebarHeaderGridItem,
  TicketSidebarBodyGridItem,
  TicketSidebarFooterGridItem,
  TicketSidebarFooterlessBodyGridItem,
  ChatThreadMessagesContainer,
  ChatTitleBarGridItem: createProxyComponent(null),
  ChatThreadGridItem: createProxyComponent(null),
  InformationSidebarGridItem: createProxyComponent(null),
};

const contextState = {
  isIframeOverlap: false,
  iframeLayoutWidth: DEFAULT_IFRAME_WIDTH,
  setIframeLayoutWidth: (() => {}) as React.Dispatch<React.SetStateAction<number>>,
};

export const DeskChatLayoutContext = React.createContext(gridItems);
export const IframeLayoutContext = React.createContext(contextState);

export const DeskChatLayout: React.FC<Props> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidthState, setSidebarWidthState] = useState<SidebarWidthState>('normal');
  const [isIframeOverlap, setIsIframeOverlap] = useState(false);
  const [iframeLayoutWidth, setIframeLayoutWidth] = useState(DEFAULT_IFRAME_WIDTH);
  const [proxyComponentItems, setProxyComponentItems] = useState<ProxyComponentItems>();

  const CONTAINER_MIN_WIDTH_WITH_IFRAME = CONTAINER_MIN_WIDTH + iframeLayoutWidth;
  const resizeObserver = useMemo<ResizeObserver>(
    () =>
      new ResizeObserver(
        ([
          {
            contentRect: { width },
          },
        ]) => {
          let newSidebarWidthState: SidebarWidthState = 'normal';
          if (width <= SIDEBAR_MINIMUM_WIDTH * 4) {
            newSidebarWidthState = 'min';
          } else if (width >= SIDEBAR_MAXIMUM_WIDTH * 4) {
            newSidebarWidthState = 'max';
          }

          setIsIframeOverlap(width <= CONTAINER_MIN_WIDTH_WITH_IFRAME);
          if (newSidebarWidthState !== sidebarWidthState) {
            setSidebarWidthState(newSidebarWidthState);
          }
        },
      ),
    [CONTAINER_MIN_WIDTH_WITH_IFRAME, sidebarWidthState],
  );

  useEffect(() => {
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => {
      resizeObserver.disconnect();
    };
  }, [resizeObserver]);

  useEffect(() => {
    const chatTitleBarGridItem = document.getElementById('ChatTitleBarGridItem');
    const chatThreadGridItem = document.getElementById('ChatThreadGridItem');
    const informationSidebarGridItem = document.getElementById('InformationSidebarGridItem');

    setProxyComponentItems({
      ChatTitleBarGridItem: createProxyComponent(chatTitleBarGridItem),
      ChatThreadGridItem: createProxyComponent(chatThreadGridItem),
      InformationSidebarGridItem: createProxyComponent(informationSidebarGridItem),
    });
  }, []);

  const [sidebarWidth, mainGridSidebarWidth] = (() => {
    if (sidebarWidthState === 'max') {
      return [`${SIDEBAR_MAXIMUM_WIDTH}px`, `${SIDEBAR_MAXIMUM_WIDTH}px`];
    }
    if (sidebarWidthState === 'min') {
      return [`${SIDEBAR_MINIMUM_WIDTH}px`, `${SIDEBAR_MINIMUM_WIDTH}px`];
    }
    // We cannot just use 25% for a sidebar in MainGridItem because it's a subgrid. We need to recalculate the width.
    return [
      '25%',
      `calc(max(calc(100vw - ${LeftNavigationBar.collapsedWidth}px), ${CONTAINER_MIN_WIDTH_WITH_IFRAME}px) / 4)`,
    ];
  })();

  const layoutContextValue = useMemo(
    () => ({
      ...gridItems,
      ...proxyComponentItems,
    }),
    [proxyComponentItems],
  );

  const iframeLayoutContextValue = useMemo(() => ({ isIframeOverlap, iframeLayoutWidth, setIframeLayoutWidth }), [
    iframeLayoutWidth,
    isIframeOverlap,
  ]);

  return (
    <DeskChatLayoutContext.Provider value={layoutContextValue}>
      <Container ref={containerRef} sidebarWidth={sidebarWidth} minWidth={CONTAINER_MIN_WIDTH_WITH_IFRAME}>
        <IframeLayoutContext.Provider value={iframeLayoutContextValue}>{children}</IframeLayoutContext.Provider>
        <MainGridItem sidebarWidth={mainGridSidebarWidth}>
          <ChatTitleBarGridItem id="ChatTitleBarGridItem" />
          <ChatThreadGridItem id="ChatThreadGridItem" />
          <InformationSidebarGridItem id="InformationSidebarGridItem" />
        </MainGridItem>
      </Container>
    </DeskChatLayoutContext.Provider>
  );
};
