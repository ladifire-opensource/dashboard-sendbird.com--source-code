import { useContext, useCallback, ComponentProps, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import addDays from 'date-fns/addDays';
import addMonths from 'date-fns/addMonths';
import format from 'date-fns/format';
import setDate from 'date-fns/setDate';
import {
  Headings,
  cssVariables,
  Button,
  LozengeVariant,
  Lozenge,
  Icon,
  Subtitles,
  InlineNotification,
  Spinner,
  Link,
  ContextualHelp,
} from 'feather';

import { SubscriptionInfoContext } from '@/SubscriptionInfoContext';
import { isTalkToSalesPlan } from '@common/containers/FullScreenModals/SubscriptionPlanModal/utils';
import { SettingsGridCard } from '@common/containers/layout';
import { SubscriptionProduct, SubscriptionName, DATE_FNS_DEFAULT_DATE_FORMAT } from '@constants';
import useAuthentication from '@hooks/useAuthentication';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';

const GridTitle = styled.div<{ isFlexDirectionColumn?: boolean }>`
  display: flex;
  justify-content: center;
  ${({ isFlexDirectionColumn }) =>
    isFlexDirectionColumn
      ? css`
          flex-direction: column;
          ${Lozenge} {
            margin-top: 8px;
          }
        `
      : css`
          ${Lozenge} {
            margin-left: 8px;
          }
        `};
`;

const SpinnerWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 117px;
`;

const Current = styled.div`
  ${Headings['heading-06']};
  color: ${cssVariables('neutral-10')};
`;

const Future = styled.div`
  display: flex;
  align-items: center;
  ${Headings['heading-06']};
  color: ${cssVariables('neutral-5')};
  svg {
    margin: 0 16px;
    fill: ${cssVariables('neutral-5')};
  }
`;

const PlanAction = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  a {
    font-size: 14px;
    margin-top: 8px;
  }
`;

const Plan = styled.div<{ hasPlan: boolean }>`
  display: flex;
  align-items: flex-start;
  margin-right: -24px;
  padding-right: 24px;

  ${({ hasPlan }) =>
    hasPlan &&
    `
  padding-bottom: 24px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  margin-bottom: 24px;
  `}

  ${PlanAction} {
    margin-left: auto;
  }
`;

const PlanItems = styled.div`
  display: flex;
  align-items: center;
`;

const Information = styled.ul`
  & + .subscriptionPlanNotification {
    margin-top: 24px;
  }
`;

const InformationItem = styled.li`
  display: flex;
  align-items: center;
  height: 24px;
  ${Lozenge} {
    margin-left: 8px;
  }
  & + & {
    margin-top: 8px;
  }
`;

const InformationLabel = styled.div`
  width: 160px;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};
`;

const InformationText = styled.div`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-7')};
`;

export const SubscriptionPlan = () => {
  const intl = useIntl();
  const history = useHistory();

  const { isOrganizationDeactivated } = useAuthentication();

  const { isLoading, subscriptions, fetchSubscriptions } = useContext(SubscriptionInfoContext);
  const { current, future } = subscriptions[SubscriptionProduct.Chat];

  const isCurrentFreePlan =
    current != null && [SubscriptionName.FreeTrial, SubscriptionName.Free].includes(current.subscription_name);

  const isCurrentPlanEnding = current != null && typeof current.end_date === 'string';
  const isFuturePlanExist = future != null;

  const isUnsubscribing = isCurrentPlanEnding && !isCurrentFreePlan && !isFuturePlanExist;
  const isUnsubscribed = current == null && !isLoading;
  const isPlanChangeScheduled = (!isCurrentFreePlan && isCurrentPlanEnding) || isFuturePlanExist;

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleUpgradeButtonClick = useCallback(() => {
    history.push('/settings/general/plans/chat', { background: history.location });
  }, [history]);

  const renderPlanAction = (disabled = false) => {
    if (isOrganizationDeactivated) {
      return (
        <Button buttonType="primary" onClick={handleUpgradeButtonClick} data-test-id="ResubscribeButton">
          {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.button.resubscribe' })}
        </Button>
      );
    }

    return (
      <Button
        data-test-id="ChangePlanLinkButton"
        buttonType="primary"
        onClick={handleUpgradeButtonClick}
        disabled={disabled}
      >
        {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.button.change' })}
      </Button>
    );
  };

  const formatTimeAgo = useFormatTimeAgo();

  const renderInformation = () => {
    if (future) {
      return (
        <Information>
          {/* TODO: add requested_by logics to the billing */}
          {/* <InformationItem>
            <InformationLabel>
              {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.requestedBy' })}
            </InformationLabel>
            <InformationText>{future.requested_by}</InformationText>
          </InformationItem> */}
          <InformationItem>
            <InformationLabel>
              {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.applyDate' })}
            </InformationLabel>
            <InformationText>{format(new Date(future.start_date), DATE_FNS_DEFAULT_DATE_FORMAT)}</InformationText>
          </InformationItem>
        </Information>
      );
    }
    if (current) {
      if (current.end_date && isUnsubscribing) {
        return (
          <Information>
            <InformationItem>
              <InformationLabel>
                {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.applyDate' })}
              </InformationLabel>
              <InformationText data-test-id="EffectiveDate">
                {/* Effective date
                Sales-driven : end_date + 1 day
                Self-serve : 1st of next month */}
                {isTalkToSalesPlan(current.subscription_name)
                  ? format(addDays(new Date(current.end_date), 1), DATE_FNS_DEFAULT_DATE_FORMAT)
                  : format(setDate(addMonths(new Date(current.end_date), 1), 1), DATE_FNS_DEFAULT_DATE_FORMAT)}
              </InformationText>
            </InformationItem>
          </Information>
        );
      }
      if (current.subscription_name === SubscriptionName.FreeTrial) {
        return (
          <Information>
            <InformationItem>
              <InformationLabel>
                {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.expirationDate' })}
              </InformationLabel>
              {current.end_date && (
                <>
                  <InformationText data-test-id="ExpirationDate">
                    {format(new Date(current.end_date), DATE_FNS_DEFAULT_DATE_FORMAT)}
                  </InformationText>
                  <Lozenge variant={LozengeVariant.Light} color="red">
                    {formatTimeAgo(new Date(current.end_date))}
                  </Lozenge>
                </>
              )}
            </InformationItem>
          </Information>
        );
      }
      return (
        <Information>
          <InformationItem>
            <InformationLabel>
              {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.subscriptionDate' })}
            </InformationLabel>
            <InformationText data-test-id="SubscribedDate">
              {format(new Date(current.start_date), DATE_FNS_DEFAULT_DATE_FORMAT)}
            </InformationText>
          </InformationItem>
        </Information>
      );
    }
  };

  const renderInlineNotification = () => {
    let props: Pick<ComponentProps<typeof InlineNotification>, 'type' | 'message'> = {
      type: 'info',
      message: '',
    };
    if (future) {
      props = {
        type: 'info',
        message: intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.notifications.future' }),
      };
      return <InlineNotification className="subscriptionPlanNotification" {...props} />;
    }
    if (current && current.subscription_name === SubscriptionName.FreeTrial && !future) {
      props = {
        type: 'info',
        message: intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.notifications.freeTrial.expires' }),
      };
      return <InlineNotification className="subscriptionPlanNotification" {...props} />;
    }
  };

  const planLozenge = useMemo(() => {
    if (isOrganizationDeactivated) {
      return (
        <Lozenge variant={LozengeVariant.Light} color="red">
          {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.lozenge.deactivated' })}
        </Lozenge>
      );
    }
    if (isPlanChangeScheduled) {
      return (
        <Lozenge variant={LozengeVariant.Light} color="blue">
          {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.lozenge.scheduled' })}
        </Lozenge>
      );
    }
    if (isUnsubscribed) {
      return (
        <Lozenge variant={LozengeVariant.Light} color="red">
          {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.lozenge.unsubscribed' })}
        </Lozenge>
      );
    }
    return null;
  }, [intl, isOrganizationDeactivated, isPlanChangeScheduled, isUnsubscribed]);

  const isSalesCustom = !!current && current.subscription_type === 'SALES_CUSTOM';

  return (
    <SettingsGridCard
      title={
        <GridTitle
          isFlexDirectionColumn={isOrganizationDeactivated || isUnsubscribed}
          data-test-id="SubscriptionPlanSettingsTitle"
        >
          {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.title' })}
          {planLozenge}
        </GridTitle>
      }
      titleColumns={4}
      gridItemConfig={{
        subject: {
          alignSelf: 'start',
        },
      }}
    >
      {isLoading && !current ? (
        <SpinnerWrapper>
          <Spinner />
        </SpinnerWrapper>
      ) : (
        <>
          <Plan hasPlan={!!current}>
            <PlanItems>
              <Current data-test-id="CurrentPlanDisplayName">{current?.display_name}</Current>
              {isUnsubscribing && (
                <Future>
                  <Icon icon="arrow-right" size={24} />
                  {intl.formatMessage({ id: 'common.settings.general.subscriptionPlan.unsubscribe' })}
                </Future>
              )}
              {future && (
                <Future data-test-id="NextPlanName">
                  <Icon icon="arrow-right" size={24} />
                  {future.display_name}
                </Future>
              )}
            </PlanItems>
            <PlanAction>
              {isSalesCustom ? (
                <ContextualHelp
                  content={intl.formatMessage(
                    {
                      id: 'common.settings.general.subscriptionPlan.tooltip.salesDriven.restricted',
                    },
                    {
                      a: (talkToSalesText) => (
                        <Link
                          href="/settings/contact_us?category=pricing"
                          useReactRouter={true}
                          iconProps={{ icon: 'open-in-new', size: 16 }}
                          css="text-decoration: underline;"
                        >
                          {talkToSalesText}
                        </Link>
                      ),
                    },
                  )}
                  tooltipContentStyle={css`
                    width: 256px;
                  `}
                  placement="bottom-end"
                  popperProps={{
                    modifiers: {
                      offset: {
                        offset: '0, 10',
                      },
                    },
                  }}
                >
                  {renderPlanAction(true)}
                </ContextualHelp>
              ) : (
                renderPlanAction()
              )}
            </PlanAction>
          </Plan>
          {renderInformation()}
          {renderInlineNotification()}
        </>
      )}
    </SettingsGridCard>
  );
};
