import React, { createContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import moment, { Moment } from 'moment-timezone';

import { useMonthlyUsage } from '@hooks/useMonthlyUsage';
import { useSubscriptionByMonth } from '@hooks/useSubscriptionByMonth';

interface UsageContextProps {
  date: Moment;
  setDate: React.Dispatch<React.SetStateAction<Moment>>;

  isLoadingSubscription: boolean;
  subscription: Subscription | null;
  isLoadingUsage: boolean;
  monthlyUsage?: MonthlyFeatureUsage;
}

export const UsageContext = createContext<UsageContextProps>({
  date: moment(),
  setDate: () => {},
  subscription: null,
  isLoadingSubscription: true,
  isLoadingUsage: true,
} as UsageContextProps);

export const UsageContextProvider = ({ children }) => {
  const history = useHistory<{ targetDate: string } | undefined>();
  const [date, setDate] = useState(moment());

  const { isLoading: isLoadingSubscription, subscription } = useSubscriptionByMonth(date);
  const { isLoadingUsage, monthlyUsage } = useMonthlyUsage(date);

  useEffect(() => {
    const { state } = history.location;
    if (state?.targetDate) {
      setDate(moment(state.targetDate));
    }
  }, [history.location]);

  return (
    <UsageContext.Provider
      value={{
        date,
        setDate,
        isLoadingSubscription,
        subscription,
        isLoadingUsage,
        monthlyUsage,
      }}
    >
      {children}
    </UsageContext.Provider>
  );
};
