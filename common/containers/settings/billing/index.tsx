import React from 'react';
import { TypedUseSelectorHook, useSelector } from 'react-redux';

import { SpinnerFull } from '@ui/components';

import { SettingsHeader, SettingsCardGroup } from '../../layout/settingsLayout';
import { CreditCardContextProvider } from './CreditCardContext';
import { BillingContacts } from './billingContacts';
import { CreditCard } from './creditCard';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export const Billing: React.FC = () => {
  const isLoading = useTypedSelector((state) => state.billing.fetchingCardInfo);

  return (
    <CreditCardContextProvider>
      <SettingsHeader title="Billing" />
      <SettingsCardGroup>
        {isLoading && <SpinnerFull transparent={true} />}
        <CreditCard />
        <BillingContacts />
      </SettingsCardGroup>
    </CreditCardContextProvider>
  );
};
