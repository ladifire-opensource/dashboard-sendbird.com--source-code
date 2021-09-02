import { useCallback } from 'react';

import isEmpty from 'lodash/isEmpty';

import { useShallowEqualSelector } from '@hooks';

export const useRegionType = () => {
  const regions = useShallowEqualSelector((state) => {
    return isEmpty(state.organizations.current) ? [] : state.organizations.current.regions;
  });

  const getRegionType = useCallback(
    (region: string) => {
      return regions[region]?.type ?? 'SHARED';
    },
    [regions],
  );
  return getRegionType;
};
