import { useEffect } from 'react';

import moment, { Moment } from 'moment-timezone';
import qs from 'qs';

import { fetchOrganizationDailyUsage, fetchOrganizationDailyAccumulateUsage } from '@common/api';
import { AverageFeatures } from '@constants';
import { getDateRange, getField } from '@utils';

import { useAsync } from './useAsync';
import { useTypedSelector } from './useTypedSelector';

export const useOrganizationDailyFeatureUsage = (feature: ChatFeature, usageField: FeatureUsageField, date: Moment) => {
  const organization = useTypedSelector((state) => state.organizations.current);

  const today = moment();
  const endDateNumber = date.isSame(today, 'month') ? today.date() : moment(date).endOf('month').date();
  const startDate = date.startOf('month').format('YYYY-MM-DD');
  const endDate = date.date(endDateNumber).format('YYYY-MM-DD');

  const [{ status, data }, load] = useAsync(() => {
    const params = qs.stringify({
      start_date: startDate,
      end_date: endDate,
      fields: getField(usageField),
    });
    return fetchOrganizationDailyUsage(organization.uid, params);
  }, [organization.uid, usageField, startDate, endDate]);

  const [{ status: statusAccumulate, data: dataAccumulate }, loadAccumulate] = useAsync(() => {
    const params = qs.stringify({
      start_date: startDate,
      end_date: endDate,
      fields: getField(usageField),
    });
    return fetchOrganizationDailyAccumulateUsage(organization.uid, params);
  }, [organization.uid, usageField, startDate, endDate]);

  useEffect(() => {
    if (feature && feature.trackable && !AverageFeatures.includes(usageField)) {
      load();
      loadAccumulate();
    }
  }, [feature, load, loadAccumulate, usageField]);

  const daily: number[] | undefined = data?.data.data.map((usage) => usage[usageField]);

  const accumulate: number[] | undefined = dataAccumulate?.data.data.map((usage) => usage[usageField]);

  const labels = getDateRange(date.clone().startOf('month'), date.endOf('month'));

  return {
    isDailyLoading: status === 'loading' || statusAccumulate === 'loading',
    dailyUsage: {
      labels,
      accumulate,
      daily,
    },
  };
};
