import React, { createContext, useState, useCallback } from 'react';

import { FeatureFlagKey, FeatureFlagStore, featureFlags } from './featureFlagStore';

type FeatureFlagMap = Partial<Record<FeatureFlagKey, boolean>>;
type FeatureFlagContextValue = {
  toggle: (key: FeatureFlagKey, isEnabled: boolean) => void;
  flags: FeatureFlagMap;
};
export const FeatureFlagContext = createContext<FeatureFlagContextValue>({ toggle: () => {}, flags: {} });

const featureFlagKeys = featureFlags.map((flag) => flag.id);
export const FeatureFlagContextProvider: React.FC = ({ children }) => {
  const currentFlags: FeatureFlagMap = featureFlagKeys.reduce((acc, key) => {
    acc[key] = FeatureFlagStore.get(key);
    return acc;
  }, {});
  const [flagMap, setFlagMap] = useState<FeatureFlagMap>(currentFlags);
  const toggle: FeatureFlagContextValue['toggle'] = useCallback((key, isEnabled) => {
    FeatureFlagStore.toggle(key, isEnabled);
    setFlagMap((flagMap) => ({ ...flagMap, [key]: isEnabled }));
  }, []);

  return <FeatureFlagContext.Provider value={{ flags: flagMap, toggle }} children={children} />;
};
