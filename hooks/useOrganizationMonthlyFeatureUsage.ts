import { useEffect } from 'react';

import { Moment } from 'moment-timezone';
import qs from 'qs';

import { fetchOrganizationMonthlyUsage } from '@common/api';

import { useAsync } from './useAsync';
import { useTypedSelector } from './useTypedSelector';

export const useOrganizationMonthlyFeatureUsage = (feature: ChatFeature | undefined, date: Moment) => {
  const organization = useTypedSelector(({ organizations }) => organizations.current);
  const organizationUID = organization.uid;

  const [{ status, data }, load] = useAsync(() => {
    const params = qs.stringify({
      start_month: date.format('YYYY-MM'),
      end_month: date.format('YYYY-MM'),
    });
    return fetchOrganizationMonthlyUsage(organizationUID, params);
  }, [organizationUID, date]);

  useEffect(() => {
    if (feature && feature.trackable) {
      load();
    }
  }, [feature, load]);

  return {
    isMonthlyLoading: status === 'loading',
    monthlyUsage: data?.data.data[0],
    updatedDt: data?.data.data[0].updated_dt,
  };
};
