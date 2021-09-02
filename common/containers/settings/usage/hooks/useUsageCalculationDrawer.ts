import { ReactNode } from 'react';

import { useDrawer } from '@ui/components/drawer/useDrawer';

export type UsageCalculationDrawerState = {
  title: ReactNode;
  usageField: FeatureUsageField;
};

export const useUsageCalculationDrawer = () => {
  const drawer = useDrawer<UsageCalculationDrawerState>();
  const { drawerState } = drawer;

  if (drawerState != null && drawerState.usageField != null) {
    return drawer;
  }
  return { ...drawer, drawerState: undefined };
};
