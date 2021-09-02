import { useIntl } from 'react-intl';

import { BillingSubtitle, BillingSubDescription } from './components';

export const OtherMethod = () => {
  const intl = useIntl();
  return (
    <>
      <BillingSubtitle>
        {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.other.title' })}
      </BillingSubtitle>
      <BillingSubDescription>
        {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.other.description' })}
      </BillingSubDescription>
    </>
  );
};
