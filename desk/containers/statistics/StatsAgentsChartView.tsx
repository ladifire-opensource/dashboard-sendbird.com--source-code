import { memo, useState, useCallback, useEffect, useMemo, useLayoutEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Spinner, Subtitles, Body, SingleDatePicker } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { ISO_DATE_FORMAT, DATE_WITHOUT_YEAR_FORMAT, DEFAULT_DATE_FORMAT } from '@constants';
import {
  fetchAgentStatTicketCounts,
  fetchAgentStatAssignmentCounts,
  fetchAgentStatTicketResponseTimes,
  fetchAgentStatHourlyClosedTickets,
  fetchAgentStatCSAT,
  fetchStatsAssignmentCounts,
  fetchStatsTicketCounts,
  fetchStatsTicketResponseTimes,
  fetchHourlyAverageTicketCounts,
  fetchCSAT,
  fetchAgentStatConnectionLogs,
  fetchAgentStatConnectionLogsTime,
} from '@desk/api';
import AgentConnectionDiagram from '@desk/components/AgentConnectionDiagram';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDimension, useShallowEqualSelector } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { QueryParamsWithUpdate } from '@hooks/useQueryString';
import { getDoughnutChartColors } from '@ui/colors';
import { ContextualInfoIconTooltip } from '@ui/components';
import { ChartCSATValue, DoughnutChart, LineChart, ChartWrapper } from '@ui/components/chart';
import { renderTimestring, getWorkingHourVerticalLineColor } from '@utils';

import { ChartError } from './ChartError';
import { SearchParams } from './StatsAgents';
import { HourlyBarChart } from './charts';

const { background: doughnutChartBackground, hover: doughnutChartHover } = getDoughnutChartColors({ dataSize: 5 });

const GridRow = styled.section`
  display: grid;
  grid-gap: 32px 24px;
  align-items: center;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-flow: row;
  padding: 0 0 32px;
`;

const GridContainer = styled(GridRow)``;

const GridItemTitle = styled.h4`
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: -0.3px;
  color: ${cssVariables('neutral-10')};
`;

const ChartGridItem = styled.div`
  grid-column: span 2;
  position: relative;
  align-self: start;
  border: 1px solid ${cssVariables('neutral-3')};
  padding: 26px 24px;
  border-radius: 4px;
  height: 378px;

  .summary {
    display: flex;
    flex-direction: row;
    align-items: baseline;
    margin-top: 20px;
    margin-bottom: 16px;
    height: 24px;

    &__title {
      font-size: 14px;
      color: ${cssVariables('neutral-6')};
    }

    &__value {
      font-size: 24px;
      font-weight: 600;
      line-height: 1;
      letter-spacing: -0.7px;
      color: ${cssVariables('purple-7')};
      margin-left: 8px;

      // prevent container from shrinking vertically when empty
      &:empty::after {
        display: inline-block;
        content: ' ';
        font-size: 24px;
        line-height: 1;
      }
    }
  }
`;

const HourlyStatusGridItem = styled.div`
  grid-column: span 4;
  position: relative;
  padding: 26px 24px;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  height: 100%;
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const DailyStatusTrackingGridItem = styled.div`
  grid-column: span 6;
  position: relative;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  padding: 24px;

  .service-hours__label {
    color: ${cssVariables('neutral-6')};
  }

  .service-hours__value {
    margin-left: 8px;
    margin-right: 16px;
    color: ${cssVariables('neutral-10')};

    span + span {
      margin-left: 12px;
    }
  }

  .date-picker-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 14px;
    line-height: 20px;
  }

  .daily-durations {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-top: 16px;

    &__label {
      display: flex;
      align-items: center;
      ${Body['body-short-01']}
      color: ${cssVariables('neutral-7')};
      margin-right: 8px;
      &:not(:first-of-type) {
        margin-left: 24px;
      }
    }

    &__value {
      ${Subtitles['subtitle-03']}
      color: ${cssVariables('neutral-10')};
    }
  }
`;

const DailyStatusHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Dot = styled.span<{ color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
  margin-right: 6px;
`;

const StyledAgentConnectionDiagram = styled(AgentConnectionDiagram)`
  width: 100%;
  height: 60px;
  margin-top: 12px;
`;

const WorkingHourLine = styled.hr<{ color: string }>`
  display: inline-block;
  margin-right: 8px;
  border: none;
  border-top: 2px dashed ${({ color }) => color};
  background-color: white;
  width: 24px;
  height: 1px;
  vertical-align: middle;
  color: white;
`;

type ChartProps = {
  agentId?: Agent['id'];
  startDate: string;
  endDate: string;
  channelTypes: TicketChannelType[];
};

export const ClosedTicketsChart = memo<ChartProps>(({ agentId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();
  const [ticketsClosed, setTicketsClosed] = useState<FetchAgentStatTicketCountsResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (agentId) {
        const { data: result } = await fetchAgentStatTicketCounts(pid, region, {
          id: agentId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setTicketsClosed(result);
      } else {
        const { data: result } = await fetchStatsTicketCounts(pid, region, {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setTicketsClosed({
          labels: result.labels,
          totalCount: result.closedTickets.reduce((acc, cur) => acc + cur, 0),
          numberOfTickets: result.closedTickets,
        });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [agentId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!ticketsClosed) return [{ data: [] }];
    return [
      {
        data: ticketsClosed.labels.map((label, index) => ({
          x: label,
          y: ticketsClosed.numberOfTickets[index],
        })),
      },
    ];
  }, [ticketsClosed]);

  const renderTicketsClosed = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }
    if (!ticketsClosed) {
      return null;
    }
    return (
      <>
        <p className="summary">
          <span className="summary__title">
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.closed' })}
          </span>
          <span className="summary__value">{ticketsClosed.totalCount}</span>
        </p>
        <ChartWrapper>
          <LineChart
            height="200px"
            datasets={dataSource}
            noPadding={true}
            options={{
              scales: {
                xAxes: [
                  {
                    time: {
                      unit: 'day',
                      tooltipFormat: DEFAULT_DATE_FORMAT,
                      displayFormats: { day: 'MMM Do' },
                    },
                  },
                ],
              },
            }}
          />
        </ChartWrapper>
      </>
    );
  }, [ticketsClosed, intl, error, dataSource, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.agents.chart.closedTickets' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.agents.chart.closedTickets.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderTicketsClosed
      )}
    </>
  );
});

export const AssignmentsChart = memo<ChartProps>(({ agentId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [assignments, setAssignments] = useState<FetchAgentStatAssignmentCountsResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (agentId) {
        const { data: result } = await fetchAgentStatAssignmentCounts(pid, region, {
          id: agentId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setAssignments(result);
      } else {
        const { data: result } = await fetchStatsAssignmentCounts(pid, region, {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setAssignments({
          labels: result.labels,
          numberOfAssignments: result.results,
          totalCount: result.results.reduce((acc, cur) => acc + cur, 0),
        });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [agentId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!assignments) return [{ data: [] }];
    return [
      {
        data: assignments.labels.map((label, index) => ({
          x: label,
          y: assignments.numberOfAssignments[index],
        })),
      },
    ];
  }, [assignments]);

  const renderAssignments = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }

    if (!assignments) {
      return null;
    }

    return (
      <>
        <p className="summary">
          <span className="summary__title">
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.assigned' })}
          </span>
          <span className="summary__value">{assignments.totalCount}</span>
        </p>
        <ChartWrapper>
          <LineChart
            height="200px"
            datasets={dataSource}
            noPadding={true}
            options={{
              scales: {
                xAxes: [
                  {
                    time: {
                      unit: 'day',
                      tooltipFormat: DEFAULT_DATE_FORMAT,
                      displayFormats: { day: 'MMM Do' },
                    },
                  },
                ],
              },
            }}
          />
        </ChartWrapper>
      </>
    );
  }, [assignments, dataSource, error, fetch, intl]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.agents.chart.assignments' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.agents.chart.assignments.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderAssignments
      )}
    </>
  );
});

export const AvgFirstResponseTimeChart = memo<ChartProps>(({ agentId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [firstResponseTime, setFirstResponseTime] = useState<FetchStatsTicketResponseTimesResponse | undefined>(
    undefined,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (agentId) {
        const { data: result } = await fetchAgentStatTicketResponseTimes(pid, region, {
          id: agentId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setFirstResponseTime(result);
      } else {
        const { data: result } = await fetchStatsTicketResponseTimes(pid, region, {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setFirstResponseTime(result);
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [agentId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!firstResponseTime) return [{ data: [] }];
    return [
      {
        data: firstResponseTime.labels.map((label, index) => ({
          x: label,
          y: firstResponseTime.responseTimes[index],
        })),
      },
    ];
  }, [firstResponseTime]);

  const renderFirstResponseTime = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }
    if (!firstResponseTime) {
      return null;
    }

    return (
      <>
        <p className="summary">
          <span className="summary__title">
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.average' })}
          </span>
          <span className="summary__value">{isFetching ? '' : renderTimestring(firstResponseTime.average)}</span>
        </p>
        <ChartWrapper>
          <LineChart
            height="200px"
            datasets={dataSource}
            options={{
              scales: {
                xAxes: [
                  {
                    time: {
                      unit: 'day',
                      tooltipFormat: DEFAULT_DATE_FORMAT,
                      displayFormats: { day: 'MMM Do' },
                    },
                  },
                ],
                yAxes: [
                  {
                    ticks: {
                      callback: (value) => renderTimestring(value),
                    },
                  },
                ],
              },
            }}
            tooltipValueFormatter={({ value }) => renderTimestring(value ?? 0)}
            noPadding={true}
          />
        </ChartWrapper>
      </>
    );
  }, [dataSource, error, fetch, firstResponseTime, intl, isFetching]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.agents.chart.firstResponseTime' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.agents.chart.firstResponseTime.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderFirstResponseTime
      )}
    </>
  );
});

export const ClosedTicketsPerHourChart = memo<ChartProps>(({ agentId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [hourlyClosedTickets, setHourlyClosedTickets] = useState<FetchAgentStatHourlyClosedTicketsResponse | undefined>(
    undefined,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (agentId) {
        const { data: result } = await fetchAgentStatHourlyClosedTickets(pid, region, {
          id: agentId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setHourlyClosedTickets(result);
      } else {
        const { data: result } = await fetchHourlyAverageTicketCounts(pid, region, {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setHourlyClosedTickets(result);
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [agentId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!hourlyClosedTickets) return [{ data: [] }];

    const hourlyLabels = Array(24)
      .fill(0)
      .map((_, index) => moment(startDate).set('hour', index).set('minute', 0).set('second', 0).tz('UTC').valueOf());
    return [
      {
        label: '',
        data: hourlyClosedTickets.hourlyClosedTicketCount.map((count, index) => ({
          x: hourlyLabels[index],
          y: count,
        })),
      },
    ];
  }, [hourlyClosedTickets, startDate]);

  const renderHourlyClosedTickets = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }

    if (!hourlyClosedTickets) {
      return null;
    }

    return (
      <>
        <ChartWrapper>
          <HourlyBarChart
            datasets={dataSource}
            selectedDateRange={`${moment(startDate, ISO_DATE_FORMAT).format(DATE_WITHOUT_YEAR_FORMAT)} - ${moment(
              endDate,
              ISO_DATE_FORMAT,
            ).format(DATE_WITHOUT_YEAR_FORMAT)}`}
          />
        </ChartWrapper>
      </>
    );
  }, [hourlyClosedTickets, error, dataSource, startDate, endDate, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.agents.chart.closedTicketsHourly' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.agents.chart.closedTicketsHourly.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderHourlyClosedTickets
      )}
    </>
  );
});

export const CSATChart = memo<ChartProps>(({ agentId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [CSAT, setCSAT] = useState<FetchCSATAPIResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (agentId) {
        const { data: result } = await fetchAgentStatCSAT(pid, region, {
          id: agentId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setCSAT(result);
      } else {
        const { data: result } = await fetchCSAT(pid, region, {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        });
        setCSAT(result);
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [agentId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const averageNumerator = useMemo(
    () =>
      CSAT?.customerSatisfactionScoreCounts
        .map((score, index) => score * (index + 1))
        .reduce((prev, curr) => prev + curr, 0) ?? 0,
    [CSAT],
  );

  const averageDenominator = useMemo(
    () => CSAT?.customerSatisfactionScoreCounts.reduce((prev, curr) => prev + curr, 0) ?? 0,
    [CSAT],
  );

  const average = useMemo(() => (averageDenominator > 0 ? averageNumerator / averageDenominator : 0), [
    averageDenominator,
    averageNumerator,
  ]);

  const renderCSATChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }

    if (!CSAT) {
      return null;
    }

    return (
      <>
        <p className="summary">{isFetching ? '' : <ChartCSATValue value={average} />}</p>
        <DoughnutChart
          key="desk_stats_chart_agent_csat"
          labels={CSAT.labels
            .map((item) =>
              item === '1'
                ? intl.formatMessage({ id: `desk.monitoring.csat.${item}star` })
                : intl.formatMessage({ id: `desk.monitoring.csat.${item}stars` }),
            )
            .reverse()}
          values={[...CSAT.customerSatisfactionScoreCounts].reverse()}
          colors={{
            backgroundColors: doughnutChartBackground,
            hoverBorderColors: doughnutChartHover,
          }}
          tooltip={{
            items: [
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.csat.lbl.responses' }),
              },
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.csat.lbl.responsesPercentage' }),
                valueFormatter: (value: number, values: number[], hiddenLegends: number[]) => {
                  return `${Math.floor(
                    (value /
                      values
                        .filter((item, index) => !hiddenLegends.includes(index))
                        .reduce((sum, curr) => sum + curr, 0)) *
                      100,
                  )}%`;
                },
                color: cssVariables('neutral-10'),
              },
            ],
          }}
          centerLabelTop={intl.formatMessage({ id: 'desk.statistics.overview.csat.lbl.total.top' })}
          centerLabelBottom={intl.formatMessage({ id: 'desk.statistics.overview.csat.lbl.total.bottom' })}
        />
      </>
    );
  }, [CSAT, average, error, fetch, intl, isFetching]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.agents.chart.csat' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.agents.chart.csat.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderCSATChart
      )}
    </>
  );
});

export const AgentDailyStatusChart = memo<{
  agentId: Agent['id'];
  statusDate: string;
  updateParams: Props['updateParams'];
}>(({ agentId, statusDate, updateParams }) => {
  const intl = useIntl();

  const { operationHourDay } = useShallowEqualSelector((state: RootState) => ({
    operationHourDay: state.desk.project.operationHourDay,
  }));
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const { x: viewportWidth } = useDimension();

  const dailyStatusTrackingGridItemRef = useRef<HTMLDivElement>(null);
  const [dailyStatusTrackingGridItemWidth, setDailyStatusTrackingGridItemWidth] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [connectionLogsTime, setConnectionLogsTime] = useState<FetchAgentStatConnectionLogsTimeResponse | undefined>(
    undefined,
  );
  const [connectionLogs, setConnectionLogs] = useState<readonly AgentConnectionLog[] | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const statusDateMoment = useMemo(() => moment(statusDate, ISO_DATE_FORMAT), [statusDate]);
  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const [connectionLogsTimesResult, connectionLogsResult] = await Promise.all([
        fetchAgentStatConnectionLogsTime(pid, region, {
          id: agentId,
          start_date: statusDate,
          end_date: statusDate,
        }),
        fetchAgentStatConnectionLogs(pid, region, {
          id: agentId,
          date: statusDate,
        }),
      ]);

      setConnectionLogsTime(connectionLogsTimesResult.data);
      setConnectionLogs([connectionLogsResult.data.previousConnectionLog, ...connectionLogsResult.data.connectionLogs]);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [pid, region, agentId, statusDate, getErrorMessage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleChangeDate = useCallback(
    (moment: Moment) => {
      updateParams({ statusDate: moment.format(ISO_DATE_FORMAT) });
    },
    [updateParams],
  );

  const parsedOperationHourDay: OperationHourDay = useMemo(() => JSON.parse(operationHourDay), [operationHourDay]);

  const getOperationHoursOfDay = useCallback(
    (day: Moment) => {
      const weekday = day.isoWeekday(); // Monday: 1 - Sunday: 7
      const weekdayKeys = ['', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      return parsedOperationHourDay[weekdayKeys[weekday]];
    },
    [parsedOperationHourDay],
  );

  const dailyStatusOperationHoursText = useMemo(() => {
    const formatTime = (time: string) => moment(time, 'HH:mm').format('LTS');
    const { enabled, operationTimes } = getOperationHoursOfDay(statusDateMoment);
    if (enabled) {
      return operationTimes.map(({ from, to }, index) => (
        <span key={`${from}-${to}`}>
          <WorkingHourLine color={getWorkingHourVerticalLineColor(index)} />
          {`${formatTime(from)} - ${formatTime(to)}`}
        </span>
      ));
    }
    return 'Closed';
  }, [getOperationHoursOfDay, statusDateMoment]);

  useLayoutEffect(() => {
    if (dailyStatusTrackingGridItemRef.current) {
      setDailyStatusTrackingGridItemWidth(dailyStatusTrackingGridItemRef.current.clientWidth);
    }
  }, []);

  useEffect(() => {
    if (dailyStatusTrackingGridItemRef.current) {
      setDailyStatusTrackingGridItemWidth(dailyStatusTrackingGridItemRef.current.clientWidth);
    }
  }, [viewportWidth]);

  const renderChart = useMemo(() => {
    if (error) return <ChartError error={error} onRetry={fetch} />;
    if (!connectionLogsTime || !connectionLogs) return null;

    return (
      <>
        <dl className="daily-durations">
          <dt className="daily-durations__label">
            <Dot color={cssVariables('green-5')} />
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.online' })}
          </dt>
          <dd className="daily-durations__value daily-durations__value--online">
            {renderTimestring(connectionLogsTime.ONLINE)}
          </dd>
          <dt className="daily-durations__label">
            <Dot color={cssVariables('orange-5')} />
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.away' })}
          </dt>
          <dd className="daily-durations__value daily-durations__value--away">
            {renderTimestring(connectionLogsTime.AWAY)}
          </dd>
        </dl>

        <StyledAgentConnectionDiagram
          date={statusDate}
          connectionLogs={connectionLogs ?? []}
          detailed={true}
          serviceHours={getOperationHoursOfDay(statusDateMoment)}
          width={dailyStatusTrackingGridItemWidth}
        />
      </>
    );
  }, [
    connectionLogs,
    connectionLogsTime,
    dailyStatusTrackingGridItemWidth,
    error,
    fetch,
    getOperationHoursOfDay,
    intl,
    statusDateMoment,
    statusDate,
  ]);

  return (
    <DailyStatusTrackingGridItem ref={dailyStatusTrackingGridItemRef}>
      <DailyStatusHeader>
        <GridItemTitle>{intl.formatMessage({ id: 'desk.statistics.agents.chart.dailyStatusTracking' })}</GridItemTitle>
        <div className="date-picker-wrapper">
          <span className="service-hours__label">
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.workingHours' })}
          </span>
          <span className="service-hours__value">{dailyStatusOperationHoursText}</span>
          <SingleDatePicker
            date={statusDateMoment}
            onChange={handleChangeDate}
            maxDate={moment()}
            placement="top-end"
            size="small"
          />
        </div>
      </DailyStatusHeader>

      <div style={{ height: '100px' }}>
        {isFetching ? (
          <SpinnerContainer data-test-id="SpinnerContainer">
            <Spinner />
          </SpinnerContainer>
        ) : (
          renderChart
        )}
      </div>
    </DailyStatusTrackingGridItem>
  );
});

type Props = {
  agentId?: Agent['id'];
  startDate: string;
  endDate: string;
  statusDate: string;
  channelTypes: TicketChannelType[];
  updateParams: QueryParamsWithUpdate<SearchParams>['updateParams'];
};

export const StatsAgentsChartView = memo<Props>(
  ({ startDate, endDate, agentId, channelTypes, statusDate, updateParams }) => {
    return (
      <div data-test-id="DeskStatsAgent">
        <GridContainer>
          <ChartGridItem>
            <ClosedTicketsChart agentId={agentId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
          </ChartGridItem>
          <ChartGridItem>
            <AssignmentsChart agentId={agentId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
          </ChartGridItem>
          <ChartGridItem>
            <AvgFirstResponseTimeChart
              agentId={agentId}
              startDate={startDate}
              endDate={endDate}
              channelTypes={channelTypes}
            />
          </ChartGridItem>
          <HourlyStatusGridItem>
            <ClosedTicketsPerHourChart
              agentId={agentId}
              startDate={startDate}
              endDate={endDate}
              channelTypes={channelTypes}
            />
          </HourlyStatusGridItem>
          <ChartGridItem>
            <CSATChart agentId={agentId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
          </ChartGridItem>
          {agentId && <AgentDailyStatusChart agentId={agentId} statusDate={statusDate} updateParams={updateParams} />}
        </GridContainer>
      </div>
    );
  },
);
