import { useMemo, useRef, FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Grid, GridItem } from 'feather';
import moment from 'moment-timezone';

import { ISO_DATE_FORMAT } from '@constants';
import {
  exportTicketCount,
  exportAvgHourlyTicketCount,
  exportMessageCount,
  exportAvgHourlyMessageCount,
  exportAvgFirstResponseTime,
  exportAvgResolutionTime,
  exportCSAT,
} from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { validateStartDate, validateEndDate, validateChannelTypes } from '@desk/utils/validationParams';
import { useQueryString } from '@hooks/useQueryString';
import { getChannelTypesArray } from '@ui/components/TicketChannelTypesFilter/utils';

import { StatsFilter } from './StatsFilter';
import {
  Stats,
  TicketsChart,
  HourlyTicketsChart,
  MessagesChart,
  HourlyMessagesChart,
  AvgFirstResponseTimeChart,
  AvgResolutionTimeChart,
  CSATChart,
  ClosedStatusesChart,
} from './StatsOverviewCharts';
import { Report } from './reportsDataExportDialog';

const StyledStatsOverview = styled.div`
  padding-bottom: 40px;
`;

const ChartGridItem = styled(GridItem).attrs({ colSpan: 6 })``;

const now = moment();

export type SearchParams = {
  startDate: string;
  endDate: string;
  channelTypes: TicketChannelType[];
};

const defaultParams: SearchParams = {
  startDate: now.clone().subtract(13, 'days').format(ISO_DATE_FORMAT),
  endDate: now.clone().format(ISO_DATE_FORMAT),
  channelTypes: [],
};

export const StatsOverview: FC = () => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const { pid, region } = useProjectIdAndRegion();

  const searchParams = useQueryString<SearchParams>(defaultParams, {
    startDate: (startDate, params) => validateStartDate(startDate, params.endDate),
    endDate: (endDate, params) => validateEndDate(endDate, params.startDate),
    channelTypes: (query) => validateChannelTypes(query),
  });

  const { startDate, endDate, channelTypes: rawChannelTypes, updateParams } = searchParams;
  const channelTypes = useMemo(() => getChannelTypesArray(rawChannelTypes), [rawChannelTypes]);

  const overviewReports: Report[] = useMemo(
    () => [
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.tickets' }),
        filename: 'sendbird_desk_reports_ticket_counts',
        exportAPI: exportTicketCount,
      },
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.hourlyTicket' }),
        filename: 'sendbird_desk_reports_hourly_average_ticket_counts',
        exportAPI: exportAvgHourlyTicketCount,
      },
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.messageCount' }),
        filename: 'sendbird_desk_reports_ticket_message_counts',
        exportAPI: exportMessageCount,
      },
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.hourlyIncoming' }),
        filename: 'sendbird_desk_reports_hourly_average_message_counts',
        exportAPI: exportAvgHourlyMessageCount,
      },
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.firstResponseTime' }),
        filename: 'sendbird_desk_reports_ticket_response_times',
        exportAPI: exportAvgFirstResponseTime,
      },
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.resolutionTime' }),
        filename: 'sendbird_desk_reports_ticket_duration_times',
        exportAPI: exportAvgResolutionTime,
      },
      {
        name: intl.formatMessage({ id: 'desk.statistics.overview.header.csat' }),
        filename: 'report_project_customer_satisfaction_scores',
        exportAPI: exportCSAT,
      },
    ],
    [intl],
  );

  // memoize props to avoid rerendering due to changes of the reference of `params` object
  const chartProps = useMemo(
    () => ({
      pid,
      region,
      params: { startDate, endDate, channelTypes },
      tooltipBoundariesElementRef: containerRef,
    }),
    [channelTypes, endDate, pid, region, startDate],
  );

  return (
    <StyledStatsOverview ref={containerRef}>
      <StatsFilter
        channelTypes={channelTypes}
        startDate={startDate}
        endDate={endDate}
        updateParams={updateParams}
        exportReports={overviewReports}
      />
      <Stats data-test-id="DeskStats">
        <Grid>
          <ChartGridItem>
            <TicketsChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <HourlyTicketsChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <MessagesChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <HourlyMessagesChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <AvgFirstResponseTimeChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <AvgResolutionTimeChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <CSATChart {...chartProps} />
          </ChartGridItem>
          <ChartGridItem>
            <ClosedStatusesChart {...chartProps} />
          </ChartGridItem>
        </Grid>
      </Stats>
    </StyledStatsOverview>
  );
};
