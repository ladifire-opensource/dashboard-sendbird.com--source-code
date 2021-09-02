import { useEffect } from 'react';

import moment, { Moment } from 'moment-timezone';

import { fetchApplicationMonthlyUsageWithOrgUsages } from '@common/api';

import { useAsync } from './useAsync';
import { useTypedSelector } from './useTypedSelector';

const currentDate = moment();

type Payload = {
  date?: Moment;
  feature?: ChatFeature;
  isSelfService?: boolean;
};

export const useApplicationMonthlyUsageWithOrgUsages = (payload?: Payload) => {
  const isSelfService = payload?.isSelfService || true;
  const fetchDate = payload?.date ?? currentDate;

  const application = useTypedSelector((state) => state.applicationState.data);
  const appId = application?.app_id;

  const fields = payload
    ? payload?.feature?.plans
        ?.map(({ usageField }) => {
          return usageField;
        })
        .join(',') || payload?.feature?.key
    : '';

  const [{ status, data }, load] = useAsync(async () => {
    const params = { target_month: fetchDate.format('YYYY-MM'), fields };
    return await fetchApplicationMonthlyUsageWithOrgUsages(appId || '', params);
  }, [fetchDate, fields, appId]);

  useEffect(() => {
    if (isSelfService) {
      load();
    }
  }, [isSelfService, load]);

  return {
    isLoadingUsage: status === 'loading',
    usageWithOrgUsages: data?.data.data,
    updatedDt: data?.data.data.updated_dt,
  };
};
