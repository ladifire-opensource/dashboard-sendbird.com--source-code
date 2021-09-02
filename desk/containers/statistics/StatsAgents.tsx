import { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { toast } from 'feather';
import moment from 'moment-timezone';

import { LIST_LIMIT, ISO_DATE_FORMAT, SortOrder, StatsAgentsSortBy } from '@constants';
import {
  fetchStatsByAgents,
  exportAgentPerformance,
  exportAgentAssignments,
  exportAgentFirstResponseTime,
  exportAgentClosedTickets,
  exportAgentAvgHourlyClosedTickets,
  exportAgentCSAT,
  exportAgentDailyConnectionStatus,
} from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import {
  validateStartDate,
  validateEndDate,
  validatePage,
  validatePageSize,
  validateChannelTypes,
  validateSortBy,
  validateSortOrder,
  validateDate,
} from '@desk/utils/validationParams';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString } from '@hooks/useQueryString';
import { getChannelTypesArray } from '@ui/components/TicketChannelTypesFilter/utils';
import { getSorterParams } from '@utils';

import { StatsAgentsChartView } from './StatsAgentsChartView';
import { StatesAgentsTableView } from './StatsAgentsTableView';
import { StatsFilter, ViewType } from './StatsFilter';
import { Report } from './reportsDataExportDialog';

const now = moment();
const StyledAgentsStats = styled.div<{ isTableView: boolean }>`
  ${(props) =>
    props.isTableView &&
    css`
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow-y: auto;
    `}
`;

export type SearchParams = {
  view: ViewType;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: PerPage;
  sortBy: StatsAgentsSortBy;
  sortOrder: SortOrder;
  agent: Agent['id'] | null;
  channelTypes: TicketChannelType[];
  statusDate: string;
};

const defaultParams: SearchParams = {
  page: 1,
  pageSize: LIST_LIMIT,
  view: 'table',
  startDate: now.clone().subtract(13, 'days').format(ISO_DATE_FORMAT),
  endDate: now.clone().format(ISO_DATE_FORMAT),
  sortBy: StatsAgentsSortBy.ASSIGNMENTS,
  sortOrder: SortOrder.DESCEND,
  agent: null,
  channelTypes: [],
  statusDate: now.clone().format(ISO_DATE_FORMAT),
};

export const StatsAgents = memo(() => {
  const intl = useIntl();
  const [agentsData, setAgentsData] = useState<FetchStatsByAgentsResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const searchParams = useQueryString(defaultParams, {
    page: (page, params) => params.view === 'table' && validatePage(page),
    pageSize: (pageSize, params) => params.view === 'table' && validatePageSize(pageSize),
    view: (view) => view === 'table' || view === 'chart',
    startDate: (startDate, params) => validateStartDate(startDate, params.endDate),
    endDate: (endDate, params) => validateEndDate(endDate, params.startDate),
    channelTypes: (query) => validateChannelTypes(query),
    sortBy: (sortBy) => validateSortBy(Object.values(StatsAgentsSortBy), sortBy),
    sortOrder: (sortOrder) => validateSortOrder(sortOrder),
    statusDate: (statusDate) => validateDate(statusDate),
  });
  const {
    page,
    pageSize,
    view,
    updateParams,
    startDate,
    endDate,
    agent,
    channelTypes: rawChannelTypes,
    sortBy,
    sortOrder,
    statusDate,
  } = searchParams;

  const agentId = isNaN(Number(agent)) ? undefined : Number(agent);

  const channelTypes = useMemo(() => getChannelTypesArray(rawChannelTypes), [rawChannelTypes]);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchStatsByAgents(pid, region, {
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        agent: agent ?? undefined,
        order: getSorterParams(sortBy, sortOrder),
      });
      setAgentsData(result);
    } catch (err) {
      toast.error({
        message: getErrorMessage(err),
      });
    } finally {
      setIsFetching(false);
    }
  }, [agent, channelTypes, endDate, getErrorMessage, page, pageSize, pid, region, sortBy, sortOrder, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const agentReports: Report[] | undefined = useMemo(() => {
    if (view === 'chart') {
      if (agent) {
        return [
          {
            name: intl.formatMessage({ id: 'desk.statistics.agents.chart.assignments' }),
            filename: `sendbird_desk_reports_agent_${agent}_assignments`,
            exportAPI: exportAgentAssignments,
            apiPayload: { agent },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.agents.chart.firstResponseTime' }),
            filename: `sendbird_desk_reports_agent_${agent}_response_times`,
            exportAPI: exportAgentFirstResponseTime,
            apiPayload: { agent },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.agents.chart.closedTickets' }),
            filename: `sendbird_desk_reports_agent_${agent}_closed_tickets`,
            exportAPI: exportAgentClosedTickets,
            apiPayload: { agent },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.agents.chart.closedTicketsHourly' }),
            filename: `sendbird_desk_reports_agent_${agent}_hourly_closed_tickets`,
            exportAPI: exportAgentAvgHourlyClosedTickets,
            apiPayload: { agent },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.agents.chart.csat' }),
            filename: `sendbird_desk_reports_agent_${agent}_csat`,
            exportAPI: exportAgentCSAT,
            apiPayload: { agent },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.agents.chart.dailyStatusTracking' }),
            filename: `sendbird_desk_reports_agent_${agent}_daily_status_tracking`,
            exportAPI: exportAgentDailyConnectionStatus,
            apiPayload: { agent },
          },
        ];
      }
      return undefined;
    }

    return [
      {
        name: intl.formatMessage({ id: 'desk.reports.export.customType.agentPerformance' }),
        filename: 'sendbird_desk_reports_agents_performance',
        exportAPI: exportAgentPerformance,
      },
    ];
  }, [agent, intl, view]);

  const renderBody = useMemo(() => {
    return !view || view === 'table' ? (
      <StatesAgentsTableView
        page={page}
        pageSize={pageSize}
        updateParams={updateParams}
        agentsData={agentsData}
        isFetching={isFetching}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ) : (
      <StatsAgentsChartView
        agentId={agentId}
        startDate={startDate}
        endDate={endDate}
        statusDate={statusDate}
        channelTypes={channelTypes}
        updateParams={updateParams}
      />
    );
  }, [
    view,
    page,
    pageSize,
    updateParams,
    agentsData,
    isFetching,
    sortBy,
    sortOrder,
    agentId,
    startDate,
    endDate,
    statusDate,
    channelTypes,
  ]);

  return (
    <StyledAgentsStats isTableView={view === 'table'}>
      <StatsFilter
        channelTypes={channelTypes}
        startDate={startDate}
        endDate={endDate}
        viewType={view}
        showAgents={true}
        updateParams={updateParams}
        selectedAgentId={agentId}
        exportReports={agentReports}
      />
      {renderBody}
    </StyledAgentsStats>
  );
});
