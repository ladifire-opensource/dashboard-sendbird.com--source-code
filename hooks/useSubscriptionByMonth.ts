import { useEffect } from 'react';

import isEmpty from 'lodash/isEmpty';
import { Moment } from 'moment-timezone';

import { fetchSubscriptionByMonth } from '@common/api';
import { SubscriptionProduct } from '@constants';
import { useAsync } from '@hooks';

interface UseSubscriptionByMonth {
  (date: Moment): { isLoading: boolean; subscription: Subscription | null };
}

export const useSubscriptionByMonth: UseSubscriptionByMonth = (date: Moment) => {
  const [{ data, status }, load] = useAsync(async () => {
    return await fetchSubscriptionByMonth({ month: date.format('YYYY-MM'), product: SubscriptionProduct.Chat });
  }, [date]);

  const subscription =
    data?.data && (Object.prototype.hasOwnProperty.call(data?.data, 'error') || isEmpty(data?.data))
      ? null
      : (data?.data as Subscription);

  useEffect(() => {
    load();
  }, [load]);

  return {
    isLoading: status === 'loading',
    subscription,
  };
};
