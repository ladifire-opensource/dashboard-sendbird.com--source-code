import { useState, FC, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled, { css } from 'styled-components';

import { Button, Grid, cssVariables, IconButton, DateRangePicker, DateRangePickerValue } from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { StatisticsMetrics, StatisticsMetricsLegacy } from '@constants';
import { Tooltip, Card, LastUpdatedAt, PageHeader } from '@ui/components';

import { AnalyticsOverviewLastUpdatedAtContext } from './AnalyticsOverviewLastUpdatedAtContext';
import { OverviewStatisticsItem } from './overviewStatisticsItem';
import { useAdvancedAnalyticsAvailableApps } from './useAdvancedAnalytics';

const StyledAnalyticsOverview = styled.div`
  padding-bottom: 40px;
`;

const ChartSectionTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin-bottom: 10px;
`;

const ChartCard = styled(Card)`
  padding: 34px 40px;
  margin-bottom: 32px;
`;

export const AnalyticsOverview: FC = () => {
  const intl = useIntl();

  const dispatch = useDispatch();

  const application = useSelector((state: RootState) => state.applicationState.data);

  const [date, setDate] = useState(DateRangePickerValue.Last14Days);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(13, 'day'),
    endDate: moment(),
  });
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const handleClickExport = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.AnalyticsExport,
        dialogProps: {
          ...dateRange,
        },
      }),
    );
  };

  const handleDatePickerChange = (value, newDateRange) => {
    setDate(value);
    setDateRange({ startDate: newDateRange.startDate, endDate: newDateRange.endDate });
  };

  const isAvailableToSeeMembersPerChannel = useAdvancedAnalyticsAvailableApps(application?.app_id || '');

  const informationTooltips = useMemo(
    () => ({
      channels: [
        {
          header: intl.formatMessage({ id: 'chat.analytics.created_channels.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.created_channels.description' }),
        },
        {
          header: intl.formatMessage({ id: 'chat.analytics.active_channels.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.active_channels.description' }),
        },
        ...(isAvailableToSeeMembersPerChannel
          ? [
              {
                header: intl.formatMessage({ id: 'chat.analytics.channel_member.header' }),
                description: intl.formatMessage({ id: 'chat.analytics.channel_member.description' }),
              },
            ]
          : []),
      ],
      messages: [
        {
          header: intl.formatMessage({ id: 'chat.analytics.messages.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.messages.description' }),
        },
        {
          header: intl.formatMessage({ id: 'chat.analytics.messages_per_user.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.messages_per_user.description' }),
        },
      ],
      users: [
        {
          header: intl.formatMessage({ id: 'chat.analytics.created_users.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.created_users.description' }),
        },
        {
          header: intl.formatMessage({ id: 'chat.analytics.message_senders.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.message_senders.description' }),
        },
        {
          header: intl.formatMessage({ id: 'chat.analytics.message_viewers.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.message_viewers.description' }),
        },
        {
          header: intl.formatMessage({ id: 'chat.analytics.deactivated_users.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.deactivated_users.description' }),
        },
        {
          header: intl.formatMessage({ id: 'chat.analytics.deleted_users.header' }),
          description: intl.formatMessage({ id: 'chat.analytics.deleted_users.description' }),
        },
      ],
    }),
    [intl, isAvailableToSeeMembersPerChannel],
  );

  return (
    <AnalyticsOverviewLastUpdatedAtContext.Provider value={setLastUpdatedAt}>
      <StyledAnalyticsOverview>
        <PageHeader
          css={`
            & + * {
              margin-top: 24px;
            }

            ${PageHeader.Description} {
              margin-top: 12px;

              > * {
                justify-content: flex-end;
              }
            }
          `}
        >
          <PageHeader.Title>{intl.formatMessage({ id: 'chat.analytics.title' })}</PageHeader.Title>
          <PageHeader.Actions>
            <DateRangePicker
              size="small"
              value={date}
              dateRange={dateRange}
              onChange={handleDatePickerChange}
              minimumNights={7}
              maximumNights={186}
              placement="bottom"
            />
            <Button
              buttonType="secondary"
              size="small"
              icon="export"
              onClick={handleClickExport}
              styles="margin-left: 8px; padding-right: 16px;"
            >
              Export
            </Button>
          </PageHeader.Actions>
          <PageHeader.Description>
            <LastUpdatedAt timestamp={lastUpdatedAt} />
          </PageHeader.Description>
        </PageHeader>
        <ChartSectionTitle>
          {intl.formatMessage({ id: 'chat.analytics.types.users' })}{' '}
          <Tooltip
            contentWidth="512px"
            placement="right"
            offset="0, 16"
            target={<IconButton buttonType="tertiary" size="xsmall" icon="info" />}
            items={informationTooltips.users}
            targetStyle={css`
              margin-left: 4px;
            `}
          />
        </ChartSectionTitle>
        <ChartCard>
          <Grid gap={28}>
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.created_users} />
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.message_senders} />
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.message_viewers} />
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.deactivated_users} />
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.deleted_users} />
          </Grid>
        </ChartCard>
        <ChartSectionTitle>
          {intl.formatMessage({ id: 'chat.analytics.types.channels' })}{' '}
          <Tooltip
            contentWidth="512px"
            placement="right"
            offset="0, 16"
            target={<IconButton buttonType="tertiary" size="xsmall" icon="info" />}
            items={informationTooltips.channels}
            targetStyle={css`
              margin-left: 4px;
            `}
          />
        </ChartSectionTitle>
        <ChartCard>
          <Grid gap={28}>
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.created_channels} />
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.active_channels} />
            {isAvailableToSeeMembersPerChannel && (
              <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetricsLegacy.channel_member} />
            )}
          </Grid>
        </ChartCard>
        <ChartSectionTitle>
          {intl.formatMessage({ id: 'chat.analytics.types.messages' })}{' '}
          <Tooltip
            contentWidth="411px"
            placement="right"
            offset="0, 16"
            target={<IconButton buttonType="tertiary" size="xsmall" icon="info" />}
            items={informationTooltips.messages}
            targetStyle={css`
              margin-left: 4px;
            `}
          />
        </ChartSectionTitle>
        <ChartCard>
          <Grid gap={28}>
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.messages} />
            <OverviewStatisticsItem dateRange={dateRange} metricType={StatisticsMetrics.messages_per_user} />
          </Grid>
        </ChartCard>
      </StyledAnalyticsOverview>
    </AnalyticsOverviewLastUpdatedAtContext.Provider>
  );
};
