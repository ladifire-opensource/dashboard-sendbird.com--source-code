import { useSelector } from 'react-redux';

import { CallsAllowedRegions } from '@constants';
import { isCallsEnabledApplication } from '@utils/isCallsEnabledApplication';

export const useIsCallsEnabled = () => {
  const isAllowedRegion = useSelector((state: RootState) =>
    state.applicationState.data ? CallsAllowedRegions.includes(state.applicationState.data.region) : false,
  );
  const isVideochatEnabled = useSelector((state: RootState) =>
    state.applicationState.data ? isCallsEnabledApplication(state.applicationState.data) : false,
  );
  return isAllowedRegion && isVideochatEnabled;
};
