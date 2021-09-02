import { createContext } from 'react';

interface DrawerContextValue {
  activeDrawerID: string | null;
  drawerState?: Record<string, any>;
  openDrawer(id: string, drawerState?: DrawerContextValue['drawerState']): void;
  closeDrawer(id?: string): void;
}

export const DrawerContext = createContext<DrawerContextValue>({
  activeDrawerID: null,
  openDrawer: () => {},
  closeDrawer: () => {},
});
