import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { fetchSubscriptionInfo } from '@common/api';
import { SubscriptionProduct } from '@constants';

import { useAsync } from './useAsync';

export const useSubscriptions = (product: SubscriptionProduct) => {
  const { authenticated } = useSelector((state: RootState) => state.auth);
  const [{ data, status }, load] = useAsync(async () => {
    return await fetchSubscriptionInfo(product);
  }, [product]);

  const subscriptions = data?.data;

  useEffect(() => {
    if (authenticated) {
      load();
    }
  }, [authenticated, load]);

  return {
    isLoading: status === 'loading',
    isLoaded: status === 'success' || status === 'error',
    current: subscriptions?.current_subscription ?? null,
    future: subscriptions?.future_subscription ?? null,
  };
};
