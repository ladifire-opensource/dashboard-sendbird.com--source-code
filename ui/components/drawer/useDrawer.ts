import { useContext, useMemo } from 'react';

import { DrawerContext } from './drawerContext';

export const useDrawer = <T extends Record<string, any>>() => {
  const { drawerState, ...values } = useContext(DrawerContext);

  return useMemo(
    () => ({
      drawerState: drawerState as T | undefined,
      ...values,
    }),
    [drawerState, values],
  );
};
