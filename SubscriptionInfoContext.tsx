import { createContext, FC, useState, ContextType, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';

import { fetchSubscriptionInfo } from '@common/api';
import { SubscriptionProduct } from '@constants';
import { useAsync, useErrorToast } from '@hooks';

type SubscriptionInfos = Record<SubscriptionProduct, SubscriptionInfo>;

export const initialPlanInfos = Object.values(SubscriptionProduct).reduce<SubscriptionInfos>((infos, product) => {
  infos[product] = { current: null, future: null };
  return infos;
}, {} as SubscriptionInfos);

export const SubscriptionInfoContext = createContext<{
  isLoading: boolean;
  isLoaded: boolean;
  subscriptions: SubscriptionInfos;
  updateSubscriptions: (payload: { product: SubscriptionProduct; info: SubscriptionInfo }) => void;
  fetchSubscriptions: () => void;
}>({
  isLoading: false,
  isLoaded: false,
  subscriptions: initialPlanInfos,
  updateSubscriptions: () => {},
  fetchSubscriptions: () => {},
});

export const SubscriptionInfoContextProvider: FC = ({ children }) => {
  const [subscriptions, setSubscriptions] = useState(initialPlanInfos);
  const { authenticated } = useSelector((state: RootState) => state.auth);

  const updateSubscriptions: ContextType<typeof SubscriptionInfoContext>['updateSubscriptions'] = useCallback(
    ({ product, info }) => {
      setSubscriptions({ ...subscriptions, [product]: info });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [{ data, status, error }, load] = useAsync(async () => {
    if (authenticated) {
      return fetchSubscriptionInfo(SubscriptionProduct.Chat);
    }
  }, [authenticated]);

  useErrorToast(error);

  useEffect(() => {
    if (data) {
      updateSubscriptions({
        product: SubscriptionProduct.Chat,
        info: {
          current: data.data.current_subscription,
          future: data.data.future_subscription,
        },
      });
    }
  }, [authenticated, data, updateSubscriptions]);

  return (
    <SubscriptionInfoContext.Provider
      value={{
        isLoading: status === 'loading',
        isLoaded: status === 'success' || status === 'error',
        subscriptions,
        updateSubscriptions,
        fetchSubscriptions: load,
      }}
    >
      {children}
    </SubscriptionInfoContext.Provider>
  );
};
