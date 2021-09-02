import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Spinner } from 'feather';
import moment from 'moment-timezone';
import numbro from 'numbro';

import { DEFAULT_DATE_FORMAT, EMPTY_TEXT } from '@constants';
import { ChevronLink } from '@ui/components';
import { InformationCard, contentStyle } from '@ui/components/InformationCard';

const Wrapper = styled(InformationCard)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-column-gap: 24px;
  min-height: 138px;

  .subscriptionSpinner {
    width: 100%;
    height: 90px;

    grid-column: 1 / span 2;
  }
`;

const Section = styled.div`
  ${contentStyle}
`;

const SectionContent = styled.div`
  padding-top: 12px;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: -0.25px;
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
`;

const SectionContentNormal = styled.span`
  font-weight: 400;
  vertical-align: baseline;
`;

type Props = {
  isLoading: boolean;
  subscription: Subscription | null;
};

export const SubscriptionStatus: FC<Props> = ({ isLoading, subscription }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      {isLoading && !subscription ? (
        <Spinner className="subscriptionSpinner" />
      ) : (
        <>
          <Section>
            <h4>{intl.formatMessage({ id: 'common.settings.billing.subscription.plan.label' })}</h4>
            <SectionContent data-test-id="CurrentPlanInformation">
              {subscription?.display_name ?? EMPTY_TEXT}{' '}
              <SectionContentNormal>
                {' '}
                {subscription?.plan_value
                  ? ` : USD ${numbro(subscription?.plan_value / 100).format('0,0.00')}/month`
                  : ''}
              </SectionContentNormal>
            </SectionContent>
            <ChevronLink href="/settings/general">
              {intl.formatMessage({ id: 'common.settings.billing.subscription.plan.changePlan' })}
            </ChevronLink>
          </Section>
          {subscription?.next_billing_date && (
            <Section>
              <h3>{intl.formatMessage({ id: 'common.settings.billing.subscription.next.label' })}</h3>
              <SectionContent data-test-id="NextBillingDate">
                {moment(subscription?.next_billing_date).format(DEFAULT_DATE_FORMAT)}
              </SectionContent>
            </Section>
          )}
        </>
      )}
    </Wrapper>
  );
};
