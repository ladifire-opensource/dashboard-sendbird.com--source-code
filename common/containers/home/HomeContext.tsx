import { createContext } from 'react';

import moment from 'moment-timezone';

import { SubscriptionProduct, ChatFeatureName } from '@constants';
import { useCurrentSubscription } from '@hooks/useCurrentSubscription';
import { useMonthlyUsage } from '@hooks/useMonthlyUsage';

const date = moment();
const defaultUsage = {
  usage: 0,
  quota: 0,
  limit: 10000,
};

export const HomeContext = createContext<{
  chatSubscription: Subscription | null;
  isChatSubscriptionLoading: boolean;
  supportSubscription: Subscription | null;
  isSupportSubscriptionLoading: boolean;
  chatUsage: {
    [key: string]: {
      usage: number;
      quota: number;
      limit: number;
    };
  };
}>({
  chatSubscription: null,
  isChatSubscriptionLoading: false,
  supportSubscription: null,
  isSupportSubscriptionLoading: false,
  chatUsage: {
    [ChatFeatureName.MonthlyActiveUser]: defaultUsage,
    [ChatFeatureName.PeakConnection]: defaultUsage,
  },
});

export const HomeContextProvider = ({ children }) => {
  const { currentSubscription: chatSubscription, isLoading: isChatSubscriptionLoading } = useCurrentSubscription(
    SubscriptionProduct.Chat,
  );
  const { currentSubscription: supportSubscription, isLoading: isSupportSubscriptionLoading } = useCurrentSubscription(
    SubscriptionProduct.Support,
  );
  const { monthlyUsage } = useMonthlyUsage(date);

  const chatUsage = {
    [ChatFeatureName.MonthlyActiveUser]:
      monthlyUsage && chatSubscription
        ? {
            usage: monthlyUsage.mau,
            quota: chatSubscription.plan['mau'].purchased_units,
            limit: chatSubscription.plan['mau'].hard_limit,
          }
        : defaultUsage,
    [ChatFeatureName.PeakConnection]:
      monthlyUsage && chatSubscription
        ? {
            usage: monthlyUsage.pc,
            quota: chatSubscription.plan['pc'].purchased_units,
            limit: chatSubscription.plan['pc'].hard_limit,
          }
        : defaultUsage,
  };
  return (
    <HomeContext.Provider
      value={{
        chatSubscription,
        isChatSubscriptionLoading,
        supportSubscription,
        isSupportSubscriptionLoading,
        chatUsage,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};
