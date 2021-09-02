import { useEffect, useCallback } from 'react';

import { fetchCurrentSubscription } from '@common/api';
import { SubscriptionProduct } from '@constants';

import { useAsync } from './useAsync';
import { useAuthorization } from './useAuthorization';

export const useCurrentSubscription = (product: SubscriptionProduct) => {
  const { isSelfService } = useAuthorization();
  const [{ data, status }, load] = useAsync(async () => fetchCurrentSubscription(product), [product]);

  /**
   * if there is no current subscription, then the response is an empty string "",
   * which can be normalized to null using || operator.
   */
  const currentSubscription = data?.data || null;

  const reload = useCallback(() => {
    if (isSelfService) {
      load();
    }
  }, [isSelfService, load]);

  useEffect(() => {
    reload();
  }, [reload]);

  return {
    isLoading: status === 'loading',
    isLoaded: status === 'success' || status === 'error',
    currentSubscription,
    reload,
  };
};
