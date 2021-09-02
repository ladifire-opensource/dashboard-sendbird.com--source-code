import { ComponentProps, FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Body, cssVariables, Headings, SpinnerFull, Subtitles, Typography } from 'feather';

import {
  SubscriptionStatus,
  useCallsVoucher,
  useLatestVoucher,
  useSubscription,
  useVoucherAlert,
  useVoucherError,
} from '@common/containers/CallsVoucherContext';
import { fetchCallsUsage } from '@core/api';
import { useAppId, useAsync, useAuthorization } from '@hooks';
import { CallsUsage, ChevronLink, InfoTooltip, VoucherSubscriptionStatus } from '@ui/components';

import { ErrorView, Ticker } from './components';
import { monthRange } from './constants';

const Layout = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 32px;
  min-height: 376px;
`;

const Heading = styled.h3`
  display: flex;
  align-items: center;
  color: ${cssVariables('neutral-10')};
  ${Headings['heading-02']}
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
`;

const UsageContentContainer = styled.div`
  display: flex;
  flex-direction: column;

  /* Used credits section */
  > div:first-child {
    margin-bottom: 56px;
  }

  > * + * {
    border-top: 1px solid ${cssVariables('neutral-3')};
    padding-top: 24px;
  }
`;

const StyledCallsUsage = styled(CallsUsage).attrs({
  showLegends: true,
  showTooltip: true,
  tooltipPlacement: 'bottom-start',
})`
  .UsageLegends {
    margin-bottom: 12px;

    > div {
      height: auto;
    }
    .usageLegend__value {
      display: none;
    }
  }
`;

const SubscriptionContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 20px 28px;

  > h3 {
    margin: 0;
  }

  > a {
    grid-column-start: span 2;
  }
`;

const UsageContent: FC<
  { subscriptionStatus: SubscriptionStatus; link?: ReactNode } & ComponentProps<typeof StyledCallsUsage>
> = ({ subscriptionStatus, link, ...props }) => {
  const intl = useIntl();
  const labels = {
    usage: intl.formatMessage({ id: 'core.overview.calls.quota.legends.usage' }),
    others: intl.formatMessage({ id: 'core.overview.calls.quota.legends.others' }),
    remains: intl.formatMessage({ id: 'core.overview.calls.quota.legends.remains' }),
  };
  return (
    <UsageContentContainer>
      <StyledCallsUsage legendLabels={labels} tooltipLabels={labels} {...props} />
      <SubscriptionContainer>
        <Heading>{intl.formatMessage({ id: 'core.overview.calls.autoRecharge.title' })}</Heading>
        <VoucherSubscriptionStatus status={subscriptionStatus} />
        {link}
      </SubscriptionContainer>
    </UsageContentContainer>
  );
};

const StyledLink = styled(ChevronLink)`
  && {
    font-size: 14px;
    font-weight: 600;
  }
`;

const SettingsLink = () => {
  const intl = useIntl();

  return (
    <StyledLink href="/settings/general">
      {intl.formatMessage({ id: 'core.overview.calls.autoRecharge.viewMore' })}
    </StyledLink>
  );
};

const ContactUsLink = () => {
  const intl = useIntl();

  return (
    <StyledLink href="/settings/contact_us?category=pricing">
      {intl.formatMessage({ id: 'core.overview.calls.autoRecharge.viewMore.contactUs' })}
    </StyledLink>
  );
};

const UsageSection: FC<{ onLoaded: () => void }> = ({ onLoaded }) => {
  const intl = useIntl();
  const {
    fetchVouchers,
    fetchSubscription,
    fetchNextVoucher,
    subscription: { loading: isSubscriptionLoading },
    vouchers: { loading: isVouchersLoading },
    nextVoucher: { loading: isNextVoucherLoading },
  } = useCallsVoucher();
  const voucherError = useVoucherError();
  const latestVoucher = useLatestVoucher();
  const subscription = useSubscription();
  const showAlert = useVoucherAlert();
  const { isSelfService } = useAuthorization();

  const load = useCallback(() => Promise.all([fetchVouchers(), fetchSubscription(), fetchNextVoucher()]), [
    fetchVouchers,
    fetchSubscription,
    fetchNextVoucher,
  ]);

  const loaded = !!(latestVoucher && subscription);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loaded && onLoaded();
  }, [loaded, onLoaded]);

  const loading = isSubscriptionLoading || isVouchersLoading || isNextVoucherLoading;

  const content = useMemo(() => {
    if (loading) {
      return <SpinnerFull />;
    }

    if (voucherError || !latestVoucher || !subscription) {
      return <ErrorView onRetry={load} isRetrying={loading} />;
    }

    return (
      <UsageContent
        {...latestVoucher}
        subscriptionStatus={subscription.status}
        showAlert={showAlert}
        link={isSelfService ? <SettingsLink /> : <ContactUsLink />}
      />
    );
  }, [loading, voucherError, latestVoucher, subscription, showAlert, isSelfService, load]);

  return (
    <Section css="padding: 24px; min-width: 368px;" data-test-id="Usage">
      <Heading css="margin-bottom: 28px;">{intl.formatMessage({ id: 'core.overview.calls.quota.title' })}</Heading>
      {content}
    </Section>
  );
};

const Table = styled.table`
  border-spacing: 0;

  th,
  td {
    display: flex;
  }

  thead {
    font-size: 13px;
    font-weight: 600;

    th {
      ${Typography['label-03']}
      justify-content: flex-end;
    }

    tr {
      padding: 0 24px 12px;
      border-bottom: 1px solid ${cssVariables('neutral-3')};
    }
  }

  tr {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr;
    grid-gap: 24px;
  }

  tbody {
    tr {
      margin: 0 24px;
      min-height: 100px;
      align-items: center;

      td {
        > * {
          width: 100%;
        }
      }
    }

    tr + tr {
      border-top: 1px solid ${cssVariables('neutral-3')};
    }
  }
`;

const RowHeaderContainer = styled.th`
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  text-align: start;

  > b {
    display: flex;
    align-items: center;
    ${Subtitles['subtitle-02']}
  }

  > span {
    margin-top: 4px;
    color: ${cssVariables('neutral-7')};
    ${Body['body-short-01']}
  }
`;

const RowHeader: FC<{ title: ReactNode; duration?: ReactNode }> = ({ title, duration }) => {
  return (
    <RowHeaderContainer>
      <b>{title}</b>
      {duration && <span>{duration}</span>}
    </RowHeaderContainer>
  );
};

const TickerCell = (props: ComponentProps<typeof Ticker>) => {
  return (
    <td>
      <Ticker {...props} />
    </td>
  );
};

const useSummary = () => {
  const appId = useAppId();
  const [{ data, status, error }, load] = useAsync(() => fetchCallsUsage(appId), [appId]);
  const summary = {
    direct: data?.data.participants,
    group: data?.data.room_participants,
  };

  const isLoading = status === 'loading';

  return { summary, load, isLoading, error };
};

const SummarySection: FC<{ onLoaded: () => void }> = ({ onLoaded }) => {
  const intl = useIntl();
  const { summary, load, isLoading, error } = useSummary();
  const { direct, group } = summary;
  const loaded = !!(direct && group);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loaded && onLoaded();
  }, [loaded, onLoaded]);

  const renderContent = () => {
    if (isLoading) return <SpinnerFull />;
    if (error) return <ErrorView onRetry={load} isRetrying={isLoading} />;
    if (!direct || !group) return null;

    return (
      <Table>
        <thead>
          <tr>
            <td />
            <th>{intl.formatMessage({ id: 'core.overview.calls.summary.table.header.direct' })}</th>
            <th>{intl.formatMessage({ id: 'core.overview.calls.summary.table.header.group' })}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <RowHeader
              title={intl.formatMessage({ id: 'core.overview.calls.summary.table.body.monthly' })}
              duration={monthRange}
            />
            <TickerCell current={direct.monthly.current} previous={direct.monthly.previous} />
            <TickerCell current={group.monthly.current} previous={group.monthly.previous} />
          </tr>
          <tr>
            <RowHeader title={intl.formatMessage({ id: 'core.overview.calls.summary.table.body.daily' })} />
            <TickerCell current={direct.daily.current} previous={direct.daily.previous} />
            <TickerCell current={group.daily.current} previous={group.daily.previous} />
          </tr>
          <tr>
            <RowHeader
              title={
                <>
                  {intl.formatMessage({ id: 'core.overview.calls.summary.table.body.peak' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'core.overview.calls.summary.table.body.peak.tooltip' })}
                  />
                </>
              }
            />
            <TickerCell current={direct.peak} />
            <TickerCell current={group.peak} />
          </tr>
        </tbody>
      </Table>
    );
  };

  return (
    <Section css="padding-bottom: 0;  min-width: 640px;" data-test-id="Summary">
      <Heading css="padding: 24px 24px 0;">
        {intl.formatMessage({ id: 'core.overview.calls.summary.title' })}
        <InfoTooltip content={intl.formatMessage({ id: 'core.overview.calls.summary.title.tooltip' })} />
      </Heading>
      {renderContent()}
    </Section>
  );
};

export const CallsProductView: FC<{ onLoaded: () => void }> = ({ onLoaded }) => {
  const [loaded, setLoaded] = useState({ usage: false, summary: false });
  const allSectionsLoaded = Object.values(loaded).every(Boolean);

  const handleUsageLoaded = useCallback(() => setLoaded((prev) => ({ ...prev, usage: true })), []);
  const handleSummaryLoaded = useCallback(() => setLoaded((prev) => ({ ...prev, summary: true })), []);

  useEffect(() => {
    allSectionsLoaded && onLoaded();
  }, [allSectionsLoaded, onLoaded]);

  return (
    <Layout data-test-id="CallsProductView">
      <UsageSection onLoaded={handleUsageLoaded} />
      <SummarySection onLoaded={handleSummaryLoaded} />
    </Layout>
  );
};
