import { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { SettingsCardGroup, SettingsGridCard } from '@common/containers/layout';
import { SubscriptionProduct, SubscriptionName } from '@constants';
import { useTypedSelector } from '@hooks';
import { useCurrentSubscription } from '@hooks/useCurrentSubscription';
import { useIsCallsActivatedOrganization } from '@hooks/useIsCallsActivatedOrganization';

import { CallsCredits } from './CallsCredits';
import { CreditCard } from './CreditCard';
import { OtherMethod } from './OtherMethod';
import { SubscriptionStatus } from './SubscriptionStatus';
import { WireTransfer } from './WireTransfer';
import { BillingContacts } from './billingContacts';

export const BillingInfo = () => {
  const intl = useIntl();

  const { isLoading, currentSubscription: subscription } = useCurrentSubscription(SubscriptionProduct.Chat);
  const isCallsActivatedOrganization = useIsCallsActivatedOrganization();
  const paymentMethod = useTypedSelector((state) => state.organizations.current.payment_method);

  const isFreeTrial = subscription?.subscription_name === SubscriptionName.FreeTrial;

  const renderedPaymentMethods = useMemo(() => {
    if (paymentMethod === 'MANUAL') {
      return <OtherMethod />;
    }
    if (paymentMethod === 'WIRE') {
      return <WireTransfer />;
    }
    return <CreditCard isFreeTrial={isFreeTrial} />;
  }, [paymentMethod, isFreeTrial]);

  return (
    <>
      <SubscriptionStatus isLoading={isLoading} subscription={subscription} />
      {isCallsActivatedOrganization && <CallsCredits />}
      <SettingsCardGroup>
        <SettingsGridCard
          title={intl.formatMessage({ id: 'common.settings.billing.paymentMethod.title' })}
          gridItemConfig={
            isFreeTrial
              ? {}
              : {
                  subject: {
                    alignSelf: 'start',
                  },
                }
          }
        >
          {renderedPaymentMethods}
        </SettingsGridCard>
      </SettingsCardGroup>
      <SettingsCardGroup>
        <BillingContacts />
      </SettingsCardGroup>
    </>
  );
};
