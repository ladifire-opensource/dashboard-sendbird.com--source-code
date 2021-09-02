import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Spinner, Button, cssVariables } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { useAuthorization } from '@hooks';
import { isCardImageExists, getCardImage } from '@utils';

import { useCreditCardDialog, useCreditCardInfo } from '../billing/CreditCardContext';
import {
  BillingSubtitle,
  BillingInformationWrapper,
  BillingInformationLabel,
  BillingInformationContent,
} from './components';

const CardInfoFreeTrial = styled.div`
  padding: 14px 0;
  font-size: 14px;
  line-height: 20px;
  color: ${cssVariables('neutral-7')};
`;

const CardInfoRow = styled.div``;

const CardNumber = styled.span``;

const CardIcon = styled.img`
  height: 20px;
  margin-right: 8px;
`;

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 148px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RegisterCardButton = styled(Button)`
  margin-top: 12px;
`;

type Props = {
  isFreeTrial: boolean;
};

export const CreditCard: FC<Props> = ({ isFreeTrial }) => {
  const intl = useIntl();

  const { isPermitted } = useAuthorization();

  const { isLoading, cardInfo, load } = useCreditCardInfo();

  const { open: openCreditCardDialog } = useCreditCardDialog(load);

  const renderedCardInformation = useMemo(() => {
    if (isEmpty(cardInfo) && isPermitted(['organization.billing.all'])) {
      return (
        <CardInfoRow>
          <RegisterCardButton buttonType="primary" onClick={openCreditCardDialog} data-test-id="RegisterCardButton">
            {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.addCard' })}
          </RegisterCardButton>
        </CardInfoRow>
      );
    }
    if (cardInfo) {
      return (
        <>
          <BillingSubtitle>
            {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.title' })}
          </BillingSubtitle>
          <BillingInformationWrapper>
            <BillingInformationLabel>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.label.name' })}
            </BillingInformationLabel>
            <BillingInformationContent data-test-id="CardOwnerName">{cardInfo.name}</BillingInformationContent>
            {isCardImageExists(cardInfo) && (
              <>
                <BillingInformationLabel>
                  {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.label.cardNumber' })}
                </BillingInformationLabel>
                <BillingInformationContent>
                  <CardIcon data-test-id="CardIcon" src={getCardImage(cardInfo.brand)} role="presentation" />
                  <CardNumber data-test-id="CardNumber">**** **** **** {cardInfo.last4}</CardNumber>
                </BillingInformationContent>
              </>
            )}
            <BillingInformationLabel>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.label.expiryDate' })}
            </BillingInformationLabel>
            <BillingInformationContent data-test-id="CardExpiryDate">
              {cardInfo.exp_month} / {cardInfo.exp_year}
            </BillingInformationContent>
          </BillingInformationWrapper>
          {isPermitted(['organization.billing.all']) && (
            <RegisterCardButton buttonType="tertiary" onClick={openCreditCardDialog} data-test-id="RegisterCardButton">
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.changeCard' })}
            </RegisterCardButton>
          )}
        </>
      );
    }
    if (isFreeTrial) {
      return (
        <>
          <BillingSubtitle>
            {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.title' })}
          </BillingSubtitle>
          <BillingInformationWrapper>
            <CardInfoFreeTrial>
              {intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.free' })}
            </CardInfoFreeTrial>
          </BillingInformationWrapper>
        </>
      );
    }
    return <div>{intl.formatMessage({ id: 'common.settings.billing.paymentMethod.creditCard.noCard' })}</div>;
  }, [cardInfo, intl, isFreeTrial, isPermitted, openCreditCardDialog]);

  return (
    <>
      {isLoading ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        renderedCardInformation
      )}
    </>
  );
};
