import React from 'react';

import styled from 'styled-components';

import { Button } from 'feather';

import { useAuthorization } from '@hooks';
import { Table, Header, Row, Body, Column } from '@ui/components';
import { isEmpty, getCardImage, isCardImageExists } from '@utils';

import { SettingsCard } from '../../layout';
import { useCreditCardDialog, useCreditCardInfo } from './CreditCardContext';

const FlatTable = styled(Table)`
  box-shadow: none;
`;

const RegisterCardButton = styled(Button)`
  right: -24px;
`;

const CreditIcon = styled.img`
  max-width: 35px;
  margin-right: 8px;
`;

const commonColumnStyles = {
  alignItems: 'flex-start',
};

const columnStyles = [
  { ...commonColumnStyles, width: 140 },
  { ...commonColumnStyles, flex: 5 },
  { ...commonColumnStyles, flex: 2 },
  { ...commonColumnStyles, flex: 2 },
  { ...commonColumnStyles, width: 140, alignItems: 'flex-end' },
];

export const CreditCard: React.FC = () => {
  const { isPermitted } = useAuthorization();

  const { cardInfo } = useCreditCardInfo();

  const { open: openCreditCardDialog } = useCreditCardDialog();

  if (cardInfo == null || isEmpty(cardInfo)) {
    return (
      <SettingsCard title="Credit card" description="No credit card registered." stretchLabel={true}>
        <Button
          buttonType="primary"
          onClick={openCreditCardDialog}
          disabled={!isPermitted(['organization.billing.all'])}
        >
          Add credit card
        </Button>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard title="Credit card" singleColumn={true}>
      <FlatTable>
        <Header>
          <Row>
            <Column styles={columnStyles[0]}>Card Type</Column>
            <Column styles={columnStyles[1]}>Number</Column>
            <Column styles={columnStyles[2]}>Name</Column>
            <Column styles={columnStyles[3]}>Expiration</Column>
            <Column styles={columnStyles[4]} />
          </Row>
        </Header>
        <Body>
          <Row>
            <Column styles={columnStyles[0]}>
              {isCardImageExists(cardInfo) && <CreditIcon src={getCardImage(cardInfo.brand)} role="presentation" />}
            </Column>
            <Column styles={columnStyles[1]}>**** **** **** {cardInfo.last4}</Column>
            <Column styles={columnStyles[2]}>{cardInfo.name}</Column>
            <Column styles={columnStyles[3]}>
              {cardInfo.exp_month} / {cardInfo.exp_year}
            </Column>
            <Column styles={columnStyles[4]}>
              {isPermitted(['organization.billing.all']) && (
                <RegisterCardButton size="small" buttonType="tertiary" onClick={openCreditCardDialog}>
                  Change Card
                </RegisterCardButton>
              )}
            </Column>
          </Row>
        </Body>
      </FlatTable>
    </SettingsCard>
  );
};
