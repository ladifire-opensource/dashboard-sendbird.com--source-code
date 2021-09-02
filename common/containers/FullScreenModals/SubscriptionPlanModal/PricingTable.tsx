import { FC } from 'react';
import { IntlShape, useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Link, Typography, Headings } from 'feather';
import qs from 'qs';

import { SlideTransition } from '@ui/components/SlideTransition';

import { TitleContainer, TitleText, TitleSuffix, TableWrapper, Column, Row, TableSection } from './components/table';
import { getFormattedPlanFee, isTalkToSalesPlan } from './utils';

const PricingRow = styled(Row)<{ showStarter1kOption: boolean }>`
  grid-template-columns: ${({ showStarter1kOption }) =>
    showStarter1kOption ? '2.8fr repeat(6, 1fr)' : '3.8fr repeat(5, 1fr)'};

  ${Column} {
    ${Headings['heading-01']};
    font-weight: 600;
  }
`;

const PricingHeader = styled(PricingRow)`
  padding: 28px 8px;
  ${Column} {
    ${Typography['label-03']};
    font-weight: 600;
  }
`;

const UnderlinedLink = styled(Link).attrs({
  useReactRouter: true,
})`
  text-decoration: underline;
  font-weight: 500;
`;

const EnterpriseColumn = styled(Column)<{ showStarter1kOption: boolean }>`
  grid-column: ${({ showStarter1kOption }) => (showStarter1kOption ? '2 / span 6' : '2 / span 5')};
  justify-content: center;
`;

type Params = {
  plans: { starter: SubscriptionPlan[]; pro: SubscriptionPlan[] };
  intl: IntlShape;
  showStarter1kOption: boolean;
};

const renderPricingTableBody = ({ plans, intl, showStarter1kOption }: Params) => {
  const getTalkToSalesLink = (planName: string) => {
    const params = qs.stringify({
      category: 'sales_inquiry',
      subject: intl.formatMessage(
        { id: 'common.subscriptionPlanDialog.talkToSales.supportForm.subject' },
        { planName },
      ),
    });

    return (
      <UnderlinedLink href={`/settings/contact_us?${params}`}>
        {intl.formatMessage({ id: 'common.pricing.table.td.talkToSales' })}
      </UnderlinedLink>
    );
  };

  const getColumnNode = (plan: SubscriptionPlan) =>
    isTalkToSalesPlan(plan.subscriptionName) ? getTalkToSalesLink(plan.displayName) : getFormattedPlanFee(plan.baseFee);

  return (
    <>
      {/* starter */}
      <SlideTransition delay={0 / 30} from="bottom">
        <PricingRow showStarter1kOption={showStarter1kOption}>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.planType.starter' })}</Column>
          {plans.starter
            .filter((plan) => showStarter1kOption || plan.subscriptionName !== 'plan_a_1k')
            .map((plan) => (
              <Column key={plan.subscriptionName}>{getColumnNode(plan)}</Column>
            ))}
        </PricingRow>
      </SlideTransition>
      {/* pro */}
      <SlideTransition delay={1 / 30} from="bottom">
        <PricingRow showStarter1kOption={showStarter1kOption}>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.planType.pro' })}</Column>
          {showStarter1kOption && <Column></Column>}
          {plans.pro.map((plan) => (
            <Column key={plan.subscriptionName}>{getColumnNode(plan)}</Column>
          ))}
        </PricingRow>
      </SlideTransition>
      {/* enterprise */}
      <SlideTransition delay={2 / 30} from="bottom">
        <PricingRow showStarter1kOption={showStarter1kOption}>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.planType.enterprise' })}</Column>
          <EnterpriseColumn showStarter1kOption={showStarter1kOption}>
            {getTalkToSalesLink(intl.formatMessage({ id: 'common.pricing.table.planType.enterprise' }))}
          </EnterpriseColumn>
        </PricingRow>
      </SlideTransition>
    </>
  );
};

type Props = {
  plans: { starter: SubscriptionPlan[]; pro: SubscriptionPlan[] };
  showStarter1kOption: boolean;
};

const PricingTable: FC<Props> = ({ plans, showStarter1kOption }) => {
  const intl = useIntl();
  return (
    <TableSection>
      <TitleContainer>
        <TitleText>{intl.formatMessage({ id: 'common.pricing.table.title' })}</TitleText>
        <TitleSuffix
          css={css`
            grid-column: 2 / span 2;
            justify-content: flex-end;
          `}
        >
          {intl.formatMessage({ id: 'common.pricing.table.billedMonthly' })}
        </TitleSuffix>
      </TitleContainer>

      <TableWrapper>
        <PricingHeader showStarter1kOption={showStarter1kOption}>
          <Column />
          {showStarter1kOption && <Column>{intl.formatMessage({ id: 'common.pricing.table.th.1k' })}</Column>}
          <Column>{intl.formatMessage({ id: 'common.pricing.table.th.5k' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.th.10k' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.th.25k' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.th.50k' })}</Column>
          <Column>{intl.formatMessage({ id: 'common.pricing.table.th.100k' })}</Column>
        </PricingHeader>

        {renderPricingTableBody({ plans, intl, showStarter1kOption })}
      </TableWrapper>
    </TableSection>
  );
};

export default PricingTable;
