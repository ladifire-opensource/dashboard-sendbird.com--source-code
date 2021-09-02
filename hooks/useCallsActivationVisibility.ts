import { useSelector } from 'react-redux';

import { CallsAllowedRegions } from '@constants';

import { useIsCallsEnabled } from './useIsCallsEnabled';

export const useCallsActivationVisibility = () => {
  const isCallsEnabled = useIsCallsEnabled();
  const region = useSelector((state: RootState) => state.applicationState.data?.region);
  const isRegionAllowed = !!(region && CallsAllowedRegions.includes(region));

  return !isCallsEnabled && isRegionAllowed;
};
