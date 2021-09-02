import { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { Spinner } from 'feather';

import { fetchACHCreditTransferSource } from '@common/api';
import { useAsync, useTypedSelector, useErrorToast } from '@hooks';

import {
  BillingSubtitle,
  BillingSubDescription,
  BillingInformationWrapper,
  BillingInformationLabel,
  BillingInformationContent,
} from './components';

const useFetchACHCreditTransferSource = () => {
  const organizationUID = useTypedSelector((state) => state.organizations.current.uid);
  const [{ status, data, error }, load] = useAsync(() => fetchACHCreditTransferSource(organizationUID), [
    organizationUID,
  ]);

  useEffect(() => {
    load();
  }, [load]);

  useErrorToast(error);
  return {
    isLoading: status === 'loading',
    data: data?.data || null,
  };
};

export const WireTransfer = () => {
  const intl = useIntl();
  const { isLoading, data } = useFetchACHCreditTransferSource();
  return (
    <>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <BillingSubtitle>
            {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.wire.title' })}
          </BillingSubtitle>
          <BillingSubDescription>
            {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.wire.description' })}
          </BillingSubDescription>
          <BillingInformationWrapper>
            <BillingInformationLabel>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.wire.label.bankName' })}
            </BillingInformationLabel>
            <BillingInformationContent>{data?.bank_name}</BillingInformationContent>
            <BillingInformationLabel>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.wire.label.routingNumber' })}
            </BillingInformationLabel>
            <BillingInformationContent>{data?.routing_number}</BillingInformationContent>
            <BillingInformationLabel>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.wire.label.accountNumber' })}
            </BillingInformationLabel>
            <BillingInformationContent>{data?.account_number}</BillingInformationContent>
            <BillingInformationLabel>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.wire.label.swiftCode' })}
            </BillingInformationLabel>
            <BillingInformationContent>{data?.swift_code}</BillingInformationContent>
          </BillingInformationWrapper>
        </>
      )}
    </>
  );
};
