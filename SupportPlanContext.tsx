import { createContext } from 'react';

import { SubscriptionProduct } from '@constants';
import { useSubscriptions } from '@hooks/useSubscriptions';

export const SupportPlanContext = createContext<ReturnType<typeof useSubscriptions>>({
  isLoading: false,
  isLoaded: false,
  current: null,
  future: null,
});

export const SupportPlanContextProvider = ({ children }) => {
  const { isLoading, isLoaded, current, future } = useSubscriptions(SubscriptionProduct.Support);
  return (
    <SupportPlanContext.Provider
      value={{
        isLoading,
        isLoaded,
        current,
        future,
      }}
    >
      {children}
    </SupportPlanContext.Provider>
  );
};
