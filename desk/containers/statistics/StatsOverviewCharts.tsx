import { memo, useEffect, useCallback, useState, useMemo, RefObject } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssColors, cssVariables, Spinner } from 'feather';
import moment from 'moment-timezone';

import { ISO_DATE_FORMAT, DATE_WITHOUT_YEAR_FORMAT } from '@constants';
import {
  fetchStatsTicketCounts,
  fetchHourlyAverageMessageCounts,
  fetchStatsTicketResponseTimes,
  fetchStatsTicketDurationTimes,
  fetchCSAT,
  fetchClosedStatuses,
} from '@desk/api';
import { fetchHourlyAverageTicketCounts, fetchStatsTicketMessageCounts } from '@desk/api';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { getDoughnutChartColors } from '@ui/colors';
import { Card, CardBodyColumn, ContextualInfoIconTooltip } from '@ui/components';
import {
  ChartTitle,
  ChartValues,
  ChartValue,
  ChartValueTotal,
  DoughnutChart,
  ChartCSATValue,
} from '@ui/components/chart';
import { renderTimestring, getClosedStatusesIndex } from '@utils';

import { ChartError } from './ChartError';
import { DailyLineChart, HourlyBarChart } from './charts';

const {
  background: doughnutChartBackground,
  hover: doughnutChartHover,
  size: doughnutChartSize,
} = getDoughnutChartColors({ dataSize: 6 });

export const Stats = styled.div`
  position: relative;

  ${Card}, ${CardBodyColumn} {
    height: 100%;
  }

  ${CardBodyColumn} {
    justify-content: space-between;
    height: 370px;

    > div {
      max-height: 265px;
    }
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const getStatWithTotal = (data, key) => {
  return {
    total: data[key].reduce((sum, value) => sum + value, 0),
    statistics: data.labels.map((label, index) => {
      return {
        x: label,
        y: data[key][index],
      };
    }),
  };
};

type ChartProps = {
  pid: Project['pid'];
  region: Application['region'];
  params: {
    startDate: string;
    endDate: string;
    channelTypes: TicketChannelType[];
  };
  tooltipBoundariesElementRef?: RefObject<HTMLElement>;
};

const getPreviousParams = ({ startDate, endDate, channelTypes }: ChartProps['params']) => {
  const durationDiff = moment(startDate, ISO_DATE_FORMAT)
    .startOf('day')
    .diff(moment(endDate, ISO_DATE_FORMAT).clone().add(1, 'day').startOf('day'));

  return {
    start_date: moment(startDate, ISO_DATE_FORMAT).add(durationDiff, 'milliseconds').format(ISO_DATE_FORMAT),
    end_date: moment(endDate, ISO_DATE_FORMAT).add(durationDiff, 'milliseconds').format(ISO_DATE_FORMAT),
    channel_type: channelTypes,
  };
};

const getDateRangeDays = (startDate: string, endDate: string) =>
  moment(endDate, ISO_DATE_FORMAT).add(1, 'day').diff(moment(startDate, ISO_DATE_FORMAT), 'days');

export const TicketsChart = memo<ChartProps>(
  ({ pid, region, params: { startDate, endDate, channelTypes }, tooltipBoundariesElementRef }) => {
    const intl = useIntl();
    const { getErrorMessage } = useDeskErrorHandler();

    const [isFetching, setIsFetching] = useState(false);
    const [closedTickets, setClosedTickets] = useState<StatsWithPrevious | undefined>(undefined);
    const [openTickets, setOpenTickets] = useState<StatsWithPrevious | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);

    const fetchTicketsChart = useCallback(async () => {
      try {
        setIsFetching(true);
        const currentParams: FetchStatsTicketCountsPayload = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };

        const previousParams: FetchStatsTicketCountsPayload = getPreviousParams({ startDate, endDate, channelTypes });

        const requests = [
          fetchStatsTicketCounts(pid, region, currentParams),
          fetchStatsTicketCounts(pid, region, previousParams),
        ];
        const responses = await Promise.all(requests);
        const [currentResult, previousResult] = responses.map((res) => res.data);

        setClosedTickets({
          current: getStatWithTotal(currentResult, 'closedTickets'),
          previous: getStatWithTotal(previousResult, 'closedTickets'),
        });
        setOpenTickets({
          current: getStatWithTotal(currentResult, 'openTickets'),
          previous: getStatWithTotal(previousResult, 'openTickets'),
        });
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsFetching(false);
      }
    }, [channelTypes, endDate, getErrorMessage, pid, region, startDate]);

    useEffect(() => {
      fetchTicketsChart();
    }, [fetchTicketsChart]);

    const dateRangeDays = useMemo(() => getDateRangeDays(startDate, endDate), [endDate, startDate]);

    const renderTicketsChart = useMemo(() => {
      if (error) return <ChartError error={error} onRetry={fetchTicketsChart} />;
      if (!closedTickets || !openTickets) return null;
      return (
        <>
          <ChartValues style={{ marginBottom: '35px' }}>
            <ChartValue
              label={intl.formatMessage({ id: 'desk.statistics.overview.tickets.lbl.created' })}
              value={openTickets?.current.total}
              previousValue={openTickets?.previous.total}
              tooltipMessage={intl.formatMessage(
                { id: 'desk.statistics.overview.chart.compareTooltip' },
                { days: dateRangeDays },
              )}
              format="0,0"
              testId="CreatedTicketsValue"
            />
            <ChartValue
              label={intl.formatMessage({ id: 'desk.statistics.overview.tickets.lbl.closed' })}
              value={closedTickets?.current.total}
              previousValue={closedTickets?.previous.total}
              tooltipMessage={intl.formatMessage(
                { id: 'desk.statistics.overview.chart.compareTooltip' },
                { days: dateRangeDays },
              )}
              format="0,0"
              color={cssVariables('blue-5')}
              testId="ClosedTicketsValue"
            />
          </ChartValues>
          <DailyLineChart
            key="desk_stats_chart_tickets"
            datasets={[
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.tickets.lbl.created' }),
                data: openTickets?.current.statistics,
              },
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.tickets.lbl.closed' }),
                data: closedTickets?.current.statistics,
              },
            ]}
          />
        </>
      );
    }, [closedTickets, dateRangeDays, error, fetchTicketsChart, intl, openTickets]);

    return (
      <Card>
        <CardBodyColumn>
          <ChartTitle>
            {intl.formatMessage({ id: 'desk.statistics.overview.header.tickets' })}
            <ContextualInfoIconTooltip
              content={intl.formatMessage({ id: 'desk.statistics.overview.tickets.desc.tooltip' })}
              popperProps={{
                modifiers: {
                  preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined },
                },
              }}
            />
          </ChartTitle>
          {isFetching ? (
            <SpinnerContainer data-test-id="SpinnerContainer">
              <Spinner />
            </SpinnerContainer>
          ) : (
            renderTicketsChart
          )}
        </CardBodyColumn>
      </Card>
    );
  },
);

export const HourlyTicketsChart = memo<ChartProps>(
  ({ pid, region, params: { startDate, endDate, channelTypes }, tooltipBoundariesElementRef }) => {
    const intl = useIntl();
    const { getErrorMessage } = useDeskErrorHandler();
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newTicketCount, setNewTicketCount] = useState<StatsWithPrevious | undefined>(undefined);
    const [closedTicketCount, setClosedTicketCount] = useState<StatsWithPrevious | undefined>(undefined);

    const fetch = useCallback(async () => {
      try {
        setIsFetching(true);
        const currentParams: FetchHourlyAverageTicketCountAPIPayload = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };
        const previousParams: FetchHourlyAverageTicketCountAPIPayload = getPreviousParams({
          startDate,
          endDate,
          channelTypes,
        });

        const requests = [
          fetchHourlyAverageTicketCounts(pid, region, currentParams),
          fetchHourlyAverageTicketCounts(pid, region, previousParams),
        ];

        const responses = await Promise.all(requests);
        const [currentResult, previousResult] = responses.map((res) => res.data);

        const hourlyLabels = Array(24)
          .fill(0)
          .map((_, index) =>
            moment(startDate, ISO_DATE_FORMAT).set('hour', index).set('minute', 0).set('second', 0).tz('UTC').valueOf(),
          );

        setNewTicketCount({
          current: {
            total: currentResult.hourlyTicketCount.reduce((sum, value) => sum + value, 0),
            statistics: currentResult.hourlyTicketCount.map((count, index) => {
              return {
                x: hourlyLabels[index],
                y: count,
              };
            }),
          },
          previous: {
            total: previousResult.hourlyTicketCount.reduce((sum, value) => sum + value, 0),
            statistics: previousResult.hourlyTicketCount.map((count, index) => {
              return {
                x: hourlyLabels[index],
                y: count,
              };
            }),
          },
        });
        setClosedTicketCount({
          current: {
            total: currentResult.hourlyClosedTicketCount.reduce((sum, value) => sum + value, 0),
            statistics: currentResult.hourlyClosedTicketCount.map((count, index) => {
              return {
                x: hourlyLabels[index],
                y: count,
              };
            }),
          },
          previous: {
            total: previousResult.hourlyClosedTicketCount.reduce((sum, value) => sum + value, 0),
            statistics: previousResult.hourlyClosedTicketCount.map((count, index) => {
              return {
                x: hourlyLabels[index],
                y: count,
              };
            }),
          },
        });
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsFetching(false);
      }
    }, [channelTypes, endDate, getErrorMessage, pid, region, startDate]);

    useEffect(() => {
      fetch();
    }, [fetch]);

    const dateRangeDays = useMemo(() => getDateRangeDays(startDate, endDate), [endDate, startDate]);

    const renderHourlyTicketsChart = useMemo(() => {
      if (error) return <ChartError error={error} onRetry={fetch} />;
      if (!newTicketCount?.current || !closedTicketCount?.current) return null;
      return (
        <>
          <ChartValues style={{ marginBottom: '33px' }}>
            <ChartValue
              label={intl.formatMessage({ id: 'desk.statistics.overview.hourlyTicket.lbl.new' })}
              format="0,0.00"
              value={newTicketCount?.current.total}
              previousValue={newTicketCount?.previous.total}
              tooltipMessage={intl.formatMessage(
                { id: 'desk.statistics.overview.chart.compareTooltip' },
                { days: dateRangeDays },
              )}
            />
            <ChartValue
              label={intl.formatMessage({ id: 'desk.statistics.overview.hourlyTicket.lbl.closed' })}
              format="0,0.00"
              value={closedTicketCount?.current.total}
              previousValue={closedTicketCount?.previous.total}
              tooltipMessage={intl.formatMessage(
                { id: 'desk.statistics.overview.chart.compareTooltip' },
                { days: dateRangeDays },
              )}
              color={cssVariables('blue-5')}
            />
          </ChartValues>
          <HourlyBarChart
            datasets={[
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.hourlyTicket.lbl.new' }),
                data: newTicketCount?.current.statistics,
              },
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.hourlyTicket.lbl.closed' }),
                data: closedTicketCount?.current.statistics,
              },
            ]}
            selectedDateRange={`${moment(startDate, ISO_DATE_FORMAT).format(DATE_WITHOUT_YEAR_FORMAT)} - ${moment(
              endDate,
              ISO_DATE_FORMAT,
            ).format(DATE_WITHOUT_YEAR_FORMAT)}`}
          />
        </>
      );
    }, [closedTicketCount, dateRangeDays, endDate, error, fetch, intl, newTicketCount, startDate]);

    return (
      <Card>
        <CardBodyColumn>
          <ChartTitle>
            {intl.formatMessage({ id: 'desk.statistics.overview.header.hourlyTicket' })}
            <ContextualInfoIconTooltip
              content={intl.formatMessage({ id: 'desk.statistics.overview.hourlyTicket.desc.tooltip' })}
              popperProps={{
                modifiers: {
                  preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined },
                },
              }}
            />
          </ChartTitle>
          {isFetching ? (
            <SpinnerContainer data-test-id="SpinnerContainer">
              <Spinner />
            </SpinnerContainer>
          ) : (
            renderHourlyTicketsChart
          )}
        </CardBodyColumn>
      </Card>
    );
  },
);

export const MessagesChart = memo<ChartProps>(
  ({ pid, region, params: { startDate, endDate, channelTypes }, tooltipBoundariesElementRef }) => {
    const intl = useIntl();
    const { getErrorMessage } = useDeskErrorHandler();

    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [agentMessageCounts, setAgentMessageCounts] = useState<StatsWithPrevious | undefined>(undefined);
    const [customerMessageCounts, setCustomerMessageCounts] = useState<StatsWithPrevious | undefined>(undefined);

    const fetch = useCallback(async () => {
      try {
        setIsFetching(true);

        const currentParams = {
          start_date: startDate,
          end_date: endDate,
          channel_type: channelTypes,
        };
        const previousParams = getPreviousParams({
          startDate,
          endDate,
          channelTypes,
        });

        const requests = [
          fetchStatsTicketMessageCounts(pid, region, currentParams),
          fetchStatsTicketMessageCounts(pid, region, previousParams),
        ];

        const responses = await Promise.all(requests);
        const [currentResult, previousResult] = responses.map((res) => res.data);

        setAgentMessageCounts({
          current: {
            total: currentResult.agentMessageCounts.reduce((sum, value) => sum + value, 0),
            statistics: currentResult.labels.map((label, index) => {
              return {
                x: label,
                y: currentResult.agentMessageCounts[index],
              };
            }),
          },
          previous: {
            total: previousResult.agentMessageCounts.reduce((sum, value) => sum + value, 0),
            statistics: previousResult.labels.map((label, index) => {
              return {
                x: label,
                y: previousResult.agentMessageCounts[index],
              };
            }),
          },
        });

        setCustomerMessageCounts({
          current: {
            total: currentResult.customerMessageCounts.reduce((sum, value) => sum + value, 0),
            statistics: currentResult.labels.map((label, index) => {
              return {
                x: label,
                y: currentResult.customerMessageCounts[index],
              };
            }),
          },
          previous: {
            total: previousResult.customerMessageCounts.reduce((sum, value) => sum + value, 0),
            statistics: previousResult.labels.map((label, index) => {
              return {
                x: label,
                y: previousResult.customerMessageCounts[index],
              };
            }),
          },
        });
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsFetching(false);
      }
    }, [channelTypes, endDate, getErrorMessage, pid, region, startDate]);

    useEffect(() => {
      fetch();
    }, [fetch]);

    const dateRangeDays = useMemo(() => getDateRangeDays(startDate, endDate), [endDate, startDate]);

    const renderMessageChart = useMemo(() => {
      if (error) return <ChartError error={error} onRetry={fetch} />;
      if (!agentMessageCounts || !customerMessageCounts) return null;
      return (
        <>
          <ChartValues style={{ marginBottom: '35px' }}>
            <ChartValue
              label={intl.formatMessage({ id: 'desk.statistics.overview.messageCount.lbl.agent' })}
              value={agentMessageCounts?.current.total ?? 0}
              previousValue={agentMessageCounts?.previous.total ?? 0}
              tooltipMessage={intl.formatMessage(
                { id: 'desk.statistics.overview.chart.compareTooltip' },
                { days: dateRangeDays },
              )}
              format="0,0"
              testId="MessagesFromAgentsValue"
            />
            <ChartValue
              label={intl.formatMessage({ id: 'desk.statistics.overview.messageCount.lbl.customer' })}
              value={customerMessageCounts?.current.total ?? 0}
              previousValue={customerMessageCounts?.previous.total ?? 0}
              tooltipMessage={intl.formatMessage(
                { id: 'desk.statistics.overview.chart.compareTooltip' },
                { days: dateRangeDays },
              )}
              format="0,0"
              color={cssVariables('blue-5')}
              testId="MessagesFromCustomersValue"
            />
            <ChartValueTotal
              value={(agentMessageCounts?.current.total ?? 0) + (customerMessageCounts?.current.total ?? 0)}
            />
          </ChartValues>
          <DailyLineChart
            key="desk_stats_chart_message_count"
            datasets={[
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.messageCount.lbl.agent' }),
                data: agentMessageCounts?.current.statistics,
              },
              {
                label: intl.formatMessage({ id: 'desk.statistics.overview.messageCount.lbl.customer' }),
                data: customerMessageCounts?.current.statistics,
              },
            ]}
          />{' '}
        </>
      );
    }, [agentMessageCounts, customerMessageCounts, dateRangeDays, error, fetch, intl]);

    return (
      <Card>
        <CardBodyColumn>
          <ChartTitle>
            {intl.formatMessage({ id: 'desk.statistics.overview.header.messageCount' })}
            <ContextualInfoIconTooltip
              content={intl.formatMessage({ id: 'desk.statistics.overview.messageCount.desc.tooltip' })}
              popperProps={{
                modifiers: {
                  preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined },
                },
              }}
            />
          </ChartTitle>
          {isFetching ? (
            <SpinnerContainer data-test-id="SpinnerContainer">
              <Spinner />
            </SpinnerContainer>
          ) : (
            renderMessageChart
          )}
        </CardBodyColumn>
      </Card>
    );
  },
);

export const HourlyMessagesChart = memo<ChartProps>(({ pid, region, params, tooltipBoundariesElementRef }) => {
  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyAverageMessageCounts, setHourlyAverageMessageCounts] = useState<StatWithAgentCustomer | undefined>(
    undefined,
  );
  const { startDate, endDate } = params;
  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetchHourlyAverageMessageCounts(pid, region, {
        start_date: params.startDate,
        end_date: params.endDate,
        channel_type: params.channelTypes,
      });
      const result = response.data;

      const hourlyLabels = Array(24)
        .fill(0)
        .map((_, index) =>
          moment(startDate, ISO_DATE_FORMAT).set('hour', index).set('minute', 0).set('second', 0).tz('UTC').valueOf(),
        );

      setHourlyAverageMessageCounts({
        agent: result.agentHourlyMessageCount.map((count, index) => {
          return {
            x: hourlyLabels[index],
            y: count,
          };
        }),
        customer: result.customerHourlyMessageCount.map((count, index) => {
          return {
            x: hourlyLabels[index],
            y: count,
          };
        }),
      });
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [getErrorMessage, params.channelTypes, params.endDate, params.startDate, pid, region, startDate]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const renderHourlyMessageChart = useMemo(() => {
    if (error) return <ChartError error={error} onRetry={fetch} />;
    if (!hourlyAverageMessageCounts) return null;
    return (
      <>
        <ChartValues style={{ marginBottom: '33px' }}>
          <ChartValue label={intl.formatMessage({ id: 'desk.statistics.overview.hourlyIncoming.lbl.agent' })} />
          <ChartValue
            label={intl.formatMessage({ id: 'desk.statistics.overview.hourlyIncoming.lbl.customer' })}
            color={cssVariables('blue-5')}
          />
        </ChartValues>
        <HourlyBarChart
          datasets={[
            {
              label: intl.formatMessage({ id: 'desk.statistics.overview.hourlyIncoming.lbl.agent' }),
              data: hourlyAverageMessageCounts?.agent,
            },
            {
              label: intl.formatMessage({ id: 'desk.statistics.overview.hourlyIncoming.lbl.customer' }),
              data: hourlyAverageMessageCounts?.customer,
            },
          ]}
          selectedDateRange={`${moment(startDate, ISO_DATE_FORMAT).format(DATE_WITHOUT_YEAR_FORMAT)} - ${moment(
            endDate,
            ISO_DATE_FORMAT,
          ).format(DATE_WITHOUT_YEAR_FORMAT)}`}
        />
      </>
    );
  }, [endDate, error, fetch, hourlyAverageMessageCounts, intl, startDate]);

  return (
    <Card>
      <CardBodyColumn>
        <ChartTitle>
          {intl.formatMessage({ id: 'desk.statistics.overview.header.hourlyIncoming' })}
          <ContextualInfoIconTooltip
            content={intl.formatMessage({ id: 'desk.statistics.overview.hourlyIncoming.desc.tooltip' })}
            popperProps={{
              modifiers: { preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined } },
            }}
          />
        </ChartTitle>
        {isFetching ? (
          <SpinnerContainer data-test-id="SpinnerContainer">
            <Spinner />
          </SpinnerContainer>
        ) : (
          renderHourlyMessageChart
        )}
      </CardBodyColumn>
    </Card>
  );
});

export const AvgFirstResponseTimeChart = memo<ChartProps>(({ pid, region, params, tooltipBoundariesElementRef }) => {
  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTimes, setResponseTimes] = useState<StatWithAverage | undefined>(undefined);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetchStatsTicketResponseTimes(pid, region, {
        start_date: params.startDate,
        end_date: params.endDate,
        channel_type: params.channelTypes,
      });
      const result = response.data;

      setResponseTimes({
        average: result.average,
        statistics: result.labels.map((label, index) => {
          return {
            x: label,
            y: result.responseTimes[index],
          };
        }),
      });
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [getErrorMessage, params.channelTypes, params.endDate, params.startDate, pid, region]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const renderAvgFirstResponseTimeChart = useMemo(() => {
    if (error) return <ChartError error={error} onRetry={fetch} />;
    if (!responseTimes) return null;
    return (
      <>
        <ChartValues style={{ marginBottom: '33px' }}>
          <ChartValue value={responseTimes?.average ?? 0} format={renderTimestring} testId="FirstResponseTimeValue" />
        </ChartValues>
        <DailyLineChart
          key="desk_stats_chart_tickets"
          datasets={[
            {
              label: intl.formatMessage({ id: 'desk.statistics.overview.responseTime.lbl.average' }),
              data: responseTimes?.statistics,
            },
          ]}
          tooltipValueFormatter={({ value }) => renderTimestring(value ?? 0)}
          chartOptions={{
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: (value) => renderTimestring(value ?? 0),
                  },
                },
              ],
            },
          }}
        />
      </>
    );
  }, [error, fetch, intl, responseTimes]);

  return (
    <Card>
      <CardBodyColumn>
        <ChartTitle>
          {intl.formatMessage({ id: 'desk.statistics.overview.header.firstResponseTime' })}
          <ContextualInfoIconTooltip
            content={intl.formatMessage({ id: 'desk.statistics.overview.firstResponseTime.desc.tooltip' })}
            popperProps={{
              modifiers: {
                preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined },
              },
            }}
          />
        </ChartTitle>
        {isFetching ? (
          <SpinnerContainer data-test-id="SpinnerContainer">
            <Spinner />
          </SpinnerContainer>
        ) : (
          renderAvgFirstResponseTimeChart
        )}
      </CardBodyColumn>
    </Card>
  );
});

export const AvgResolutionTimeChart = memo<ChartProps>(({ pid, region, params, tooltipBoundariesElementRef }) => {
  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationTimes, setDurationTimes] = useState<StatWithAverage | undefined>(undefined);
  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetchStatsTicketDurationTimes(pid, region, {
        start_date: params.startDate,
        end_date: params.endDate,
        channel_type: params.channelTypes,
      });
      const result = response.data;

      setDurationTimes({
        average: result.average,
        statistics: result.labels.map((label, index) => {
          return {
            x: label,
            y: result.durationTimes[index],
          };
        }),
      });
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [getErrorMessage, params.channelTypes, params.endDate, params.startDate, pid, region]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const renderAvgResolutionTime = useMemo(() => {
    if (error) return <ChartError error={error} onRetry={fetch} />;
    if (!durationTimes) return null;
    return (
      <>
        <ChartValues style={{ marginBottom: '33px' }}>
          <ChartValue value={durationTimes?.average ?? 0} format={renderTimestring} testId="ResolutionTimeValue" />
        </ChartValues>
        <DailyLineChart
          key="desk_stats_chart_tickets"
          datasets={[
            {
              label: intl.formatMessage({ id: 'desk.statistics.overview.ticketLifetime.lbl.average' }),
              data: durationTimes?.statistics,
            },
          ]}
          tooltipValueFormatter={({ value }) => renderTimestring(value ?? 0)}
          chartOptions={{
            scales: {
              yAxes: [
                {
                  ticks: {
                    callback: (value) => renderTimestring(value ?? 0),
                  },
                },
              ],
            },
          }}
        />
      </>
    );
  }, [durationTimes, error, fetch, intl]);

  return (
    <Card>
      <CardBodyColumn>
        <ChartTitle>
          {intl.formatMessage({ id: 'desk.statistics.overview.header.resolutionTime' })}
          <ContextualInfoIconTooltip
            content={intl.formatMessage({ id: 'desk.statistics.overview.resolutionTime.desc.tooltip' })}
            popperProps={{
              modifiers: { preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined } },
            }}
          />
        </ChartTitle>
        {isFetching ? (
          <SpinnerContainer data-test-id="SpinnerContainer">
            <Spinner />
          </SpinnerContainer>
        ) : (
          renderAvgResolutionTime
        )}
      </CardBodyColumn>
    </Card>
  );
});

export const CSATChart = memo<ChartProps>(({ pid, region, params, tooltipBoundariesElementRef }) => {
  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [csat, setCSAT] = useState<StatCSAT | undefined>(undefined);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetchCSAT(pid, region, {
        start_date: params.startDate,
        end_date: params.endDate,
        channel_type: params.channelTypes,
      });
      const result = response.data;

      const averageNumerator = result.customerSatisfactionScoreCounts
        .map((score, index) => score * (index + 1))
        .reduce((prev, curr) => prev + curr, 0);
      const averageDenominator = result.customerSatisfactionScoreCounts.reduce((prev, curr) => prev + curr, 0);

      const average = averageNumerator > 0 ? averageNumerator / averageDenominator : 0;

      setCSAT({
        responseRate: result.responseRate,
        labels: [
          intl.formatMessage({ id: 'desk.monitoring.csat.5stars' }),
          intl.formatMessage({ id: 'desk.monitoring.csat.4stars' }),
          intl.formatMessage({ id: 'desk.monitoring.csat.3stars' }),
          intl.formatMessage({ id: 'desk.monitoring.csat.2stars' }),
          intl.formatMessage({ id: 'desk.monitoring.csat.1star' }),
        ],
        values: [...result.customerSatisfactionScoreCounts].reverse(),
        average,
      });
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [getErrorMessage, intl, params.channelTypes, params.endDate, params.startDate, pid, region]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const renderCSATChart = useMemo(() => {
    if (error) return <ChartError error={error} onRetry={fetch} />;
    if (!csat) return null;
    return (
      <>
        <ChartValues style={{ marginBottom: '16px' }}>
          <ChartCSATValue value={csat?.average ?? 0} />
        </ChartValues>
        <DoughnutChart
          key="desk_stats_chart_csat"
          labels={csat?.labels ?? ['']}
          values={csat?.values ?? [0]}
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
                      values.reduce((prev, curr, index) => {
                        return hiddenLegends.includes(index) ? prev : prev + curr;
                      }, 0)) *
                      100,
                  )}%`;
                },
                color: cssColors('neutral-10'),
              },
            ],
          }}
          centerLabelTop={intl.formatMessage({ id: 'desk.statistics.overview.csat.lbl.total.top' })}
          centerLabelBottom={intl.formatMessage({ id: 'desk.statistics.overview.csat.lbl.total.bottom' })}
        />
      </>
    );
  }, [csat, error, fetch, intl]);

  return (
    <Card>
      <CardBodyColumn>
        <ChartTitle>
          {intl.formatMessage({ id: 'desk.statistics.overview.header.csat' })}
          <ContextualInfoIconTooltip
            content={intl.formatMessage({ id: 'desk.statistics.overview.csat.desc.tooltip' })}
            popperProps={{
              modifiers: { preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined } },
            }}
          />
        </ChartTitle>
        {isFetching ? (
          <SpinnerContainer data-test-id="SpinnerContainer">
            <Spinner />
          </SpinnerContainer>
        ) : (
          renderCSATChart
        )}
      </CardBodyColumn>
    </Card>
  );
});

const closedStatusLabel: Record<ClosedStatus, string> = {
  CLOSED_BY_CUSTOMER: 'desk.statistics.overview.closedStatuses.lbl.customer',
  CLOSED_BY_AGENT: 'desk.statistics.overview.closedStatuses.lbl.agent',
  CLOSED_BY_ADMIN: 'desk.statistics.overview.closedStatuses.lbl.admin',
  CLOSED_BY_SYSTEM: 'desk.statistics.overview.closedStatuses.lbl.system',
  CLOSED_BY_PLATFORM_API: 'desk.statistics.overview.closedStatuses.lbl.platform',
  CLOSED_BUT_NOT_DEFINED: 'desk.statistics.overview.closedStatuses.lbl.undefined',
};

export const ClosedStatusesChart = memo<ChartProps>(({ pid, region, params, tooltipBoundariesElementRef }) => {
  const intl = useIntl();
  const { getErrorMessage } = useDeskErrorHandler();
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [closedStatuses, setClosedStatuses] = useState<StatWithClosedStatuses | undefined>(undefined);

  const fetch = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetchClosedStatuses(pid, region, {
        start_date: params.startDate,
        end_date: params.endDate,
        channel_type: params.channelTypes,
      });
      const result = response.data;

      setClosedStatuses(
        result.closeStatusCounts.reduce(
          (acc, cur) => {
            acc.labels[getClosedStatusesIndex(cur.closeStatus)] = intl.formatMessage({
              id: closedStatusLabel[cur.closeStatus],
            });
            acc.values[getClosedStatusesIndex(cur.closeStatus)] = cur.counts;
            return acc;
          },
          { labels: new Array(doughnutChartSize), values: new Array(doughnutChartSize) },
        ),
      );
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsFetching(false);
    }
  }, [getErrorMessage, intl, params.channelTypes, params.endDate, params.startDate, pid, region]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const renderClosedStatusesChart = useMemo(() => {
    if (error) return <ChartError error={error} onRetry={fetch} />;
    if (!closedStatuses) return null;
    return (
      <DoughnutChart
        key="desk_stats_chart_closedStatuses"
        labels={closedStatuses?.labels ?? ['']}
        values={closedStatuses?.values ?? [0]}
        colors={{
          backgroundColors: doughnutChartBackground,
          hoverBorderColors: doughnutChartHover,
        }}
        tooltip={{
          items: [
            {
              label: intl.formatMessage({ id: 'desk.statistics.overview.closedStatuses.tooltip.responses' }),
            },
            {
              label: intl.formatMessage({ id: 'desk.statistics.overview.closedStatuses.tooltip.percentage' }),
              valueFormatter: (value: number, values: number[], hiddenLegends: number[]) => {
                return `${Math.floor(
                  (value /
                    values.reduce((prev, curr, index) => {
                      return hiddenLegends.includes(index) ? prev : prev + curr;
                    }, 0)) *
                    100,
                )}%`;
              },
              color: cssVariables('neutral-10'),
            },
          ],
        }}
        centerLabelTop={intl.formatMessage({ id: 'desk.statistics.overview.closedStatuses.center.lbl.top' })}
        centerLabelBottom={intl.formatMessage({ id: 'desk.statistics.overview.closedStatuses.center.lbl.bottom' })}
      />
    );
  }, [closedStatuses, error, fetch, intl]);

  return (
    <Card>
      <CardBodyColumn>
        <ChartTitle>
          {intl.formatMessage({ id: 'desk.statistics.overview.header.closedStatuses' })}
          <ContextualInfoIconTooltip
            content={intl.formatMessage({ id: 'desk.statistics.overview.header.closedStatuses.desc' })}
            popperProps={{
              modifiers: { preventOverflow: { boundariesElement: tooltipBoundariesElementRef?.current ?? undefined } },
            }}
          />
        </ChartTitle>
        {isFetching ? (
          <SpinnerContainer data-test-id="SpinnerContainer">
            <Spinner />
          </SpinnerContainer>
        ) : (
          renderClosedStatusesChart
        )}
      </CardBodyColumn>
    </Card>
  );
});
