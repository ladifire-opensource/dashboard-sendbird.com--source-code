import { memo, useState, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Spinner } from 'feather';

import { DEFAULT_DATE_FORMAT } from '@constants';
import {
  fetchCSAT,
  fetchStatsBotAssignmentCounts,
  fetchStatsBotClosedTicketCounts,
  fetchStatsBotTicketClosingRates,
  fetchStatsBotClosingTime,
  fetchStatsBotHandoverTime,
  fetchStatsBotCSAT,
  fetchStatsAssignmentCounts,
  fetchStatsClosedTicketCounts,
  fetchStatsAssignmentClosingRates,
  fetchStatsClosingAssignedTimes,
  fetchStatsHandoverAssignedTimes,
} from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { getDoughnutChartColors } from '@ui/colors';
import { ContextualInfoIconTooltip } from '@ui/components';
import { LineChart, ChartWrapper, DoughnutChart, ChartCSATValue, ChartValues, ChartValue } from '@ui/components/chart';
import { renderTimestring } from '@utils';

import { getPreviousDates } from '../../../utils/charts';
import { ChartError } from './ChartError';

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
  grid-column: span 3;
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

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

type ChartProps = {
  botId?: DeskBot['id'];
  startDate: string;
  endDate: string;
  channelTypes: TicketChannelType[];
};

type StatsWithPrevious<T> = {
  current: T;
  previous: T;
};

export const ClosedTicketCountsChart = memo<ChartProps>(({ botId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();
  const [closedTicketCounts, setClosedTicketCounts] = useState<
    StatsWithPrevious<FetchStatsBotClosedTicketCountsResponse> | undefined
  >(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (botId) {
        const currentParams: FetchStatsBotClosedTicketCountsPayload = {
          id: botId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };

        const previousParams: FetchStatsBotClosedTicketCountsPayload = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };

        const requests = [
          fetchStatsBotClosedTicketCounts(pid, region, currentParams),
          fetchStatsBotClosedTicketCounts(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);

        setClosedTicketCounts({
          current,
          previous,
        });
      } else {
        const currentParams = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
          is_bot_only: true,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };
        const requests = [
          fetchStatsClosedTicketCounts(pid, region, currentParams),
          fetchStatsClosedTicketCounts(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);

        setClosedTicketCounts({
          current: {
            labels: current.labels,
            results: current.results,
            totalCount: current.results.reduce((acc, cur) => acc + cur, 0),
          },
          previous: {
            labels: previous.labels,
            results: previous.results,
            totalCount: previous.results.reduce((acc, cur) => acc + cur, 0),
          },
        });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [botId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!closedTicketCounts) return [{ data: [] }];
    return [
      {
        data: closedTicketCounts.current.labels.map((label, index) => ({
          x: label,
          y: closedTicketCounts.current.results[index],
        })),
      },
    ];
  }, [closedTicketCounts]);

  const renderChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }
    if (!closedTicketCounts) {
      return null;
    }
    return (
      <>
        <p className="summary">
          <ChartValues style={{ marginBottom: '33px' }}>
            <ChartValue
              value={closedTicketCounts.current.totalCount}
              previousValue={closedTicketCounts.previous.totalCount}
              testId="ResolutionTimeValue"
            />
          </ChartValues>
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
            useArea={true}
          />
        </ChartWrapper>
      </>
    );
  }, [closedTicketCounts, error, dataSource, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.bots.chart.closedTickets' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.bots.chart.closedTickets.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderChart
      )}
    </>
  );
});

export const TicketClosingRateChart = memo<ChartProps>(({ botId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [ticketClosingRate, setTicketClosingRate] = useState<
    StatsWithPrevious<FetchStatsBotTicketClosingRatesResponse> | undefined
  >(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (botId) {
        const currentParams = {
          id: botId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };
        const requests = [
          fetchStatsBotTicketClosingRates(pid, region, currentParams),
          fetchStatsBotTicketClosingRates(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);

        setTicketClosingRate({ current, previous });
      } else {
        const currentParams = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
          is_bot_only: true,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };
        const requests = [
          fetchStatsAssignmentClosingRates(pid, region, currentParams),
          fetchStatsAssignmentClosingRates(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);

        setTicketClosingRate({
          current,
          previous,
        });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [botId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!ticketClosingRate) return [{ data: [] }];
    return [
      {
        data: ticketClosingRate.current.labels.map((label, index) => ({
          x: label,
          y: ticketClosingRate.current.results[index] * 100,
        })),
      },
    ];
  }, [ticketClosingRate]);

  const renderChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }

    if (!ticketClosingRate) {
      return null;
    }

    return (
      <>
        <p className="summary">
          <ChartValues style={{ marginBottom: '33px' }}>
            <ChartValue
              value={ticketClosingRate.current.average}
              previousValue={ticketClosingRate.previous.average}
              format="0.0%"
              testId="ResolutionTimeValue"
            />
          </ChartValues>
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
            useArea={true}
          />
        </ChartWrapper>
      </>
    );
  }, [ticketClosingRate, dataSource, error, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.bots.chart.closedAssignmentRate' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.bots.chart.closedAssignmentRate.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderChart
      )}
    </>
  );
});

export const ReceivedTicketCountsChart = memo<ChartProps>(({ botId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [receivedTicketCounts, setReceivedTicketCounts] = useState<
    StatsWithPrevious<FetchStatsBotAssignmentCountsResponse> | undefined
  >(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (botId) {
        const currentParams = {
          id: botId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };

        const requests = [
          fetchStatsBotAssignmentCounts(pid, region, currentParams),
          fetchStatsBotAssignmentCounts(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);
        setReceivedTicketCounts({
          current,
          previous,
        });
      } else {
        const currentParams = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
          is_bot_only: true,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };

        const requests = [
          fetchStatsAssignmentCounts(pid, region, currentParams),
          fetchStatsAssignmentCounts(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);
        setReceivedTicketCounts({
          current: {
            labels: current.labels,
            results: current.results,
            totalCount: current.results.reduce((acc, cur) => acc + cur, 0),
          },
          previous: {
            labels: previous.labels,
            results: previous.results,
            totalCount: previous.results.reduce((acc, cur) => acc + cur, 0),
          },
        });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [botId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!receivedTicketCounts) return [{ data: [] }];
    return [
      {
        data: receivedTicketCounts.current.labels.map((label, index) => ({
          x: label,
          y: receivedTicketCounts.current.results[index],
        })),
      },
    ];
  }, [receivedTicketCounts]);

  const renderChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }
    if (!receivedTicketCounts) {
      return null;
    }

    return (
      <>
        <p className="summary">
          <ChartValues style={{ marginBottom: '33px' }}>
            {!isFetching && (
              <ChartValue
                value={receivedTicketCounts.current.totalCount}
                previousValue={receivedTicketCounts.previous.totalCount}
                testId="ResolutionTimeValue"
              />
            )}
          </ChartValues>
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
              },
            }}
            noPadding={true}
            useArea={true}
          />
        </ChartWrapper>
      </>
    );
  }, [dataSource, error, fetch, receivedTicketCounts, isFetching]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.bots.chart.assignments' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.bots.chart.assignments.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderChart
      )}
    </>
  );
});

export const ClosingTimeChart = memo<ChartProps>(({ botId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [closingTime, setClosingTime] = useState<StatsWithPrevious<FetchStatsBotClosingTimeResponse> | undefined>(
    undefined,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (botId) {
        const currentParams = {
          id: botId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };

        const requests = [
          fetchStatsBotClosingTime(pid, region, currentParams),
          fetchStatsBotClosingTime(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);

        setClosingTime({
          current,
          previous,
        });
      } else {
        const currentParams = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
          is_bot_only: true,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };
        const requests = [
          fetchStatsClosingAssignedTimes(pid, region, currentParams),
          fetchStatsClosingAssignedTimes(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);
        setClosingTime({
          current,
          previous,
        });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [botId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!closingTime) return [{ data: [] }];
    return [
      {
        label: '',
        data: closingTime.current.results.map((count, index) => ({
          x: closingTime.current.labels[index],
          y: count,
        })),
      },
    ];
  }, [closingTime]);

  const renderChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }

    if (!closingTime) {
      return null;
    }

    return (
      <>
        <p className="summary">
          <ChartValues style={{ marginBottom: '33px' }}>
            {!isFetching && (
              <ChartValue
                value={closingTime.current.average}
                previousValue={closingTime.previous.average}
                format={renderTimestring}
                testId="ResolutionTimeValue"
              />
            )}
          </ChartValues>
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
            useArea={true}
          />
        </ChartWrapper>
      </>
    );
  }, [error, closingTime, dataSource, isFetching, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.bots.chart.closingTime' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.bots.chart.closingTime.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderChart
      )}
    </>
  );
});

export const HandoverChart = memo<ChartProps>(({ botId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();
  const [handoverTime, setHandoverTime] = useState<StatsWithPrevious<FetchStatsBotHandoverTimeResponse> | undefined>(
    undefined,
  );
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (botId) {
        const currentParams = {
          id: botId,
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };

        const requests = [
          fetchStatsBotHandoverTime(pid, region, currentParams),
          fetchStatsBotHandoverTime(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);
        setHandoverTime({ current, previous });
      } else {
        const currentParams = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
          is_bot_only: true,
        };
        const previousParams = {
          ...currentParams,
          ...getPreviousDates(startDate, endDate),
        };
        const requests = [
          fetchStatsHandoverAssignedTimes(pid, region, currentParams),
          fetchStatsHandoverAssignedTimes(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [current, previous] = responses.map((res) => res.data);
        setHandoverTime({ current, previous });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [botId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const dataSource = useMemo(() => {
    if (!handoverTime) return [{ data: [] }];
    return [
      {
        data: handoverTime.current.labels.map((label, index) => ({
          x: label,
          y: handoverTime.current.results[index],
        })),
      },
    ];
  }, [handoverTime]);

  const renderChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }
    if (!handoverTime) {
      return null;
    }
    return (
      <>
        <p className="summary">
          <ChartValues style={{ marginBottom: '33px' }}>
            {!isFetching && (
              <ChartValue
                value={handoverTime.current.average}
                previousValue={handoverTime.previous.average}
                format={renderTimestring}
                testId="ResolutionTimeValue"
              />
            )}
          </ChartValues>
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
            useArea={true}
          />
        </ChartWrapper>
      </>
    );
  }, [handoverTime, error, dataSource, isFetching, fetch]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.bots.chart.handover' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.bots.chart.handover.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderChart
      )}
    </>
  );
});

export const CSATChart = memo<ChartProps>(({ botId, startDate, endDate, channelTypes }) => {
  const intl = useIntl();

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const [csat, setCSAT] = useState<FetchStatsBotCSATResponse | undefined>(undefined);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      if (botId) {
        const { data: result } = await fetchStatsBotCSAT(pid, region, {
          id: botId,
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
          is_bot_only: true,
        });
        setCSAT({ ...result, results: result.customerSatisfactionScoreCounts });
      }
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [botId, channelTypes, endDate, getErrorMessage, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const averageNumerator = useMemo(
    () => csat?.results.map((score, index) => score * (index + 1)).reduce((prev, curr) => prev + curr, 0) ?? 0,
    [csat],
  );

  const averageDenominator = useMemo(() => csat?.results.reduce((prev, curr) => prev + curr, 0) ?? 0, [csat?.results]);

  const average = useMemo(() => (averageDenominator > 0 ? averageNumerator / averageDenominator : 0), [
    averageDenominator,
    averageNumerator,
  ]);

  const renderChart = useMemo(() => {
    if (error) {
      return <ChartError error={error} onRetry={fetch} />;
    }

    if (!csat) {
      return null;
    }

    return (
      <>
        <p className="summary">{isFetching ? '' : <ChartCSATValue value={average} />}</p>
        <DoughnutChart
          key="desk_stats_chart_agent_csat"
          labels={csat.labels
            .map((item) =>
              item === '1'
                ? intl.formatMessage({ id: `desk.monitoring.csat.${item}star` })
                : intl.formatMessage({ id: `desk.monitoring.csat.${item}stars` }),
            )
            .reverse()}
          values={[...csat.results].reverse()}
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
  }, [csat, average, error, fetch, intl, isFetching]);

  return (
    <>
      <GridItemTitle>
        {intl.formatMessage({ id: 'desk.statistics.bots.chart.csat' })}
        <ContextualInfoIconTooltip
          content={intl.formatMessage({
            id: 'desk.statistics.bots.chart.csat.tooltip',
          })}
        />
      </GridItemTitle>
      {isFetching ? (
        <SpinnerContainer data-test-id="SpinnerContainer">
          <Spinner />
        </SpinnerContainer>
      ) : (
        renderChart
      )}
    </>
  );
});

type Props = {
  botId?: DeskBot['id'];
  startDate: string;
  endDate: string;
  channelTypes: TicketChannelType[];
};

export const StatsBotsChartView = memo<Props>(({ startDate, endDate, botId, channelTypes }) => {
  return (
    <div data-test-id="DeskStatsBot">
      <GridContainer>
        <ChartGridItem>
          <ClosedTicketCountsChart botId={botId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
        <ChartGridItem>
          <TicketClosingRateChart botId={botId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
        <ChartGridItem>
          <ReceivedTicketCountsChart
            botId={botId}
            startDate={startDate}
            endDate={endDate}
            channelTypes={channelTypes}
          />
        </ChartGridItem>
        <ChartGridItem>
          <ClosingTimeChart botId={botId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
        <ChartGridItem>
          <HandoverChart botId={botId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
        <ChartGridItem>
          <CSATChart botId={botId} startDate={startDate} endDate={endDate} channelTypes={channelTypes} />
        </ChartGridItem>
      </GridContainer>
    </div>
  );
});
