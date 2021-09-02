import { DeskAllowedRegions } from '@constants';
import { isDeskEnabledApplication } from '@utils/isDeskEnabledApplication';

import { useAuthorization } from './useAuthorization';
import { useTypedSelector } from './useTypedSelector';

export const useIsDeskEnabled = () => {
  const { isFeatureEnabled, isPermitted, isSelfService } = useAuthorization();
  const application = useTypedSelector((state) => state.applicationState.data);

  const isDeskFeatureEnabled = () => {
    if (application) {
      if (isSelfService) {
        return isDeskEnabledApplication(application);
      }
      return isFeatureEnabled('desk') || isDeskEnabledApplication(application);
    }
    return false;
  };

  const isPermissionGranted = isPermitted(['desk.admin', 'desk.agent']);
  const isAllowedRegion = application ? DeskAllowedRegions.includes(application.region) : false;

  return isDeskFeatureEnabled() && isPermissionGranted && isAllowedRegion;
};
