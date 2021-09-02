import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { toast } from 'feather';
import moment from 'moment-timezone';

import { ISO_DATE_FORMAT, LIST_LIMIT, SortOrder } from '@constants';
import {
  fetchStatsByBots,
  exportBotAssignments,
  exportBotAvgTimeToClosing,
  exportBotAvgTimeToHandover,
  exportBotCloseTickets,
  exportBotClosingRates,
  exportBotCSAT,
  exportBotPerformance,
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

import { StatsBotsSortBy } from '../../../constants/desk';
import { StatsBotsChartView } from './StatsBotsChartView';
import { StatesBotsTableView } from './StatsBotsTableView';
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
  sortBy: StatsBotsSortBy;
  sortOrder: SortOrder;
  bot: DeskBot['id'] | null;
  channelTypes: TicketChannelType[];
  statusDate: string;
};

const defaultParams: SearchParams = {
  page: 1,
  pageSize: LIST_LIMIT,
  view: 'table',
  startDate: now.clone().subtract(13, 'days').format(ISO_DATE_FORMAT),
  endDate: now.clone().format(ISO_DATE_FORMAT),
  sortBy: StatsBotsSortBy.ASSIGNMENTS,
  sortOrder: SortOrder.DESCEND,
  bot: null,
  channelTypes: [],
  statusDate: now.clone().format(ISO_DATE_FORMAT),
};

export const StatsBots = memo(() => {
  const intl = useIntl();
  const [botsData, setBotsData] = useState<FetchStatsByBotsResponse | undefined>(undefined);
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
    sortBy: (sortBy) => validateSortBy(Object.values(StatsBotsSortBy), sortBy),
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
    bot,
    channelTypes: rawChannelTypes,
    sortBy,
    sortOrder,
  } = searchParams;

  const channelTypes = useMemo(() => getChannelTypesArray(rawChannelTypes), [rawChannelTypes]);

  const fetchBotStats = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchStatsByBots(pid, region, {
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: getSorterParams(sortBy, sortOrder),
        bot: bot ?? undefined,
      });
      setBotsData(result);
    } catch (err) {
      toast.error({ message: getErrorMessage(err) });
    } finally {
      setIsFetching(false);
    }
  }, [bot, channelTypes, endDate, getErrorMessage, page, pageSize, pid, region, sortBy, sortOrder, startDate]);

  useEffect(() => {
    fetchBotStats();
  }, [fetchBotStats]);

  const botReports: Report[] | undefined = useMemo(() => {
    if (view === 'chart') {
      if (bot) {
        return [
          {
            name: intl.formatMessage({ id: 'desk.statistics.bots.chart.closedTickets' }),
            filename: `sendbird_desk_reports_bot_${bot}_closedTickets`,
            exportAPI: exportBotCloseTickets,
            apiPayload: { bot },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.bots.chart.closedAssignmentRate' }),
            filename: `sendbird_desk_reports_bot_${bot}_ticketClosingRate`,
            exportAPI: exportBotClosingRates,
            apiPayload: { bot },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.bots.chart.assignments' }),
            filename: `sendbird_desk_reports_bot_${bot}_receivedTickets`,
            exportAPI: exportBotAssignments,
            apiPayload: { bot },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.bots.chart.closingTime' }),
            filename: `sendbird_desk_reports_bot_${bot}_avgClosingTime`,
            exportAPI: exportBotAvgTimeToClosing,
            apiPayload: { bot },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.bots.chart.handover' }),
            filename: `sendbird_desk_reports_bot_${bot}_avgHandover`,
            exportAPI: exportBotAvgTimeToHandover,
            apiPayload: { bot },
          },
          {
            name: intl.formatMessage({ id: 'desk.statistics.bots.chart.csat' }),
            filename: `sendbird_desk_reports_bot_${bot}_csat`,
            exportAPI: exportBotCSAT,
            apiPayload: { bot },
          },
        ];
      }
      return undefined;
    }
    return [
      {
        name: intl.formatMessage({ id: 'desk.reports.export.customType.botPerformance' }),
        filename: 'sendbird_desk_reports_bots_performance',
        exportAPI: exportBotPerformance,
      },
    ];
  }, [bot, intl, view]);

  const renderBody = useMemo(() => {
    return !view || view === 'table' ? (
      <StatesBotsTableView
        page={page}
        pageSize={pageSize}
        updateParams={updateParams}
        botsData={botsData}
        isFetching={isFetching}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
    ) : (
      <StatsBotsChartView
        botId={bot ?? undefined}
        startDate={startDate}
        endDate={endDate}
        channelTypes={channelTypes}
      />
    );
  }, [
    bot,
    botsData,
    channelTypes,
    endDate,
    isFetching,
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    updateParams,
    view,
  ]);

  return (
    <StyledAgentsStats isTableView={view === 'table'}>
      <StatsFilter
        channelTypes={channelTypes}
        startDate={startDate}
        endDate={endDate}
        viewType={view}
        showBots={true}
        updateParams={updateParams}
        selectedBotId={Number(bot) ?? undefined}
        exportReports={botReports}
      />
      {renderBody}
    </StyledAgentsStats>
  );
});
