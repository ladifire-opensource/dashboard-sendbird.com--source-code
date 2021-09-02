import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Spinner } from 'feather';
import moment from 'moment-timezone';

import { ISO_DATE_FORMAT, DATE_WITHOUT_YEAR_FORMAT, DEFAULT_DATE_FORMAT } from '@constants';
import {
  fetchStatsTicketCounts,
  fetchStatsTicketResponseTimes,
  fetchCSAT,
  fetchStatsTicketDurationTimes,
  fetchHourlyAverageTicketCounts,
} from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { getDoughnutChartColors } from '@ui/colors';
import { ContextualInfoIconTooltip } from '@ui/components';
import { LineChart, ChartWrapper, DoughnutChart, ChartCSATValue } from '@ui/components/chart';
import { renderTimestring } from '@utils';

import { ChartError } from './ChartError';
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
  height: 100%;
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

type ChartProps = {
  teamId?: AgentGroup['id'];
  startDate: string;
  endDate: string;
  channelTypes: TicketChannelType[];
};

export const ClosedTicketsChart = memo<ChartProps>(({ startDate, endDate, channelTypes, teamId }) => {
  const intl = useIntl();
  const [ticketsClosed, setTicketsClosed] = useState<Omit<FetchStatsTicketCountsResponse, 'openTickets'> | undefined>(
    undefined,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchStatsTicketCounts(pid, region, {
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
        group: teamId,
      });
      setTicketsClosed(result);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [pid, region, startDate, endDate, channelTypes, teamId, getErrorMessage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!ticketsClosed) return [{ data: [] }];
    return [
      {
        data: ticketsClosed.labels.map((label, index) => ({
          x: label,
          y: ticketsClosed.closedTickets[index],
        })),
      },
    ];
  }, [ticketsClosed]);

  const totalCount = useMemo(() => ticketsClosed?.closedTickets.reduce((acc, cur) => acc + cur, 0) ?? 0, [
    ticketsClosed,
  ]);

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
          <span className="summary__value">{totalCount}</span>
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
  }, [ticketsClosed, intl, totalCount, error, dataSource, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.teams.chart.closedTickets' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.teams.chart.closedTickets.tooltip',
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

export const AvgFirstResponseTimeChart = memo<ChartProps>(({ teamId, startDate, endDate, channelTypes }) => {
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
      const { data: result } = await fetchStatsTicketResponseTimes(pid, region, {
        group: teamId,
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
      });
      setFirstResponseTime(result);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [pid, region, teamId, startDate, endDate, channelTypes, getErrorMessage]);

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
        {intl.formatMessage({ id: 'desk.statistics.teams.chart.firstResponseTime' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.teams.chart.firstResponseTime.tooltip',
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

export const AvgResolutionTimeChart = memo<ChartProps>(({ teamId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [resolutionTimes, setResolutionTimes] = useState<FetchStatsTicketDurationTimesResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchStatsTicketDurationTimes(pid, region, {
        group: teamId,
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
      });
      setResolutionTimes(result);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [pid, region, teamId, startDate, endDate, channelTypes, getErrorMessage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!resolutionTimes) return [{ data: [] }];
    return [
      {
        data: resolutionTimes.labels.map((label, index) => ({
          x: label,
          y: resolutionTimes.durationTimes[index],
        })),
      },
    ];
  }, [resolutionTimes]);

  const renderResolutionTime = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }
    if (!resolutionTimes) {
      return null;
    }

    return (
      <>
        <p className="summary">
          <span className="summary__title">
            {intl.formatMessage({ id: 'desk.statistics.agents.detail.lbl.average' })}
          </span>
          <span className="summary__value">{isFetching ? '' : renderTimestring(resolutionTimes.average)}</span>
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
  }, [resolutionTimes, dataSource, error, fetch, intl, isFetching]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.teams.chart.resolutionTime' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.teams.chart.resolutionTime.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderResolutionTime
      )}
    </>
  );
});

export const ClosedTicketsPerHourChart = memo<ChartProps>(({ teamId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [hourlyClosedTickets, setHourlyClosedTickets] = useState<FetchHourlyAverageTicketCountAPIResponse | undefined>(
    undefined,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchHourlyAverageTicketCounts(pid, region, {
        group: teamId,
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
      });
      setHourlyClosedTickets(result);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [pid, region, teamId, startDate, endDate, channelTypes, getErrorMessage]);

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
        {intl.formatMessage({ id: 'desk.statistics.teams.chart.closedTicketsPerHour' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.teams.chart.closedTicketsPerHour.tooltip',
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

export const CSATChart = memo<ChartProps>(({ teamId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [CSAT, setCSAT] = useState<FetchCSATAPIResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const { data: result } = await fetchCSAT(pid, region, {
        group: teamId,
        start_date: startDate,
        end_date: endDate,
        channel_type: channelTypes,
      });
      setCSAT(result);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [pid, region, teamId, startDate, endDate, channelTypes, getErrorMessage]);

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

  const average = useMemo(() => (averageNumerator > 0 ? averageNumerator / averageDenominator : 0), [
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
        {intl.formatMessage({ id: 'desk.statistics.teams.chart.csat' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.teams.chart.csat.tooltip',
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

type Props = {
  teamId?: AgentGroup['id'];
  startDate: string;
  endDate: string;
  channelTypes: TicketChannelType[];
};

export const StatsTeamsChartView = memo<Props>(({ startDate, endDate, teamId, channelTypes }) => {
  return (
    <div data-test-id="DeskStatsAgent">
      <GridContainer>
        <ChartGridItem>
          <ClosedTicketsChart teamId={teamId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
        <ChartGridItem>
          <AvgFirstResponseTimeChart
            teamId={teamId}
            startDate={startDate}
            endDate={endDate}
            channelTypes={channelTypes}
          />
        </ChartGridItem>
        <ChartGridItem>
          <AvgResolutionTimeChart teamId={teamId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
        <HourlyStatusGridItem>
          <ClosedTicketsPerHourChart
            teamId={teamId}
            startDate={startDate}
            endDate={endDate}
            channelTypes={channelTypes}
          />
        </HourlyStatusGridItem>
        <ChartGridItem>
          <CSATChart teamId={teamId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
      </GridContainer>
    </div>
  );
});
