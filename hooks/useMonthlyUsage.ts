import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Moment } from 'moment-timezone';
import qs from 'qs';

import { fetchOrganizationMonthlyUsage } from '@common/api';

import { useAsync } from './useAsync';

export const useMonthlyUsage = (date: Moment) => {
  const organization = useSelector((state: RootState) => state.organizations.current);
  const [{ status, data }, load] = useAsync(async () => {
    const params = qs.stringify({
      start_month: date.format('YYYY-MM'),
      end_month: date.format('YYYY-MM'),
    });
    return await fetchOrganizationMonthlyUsage(organization.uid, params);
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    isLoadingUsage: status === 'loading',
    monthlyUsage: data?.data.data[0],
  };
};
