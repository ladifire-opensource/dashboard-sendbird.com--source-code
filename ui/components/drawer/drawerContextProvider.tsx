import React, { useState, useMemo, useCallback } from 'react';

import { DrawerContext } from './drawerContext';

// To transfer state to active drawer component.
type DrawerState = Record<string, any>;

export const DrawerContextProvider: React.FC = ({ children }) => {
  const [activeDrawerID, setActiveDrawerID] = useState<string | null>(null);
  const [drawerState, setDrawerState] = useState<DrawerState | undefined>(undefined);

  const openDrawer = useCallback((id: string | null, state?: DrawerState) => {
    if (state != null) {
      setDrawerState(state);
    }
    setActiveDrawerID(id);
  }, []);

  return (
    <DrawerContext.Provider
      value={useMemo(() => {
        const closeDrawer = (id?: string) => {
          if (!id || id === activeDrawerID) {
            setActiveDrawerID(null);
            setDrawerState(undefined);
          }
        };

        return {
          activeDrawerID,
          drawerState,
          openDrawer,
          closeDrawer,
        };
      }, [activeDrawerID, drawerState, openDrawer])}
    >
      {children}
    </DrawerContext.Provider>
  );
};
