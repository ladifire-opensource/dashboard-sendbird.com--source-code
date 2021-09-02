import { memo, useEffect, useCallback, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { toast } from 'feather';
import moment from 'moment-timezone';

import { LIST_LIMIT, ISO_DATE_FORMAT, SortOrder, StatsTeamsSortBy } from '@constants';
import {
  fetchStatsByTeams,
  exportTeamPerformance,
  exportTeamAvgFirstResolutionTime,
  exportTeamAvgFirstResponseTime,
  exportTeamAvgHourlyClosedTickets,
  exportTeamCSAT,
  exportTeamCloseTickets,
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
} from '@desk/utils/validationParams';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString } from '@hooks/useQueryString';
import { getChannelTypesArray } from '@ui/components/TicketChannelTypesFilter/utils';
import { getSorterParams } from '@utils';

import { StatsFilter, ViewType } from './StatsFilter';
import { StatsTeamsChartView } from './StatsTeamsChartView';
import { StatsTeamTableView } from './StatsTeamsTableView';
import { Report } from './reportsDataExportDialog';

const now = moment();
const StyledTeamsStats = styled.div<{ isTableView: boolean }>`
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
  sortBy: StatsTeamsSortBy;
  sortOrder: SortOrder;
  team: AgentGroup['id'] | null;
  channelTypes: TicketChannelType[];
};

const defaultParams: SearchParams = {
  page: 1,
  pageSize: LIST_LIMIT,
  view: 'table',
  startDate: now.clone().subtract(13, 'days').format(ISO_DATE_FORMAT),
  endDate: now.clone().format(ISO_DATE_FORMAT),
  sortBy: StatsTeamsSortBy.ASSIGNED_TICKETS,
  sortOrder: SortOrder.DESCEND,
  team: -1,
  channelTypes: [],
};

export const StatsTeams = memo(() => {
  const intl = useIntl();
  const [teams, setTeams] = useState<FetchStatsByTeamsResponse['results']>([]);
  const [teamCount, setTeamCount] = useState(0);
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
    sortBy: (sortBy) => validateSortBy(Object.values(StatsTeamsSortBy), sortBy),
    sortOrder: (sortOrder) => validateSortOrder(sortOrder),
  });
  const {
    page,
    pageSize,
    view,
    updateParams,
    startDate,
    endDate,
    channelTypes: rawChannelTypes,
    team,
    sortBy,
    sortOrder,
  } = searchParams;
  const teamId = typeof team === 'number' && team > 0 ? team : undefined;

  const channelTypes = useMemo(() => getChannelTypesArray(rawChannelTypes), [rawChannelTypes]);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchStatsByTeams(pid, region, {
        start_date: startDate,
        end_date: endDate,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        channel_type: channelTypes,
        group: teamId,
        order: getSorterParams(sortBy, sortOrder),
      });
      setTeams(result.results);
      setTeamCount(result.count);
    } catch (err) {
      toast.error({ message: getErrorMessage(err) });
    } finally {
      setIsFetching(false);
    }
  }, [channelTypes, endDate, page, pageSize, pid, region, sortBy, sortOrder, startDate, teamId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const teamReports: Report[] | undefined = useMemo(() => {
    if (view === 'chart') {
      if (!teamId) return undefined;
      return [
        {
          name: intl.formatMessage({ id: 'desk.statistics.teams.chart.closedTickets' }),
          filename: `sendbird_desk_reports_teams_${teamId}_closed_tickets`,
          exportAPI: exportTeamCloseTickets,
          apiPayload: { group: teamId },
        },
        {
          name: intl.formatMessage({ id: 'desk.statistics.teams.chart.firstResponseTime' }),
          filename: `sendbird_desk_reports_teams_${teamId}_avg_first_response_time`,
          exportAPI: exportTeamAvgFirstResponseTime,
          apiPayload: { group: teamId },
        },
        {
          name: intl.formatMessage({ id: 'desk.statistics.teams.chart.resolutionTime' }),
          filename: `sendbird_desk_reports_teams_${teamId}_avg_first_resolution_time`,
          exportAPI: exportTeamAvgFirstResolutionTime,
          apiPayload: { group: teamId },
        },
        {
          name: intl.formatMessage({ id: 'desk.statistics.teams.chart.closedTicketsPerHour' }),
          filename: `sendbird_desk_reports_teams_${teamId}_avg_hourly_closed_tickets`,
          exportAPI: exportTeamAvgHourlyClosedTickets,
          apiPayload: { group: teamId },
        },
        {
          name: intl.formatMessage({ id: 'desk.statistics.teams.chart.csat' }),
          filename: `sendbird_desk_reports_teams_${teamId}_csat`,
          exportAPI: exportTeamCSAT,
          apiPayload: { group: teamId },
        },
      ];
    }

    return [
      {
        name: intl.formatMessage({ id: 'desk.reports.export.customType.teamPerformance' }),
        filename: 'sendbird_desk_reports_teams_performance',
        exportAPI: exportTeamPerformance,
      },
    ];
  }, [intl, teamId, view]);

  const renderBody = useMemo(() => {
    return !view || view === 'table' ? (
      <StatsTeamTableView
        page={page}
        pageSize={pageSize}
        updateParams={updateParams}
        items={teams}
        count={teamCount}
        isFetching={isFetching}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ) : (
      <StatsTeamsChartView teamId={teamId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
    );
  }, [
    channelTypes,
    endDate,
    isFetching,
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    teamCount,
    teamId,
    teams,
    updateParams,
    view,
  ]);

  return (
    <StyledTeamsStats isTableView={view === 'table'}>
      <StatsFilter
        channelTypes={channelTypes}
        selectedGroupId={teamId}
        startDate={startDate}
        endDate={endDate}
        showTeams={true}
        viewType={view}
        updateParams={updateParams}
        exportReports={teamReports}
      />
      {renderBody}
    </StyledTeamsStats>
  );
});
