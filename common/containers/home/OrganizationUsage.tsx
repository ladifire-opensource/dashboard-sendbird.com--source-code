import { Fragment, FC, ReactNode, useContext, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { Body, Button, cssVariables, Headings, Link, SpinnerFull, Subtitles } from 'feather';
import moment from 'moment-timezone';

import { EMPTY_TEXT, FULL_MONTH_DATE_FORMAT, PredefinedRoles, SubscriptionName, ChatFeatureName } from '@constants';
import { useAuthorization, useShowDialog } from '@hooks';
import { useIsCallsActivatedOrganization } from '@hooks/useIsCallsActivatedOrganization';
import { Card, makeGrid, Usage, UsageAlertIcon, VoucherSubscriptionStatus } from '@ui/components';
import { CallsUsage as CallsUsageChart } from '@ui/components/CallsUsage';
import { getUsageTooltipText } from '@ui/components/usage/getUsageTooltipText';

import {
  UsageStatus,
  useVoucherLoader,
  useLatestVoucher,
  useSubscription,
  useVoucherExpirationStatus,
  useVoucherAlert,
} from '../CallsVoucherContext';
import { DialogType } from '../dialogs/DialogType';
import { HomeContext } from './HomeContext';

enum SubscriptionStatus {
  ON,
  OFF,
  PAYMENT_DECLINED,
}

const { ResponsiveContainer, wideGridMediaQuery } = makeGrid({
  wideWidth: 1008,
  narrowMaxWidth: 820,
});

const Wrapper = styled.div`
  width: 100%;
  min-width: 1024px;
  background: ${cssVariables('neutral-1')};
  padding: 32px 0;
`;

const Container = styled(ResponsiveContainer)`
  display: block;

  > div:not(:last-child) {
    min-height: 347px;
  }

  ${wideGridMediaQuery`
  padding-left: 16px !important;
  padding-right: 16px !important;
`}
`;

const UsageGrid = styled.div<{ columns: number }>`
  display: grid;

  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  grid-column-gap: 32px;

  & + & {
    margin-top: 16px;
  }
`;

const UsageSection = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;

  a {
    font-weight: 600;
    font-size: 14px;
    margin-left: auto;
  }
`;

const UsageTitle = styled.div`
  ${Headings['heading-03']};
  color: ${cssVariables('neutral-10')};
  font-weight: 600;
  margin-bottom: 8px;
`;

const UsageCard = styled(Card)`
  width: 100%;
  flex: 1;
`;

const UsageItems = styled.div`
  display: grid;
  grid-row-gap: 16px;
`;

const UsageCardHeader = styled.div<{ isCallsActive?: boolean }>`
  padding: 24px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  display: flex;
  ${({ isCallsActive }) =>
    isCallsActive &&
    css`
      min-height: 92px;
    `}

  button {
    margin-left: auto;
  }
`;

const UsageCardBody = styled.div`
  padding: 24px;
`;

const UsageCardTitle = styled.h3`
  display: flex;
  align-items: center;
  ${Headings['heading-01']}
  color: ${cssVariables('neutral-10')};
  margin-bottom: 8px;
`;

const DList = styled.dl`
  display: grid;
  grid-template-columns: 108px 1fr;
  align-items: flex-start;
  grid-gap: 4px 16px;
`;

const Label = styled.dt.attrs({
  'data-test-id': 'Label',
})`
  ${Subtitles['subtitle-01']};
  color: ${cssVariables('neutral-6')};
`;

const Value = styled.dd.attrs({
  'data-test-id': 'Value',
})<{ $strong?: boolean; $color?: 'red' | 'yellow' | 'neutral' }>`
  ${Subtitles['subtitle-01']};
  display: flex;
  align-items: center;
  color: ${(props) =>
    props.$color
      ? { red: cssVariables('red-5'), yellow: cssVariables('yellow-5'), neutral: cssVariables('neutral-10') }[
          props.$color
        ] ?? 'neutral'
      : 'neutral'};
  ${(props) => props.$strong && 'font-weight: 600;'};

  & > p {
    margin-top: 4px;
    ${Body['body-short-01']};
    color: ${cssVariables('neutral-7')};
  }
`;

type Props = {
  organization: Organization;
};

const useChatSubscription = () => {
  const organization = useSelector((state: RootState) => state.organizations.current);
  const { role } = useAuthorization();
  const {
    chatSubscription: subscription,
    chatUsage: usage,
    supportSubscription: support,
    isChatSubscriptionLoading,
    isSupportSubscriptionLoading,
  } = useContext(HomeContext);

  /* FIXME: replace role with suitable permission set */
  const isAuthorized = [PredefinedRoles.OWNER, PredefinedRoles.ADMIN].includes(role.name);
  const isSelfService = organization.is_self_serve;
  const isFreeTrial = subscription?.subscription_name === 'free_trial';
  const willBeExpired = !!(isFreeTrial && subscription?.end_date);

  return {
    subscription,
    support,
    usage,
    isAuthorized,
    isSelfService,
    isFreeTrial,
    willBeExpired,
    isChatSubscriptionLoading,
    isSupportSubscriptionLoading,
  };
};

const Support: FC<{
  name?: string;
  isLoading?: boolean;
  onClickChangeButton: () => void;
}> = ({ name = 'Community', isLoading, onClickChangeButton }) => {
  const intl = useIntl();
  return (
    <UsageGrid columns={1}>
      <UsageSection>
        <UsageTitle>Support</UsageTitle>
        <UsageCard>
          <UsageCardHeader style={{ borderBottom: 'none' }}>
            <DList data-test-id="SupportPlan">
              <Label>Support plan</Label>
              <Value css="display: block;">
                {isLoading ? EMPTY_TEXT : name}
                <p>Services provided to your organization according to the subscribed support plan.</p>
              </Value>
            </DList>
            <Button buttonType="tertiary" size="small" onClick={onClickChangeButton}>
              {intl.formatMessage({ id: 'common.home.supportPlan.manage' })}
            </Button>
          </UsageCardHeader>
        </UsageCard>
      </UsageSection>
    </UsageGrid>
  );
};

const ExpiresOn: FC<{
  expiredAt?: string;
  status: UsageStatus;
  showAlert: boolean;
}> = ({ expiredAt, status, showAlert }) => {
  const intl = useIntl();
  const alert = showAlert
    ? ({
        [UsageStatus.Warn]: {
          color: 'bg-warning',
          strong: true,
          tooltip: intl.formatMessage({ id: 'common.home.callsUsage.expiresOn.warn' }),
        },
        [UsageStatus.Error]: {
          color: 'bg-negative',
          strong: true,
          tooltip: intl.formatMessage({ id: 'common.home.callsUsage.expiresOn.error' }),
        },
      } as const)[status]
    : null;

  return (
    <>
      <Label>{intl.formatMessage({ id: 'common.home.callsUsage.expiresOn.label' })}</Label>
      <Value $color={alert?.color} $strong={alert?.strong}>
        {expiredAt ? moment(expiredAt).format(FULL_MONTH_DATE_FORMAT) : EMPTY_TEXT}
        {alert && <UsageAlertIcon icon="warning-filled" color={alert.color} tooltip={alert.tooltip} />}
      </Value>
    </>
  );
};

const AutoRechargeContainer = styled.div`
  margin-top: 8px;
  min-width: 68px;

  background: white;
  padding: 22px 24px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;

  display: grid;
  grid-template-columns: 110px 1fr auto;
  grid-gap: 0 16px;
  align-items: center;

  span:first-child {
    ${Headings['heading-01']};
  }
`;

const AutoRecharge: FC<{ status: SubscriptionStatus }> = ({ status }) => {
  const intl = useIntl();
  return (
    <AutoRechargeContainer>
      <span>{intl.formatMessage({ id: 'common.home.callsUsage.autoRecharge.label' })}</span>
      <VoucherSubscriptionStatus status={status} />
    </AutoRechargeContainer>
  );
};

const CallsUsage: FC<{
  onUpgradeClick: () => void;
}> = ({ onUpgradeClick }) => {
  const intl = useIntl();
  useVoucherLoader();

  const latestVoucher = useLatestVoucher();
  const subscription = useSubscription();
  const expirationStatus = useVoucherExpirationStatus();
  const showAlert = useVoucherAlert();

  if (!latestVoucher || !subscription || !expirationStatus) {
    return <SpinnerFull />;
  }
  const { balance, expireAt, usage, quota } = latestVoucher;

  return (
    <UsageSection data-test-id="CallsUsage">
      <UsageTitle>{intl.formatMessage({ id: 'common.home.callsUsage.title' })}</UsageTitle>
      <UsageCard>
        <UsageCardHeader>
          <DList>
            <Label>{intl.formatMessage({ id: 'common.home.callsUsage.balance' })}</Label>
            <Value>
              {balance.toLocaleString()} {intl.formatMessage({ id: 'common.home.callsUsage.creditUnit' })}
            </Value>
            <ExpiresOn expiredAt={expireAt} status={expirationStatus} showAlert={showAlert} />
          </DList>
          <Button buttonType="tertiary" size="small" onClick={onUpgradeClick}>
            {intl.formatMessage({ id: 'common.home.callsUsage.change' })}
          </Button>
        </UsageCardHeader>
        <UsageCardBody>
          <UsageCardTitle>{intl.formatMessage({ id: 'common.home.callsUsage.creditUsage' })}</UsageCardTitle>
          <UsageItems>
            <CallsUsageChart variant="compact" usage={usage} quota={quota} showAlert={showAlert} />
          </UsageItems>
        </UsageCardBody>
      </UsageCard>
      {subscription && <AutoRecharge status={subscription.status} />}
    </UsageSection>
  );
};

const ChatUsage: FC<{
  onUsageClick: () => void;
  onUpgradeClick: () => void;
  isCallsActive: boolean;
}> = ({ onUsageClick, onUpgradeClick, isCallsActive = false }) => {
  const intl = useIntl();
  const showDialog = useShowDialog();

  const handleOverageLinkClick = useCallback(() => {
    showDialog({ dialogTypes: DialogType.Overage });
  }, [showDialog]);

  const { subscription, usage, willBeExpired, isChatSubscriptionLoading } = useChatSubscription();

  if (isChatSubscriptionLoading) {
    return <SpinnerFull />;
  }

  if (!subscription) {
    return null;
  }

  const planItems = [
    {
      labelKey: 'common.home.organizationUsage.subscriptionPlan',
      value: <Value>{subscription.display_name}</Value>,
    },
    willBeExpired && {
      labelKey: 'common.home.organizationUsage.expiresOn',
      value: (
        <Value $color="red" $strong={true}>
          {moment(subscription.end_date).format(FULL_MONTH_DATE_FORMAT)}
        </Value>
      ),
    },
  ].filter(Boolean) as { labelKey: string; value: ReactNode }[];

  const usages = [
    {
      label: intl.formatMessage({ id: 'common.home.organizationUsage.usage.mau' }),
      ...usage[ChatFeatureName.MonthlyActiveUser],
    },
    {
      label: intl.formatMessage({ id: 'common.home.organizationUsage.usage.pc' }),
      ...usage[ChatFeatureName.PeakConnection],
    },
  ];

  return (
    <UsageSection>
      <UsageTitle>Chat</UsageTitle>
      <UsageCard>
        <UsageCardHeader isCallsActive={isCallsActive}>
          <DList data-test-id="PlanItems">
            {planItems.map(({ labelKey: id, value }) => (
              <Fragment key={id}>
                <Label>{intl.formatMessage({ id })}</Label>
                {value}
              </Fragment>
            ))}
          </DList>
          <Button buttonType="tertiary" size="small" onClick={onUpgradeClick}>
            {intl.formatMessage({ id: 'common.home.chatUsage.manage' })}
          </Button>
        </UsageCardHeader>
        <UsageCardBody>
          <UsageCardTitle>
            {intl.formatMessage({ id: 'common.home.organizationUsage.keyUsage' })}
            <Link onClick={onUsageClick}>{intl.formatMessage({ id: 'common.home.organizationUsage.viewMore' })}</Link>
          </UsageCardTitle>
          <UsageItems>
            {usages.map(({ label, usage, quota, limit }) => (
              <Usage
                key={`usageItem_${label}`}
                variant="compact"
                showAlert={true}
                label={label}
                labelNumber="default"
                labelNumberSuffix="total"
                usage={usage}
                quota={quota}
                limit={limit || 0}
                showMarker={true}
                availabilityTooltips={getUsageTooltipText({
                  intl,
                  isFreeTrial: subscription?.subscription_name === SubscriptionName.FreeTrial,
                  limit: limit || 0, // when subscription created without hard_limit it cause null exception. Set it to zero to show alert to the customer to report the issue.
                  onLinkClick: handleOverageLinkClick,
                })}
              />
            ))}
          </UsageItems>
        </UsageCardBody>
      </UsageCard>
    </UsageSection>
  );
};

export const OrganizationUsage: FC<Props> = () => {
  const {
    isAuthorized,
    subscription,
    support,
    isChatSubscriptionLoading,
    isSupportSubscriptionLoading,
  } = useChatSubscription();
  const isCallsActivatedOrganization = useIsCallsActivatedOrganization();
  const history = useHistory();

  const handleUsageClick = () => {
    history.push('/settings/usage');
  };

  const handleUpgradeClick = () => {
    history.push('/settings/general');
  };

  if (!isAuthorized) {
    return null;
  }

  const sections = [
    (isChatSubscriptionLoading || subscription) && (
      <ChatUsage
        key="chat"
        onUsageClick={handleUsageClick}
        onUpgradeClick={handleUpgradeClick}
        isCallsActive={isCallsActivatedOrganization}
      />
    ),
    isCallsActivatedOrganization && <CallsUsage key="calls" onUpgradeClick={handleUpgradeClick} />,
  ].filter(Boolean);

  return (
    <Wrapper data-test-id="OrganizationUsage">
      <Container>
        {sections.length > 0 && <UsageGrid columns={sections.length}>{sections}</UsageGrid>}
        <Support
          name={support?.display_name}
          isLoading={isSupportSubscriptionLoading}
          onClickChangeButton={handleUpgradeClick}
        />
      </Container>
    </Wrapper>
  );
};
