import { useState, useEffect, useMemo, createContext } from 'react';
import { useLocation } from 'react-router-dom';

import { LeftNavigationBar } from 'feather';
import debounce from 'lodash/debounce';

import { getDimension } from '@utils';

type LNBContextValue = {
  isCollapsed: boolean;
  isForceCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  setIsSideMenuVisible: (value: boolean) => void;
};

const minimumContentWidth = 1088;

const collapseURLs = ['/desk/tickets/', '/desk/conversation/', '/open_channels/', '/group_channels/'];

export const LNBContext = createContext<LNBContextValue>({
  isCollapsed: false,
  isForceCollapsed: false,
  setIsCollapsed: () => {},
  setIsSideMenuVisible: () => {},
});

export const useLNBContext = () => {
  const [isSideMenuVisible, setIsSideMenuVisible] = useState(false);
  const [isViewportNarrow, setIsViewportNarrow] = useState(false);

  const sideMenuWidth = isSideMenuVisible ? 240 : 0;
  const forceCollapseBreakpoint = minimumContentWidth + LeftNavigationBar.defaultWidth + sideMenuWidth;
  const location = useLocation();
  const isForceCollapsed = collapseURLs.some((url) => location.pathname.includes(url)) || isViewportNarrow;
  const [isUserCollapsedSidebar, setIsUserCollapsedSidebar] = useState(false);
  const isCollapsed = isForceCollapsed || isUserCollapsedSidebar;

  useEffect(() => {
    setIsViewportNarrow(getDimension().x < forceCollapseBreakpoint);

    const windowResizeEventListener = debounce(() => {
      if (getDimension().x < forceCollapseBreakpoint) {
        setIsViewportNarrow(true);
      } else {
        setIsViewportNarrow(false);
      }
    }, 500);

    window.addEventListener('resize', windowResizeEventListener);
    return () => {
      window.removeEventListener('resize', windowResizeEventListener);
    };
  }, [forceCollapseBreakpoint, setIsViewportNarrow]);

  const providerValue = useMemo(
    () => ({ isCollapsed, isForceCollapsed, setIsCollapsed: setIsUserCollapsedSidebar, setIsSideMenuVisible }),
    [isCollapsed, isForceCollapsed],
  );
  return providerValue;
};
