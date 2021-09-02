import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

export const useApplicationRegionsSelector = (applications: ApplicationSummary[]) => {
  const organization = useSelector((state: RootState) => state.organizations.current);

  const getApplicationRegion = useCallback(
    (application: ApplicationSummary): string | null => {
      if (isEmpty(organization)) {
        return null;
      }
      const allowedRegions = Object.keys(organization.regions).filter(
        (regionKey) => organization.regions[regionKey].allowed,
      );
      if (allowedRegions.length === 0) {
        return null;
      }

      const region = organization.regions[application.region];
      return region ? region.name : null;
    },
    [organization],
  );

  return useMemo(
    () =>
      applications.reduce<Record<string, string | null>>((acc, cur) => {
        acc[cur.app_id] = getApplicationRegion(cur);
        return acc;
      }, {}),
    [applications, getApplicationRegion],
  );
};
