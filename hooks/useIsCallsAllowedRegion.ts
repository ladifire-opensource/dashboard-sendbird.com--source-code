import { useSelector } from 'react-redux';

import { CallsAllowedRegions } from '@constants';

export const useIsCallsAllowedRegion = () => {
  const region = useSelector((state: RootState) => state.applicationState.data?.region);

  return !!(region && CallsAllowedRegions.includes(region));
};
