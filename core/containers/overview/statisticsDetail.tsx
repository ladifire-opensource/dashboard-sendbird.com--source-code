import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { ChartOptions } from 'chart.js';
import {
  cssColors,
  cssVariables,
  DateRangePicker,
  TooltipTargetIcon,
  DateRangePickerValue,
  DateRange,
  SingleDatePicker,
} from 'feather';
import moment, { Moment } from 'moment-timezone';
import numbro from 'numbro';

import { coreActions } from '@actions';
import {
  ISO_DATE_FORMAT,
  MONTHLY_DATE_FORMAT,
  DEFAULT_DATE_FORMAT,
  DATE_WITHOUT_YEAR_FORMAT,
  DEFAULT_TIME_FORMAT,
} from '@constants';
import { MonthRangePicker } from '@ui/components';
import { LineChart } from '@ui/components/chart';

import { CCUErrorAlert } from './CCUErrorAlert';
import { StatisticsMetrics, OverviewTooltip } from './components';

const StatisticsHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-gap: 0 32px;
  align-items: center;
  margin-bottom: 10px;
`;

const StatisticsTitle = styled.h3`
  font-size: 16px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
  margin: 0;
  display: flex;
  align-items: center;
`;

const StatisticsItem = styled.div`
  padding-bottom: 24px;
  & + & {
    margin-top: 24px;
    border-top: 1px solid ${cssVariables('neutral-3')};
    padding: 24px 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
`;

const lineChartOptions: {
  [key: string]: ChartOptions;
} = {
  month: {
    scales: {
      xAxes: [
        {
          time: {
            unit: 'month',
            tooltipFormat: 'MMM, YYYY',
          },
        },
      ],
    },
  },
  day: {
    scales: {
      xAxes: [
        {
          time: {
            unit: 'day',
            tooltipFormat: DEFAULT_DATE_FORMAT,
          },
        },
      ],
    },
  },
  hour: {
    scales: {
      xAxes: [
        {
          time: {
            unit: 'hour',
            tooltipFormat: `${DATE_WITHOUT_YEAR_FORMAT}, ${DEFAULT_TIME_FORMAT}`,
          },
        },
      ],
    },
  },
};

type StatisticsMonthlyProps = {
  statistics: { mau: StatisticsData; monthlyConnection: StatisticsData };
  fetchMAURequest: typeof coreActions.fetchMAURequest;
  fetchMonthlyCCURequest: typeof coreActions.fetchMonthlyCCURequest;
};

const formatNumber = (value: any) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

// the time period of request cannot span more than PERIOD_LIMIT.
export const getCCUPayload = (startDate, endDate, DATE_TYPE, PERIOD_LIMIT) => {
  const payloads: {
    end_month: number;
    end_year: number;
    start_month: number;
    start_year: number;
    start_day?: number;
    end_day?: number;
  }[] = [];
  let diff = endDate.diff(startDate, DATE_TYPE);
  let count = 0;

  while (diff > 0) {
    const startIndex = PERIOD_LIMIT * count;
    const nextStartDate = startDate.clone().add(startIndex, DATE_TYPE);
    if (diff >= PERIOD_LIMIT) {
      const endIndex = startIndex + (PERIOD_LIMIT - 1);
      const nextEndDate = startDate.clone().add(endIndex, DATE_TYPE);

      payloads.push({
        start_year: nextStartDate.year(),
        end_year: nextEndDate.year(),
        start_month: nextStartDate.month() + 1,
        end_month: nextEndDate.month() + 1,
        ...(DATE_TYPE === 'days' ? { start_day: nextStartDate.date(), end_day: nextEndDate.date() } : null),
      });
      count++;
    } else {
      payloads.push({
        start_year: nextStartDate.year(),
        end_year: endDate.year(),
        start_month: nextStartDate.month() + 1,
        end_month: endDate.month() + 1,
        ...(DATE_TYPE === 'days' ? { start_day: nextStartDate.date(), end_day: endDate.date() } : null),
      });
    }
    diff -= PERIOD_LIMIT - 1;
  }
  return payloads;
};

export const StatisticsMonthly: React.FC<StatisticsMonthlyProps> = ({
  statistics,
  fetchMAURequest,
  fetchMonthlyCCURequest,
}) => {
  const intl = useIntl();

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(6, 'month').startOf('day'),
    endDate: moment().endOf('day'),
  });

  const { startDate, endDate } = dateRange;

  const fetchStatistics = useCallback(() => {
    fetchMAURequest({
      startDate: startDate.format(MONTHLY_DATE_FORMAT),
      endDate: endDate.format(MONTHLY_DATE_FORMAT),
    });
    fetchMonthlyCCURequest(getCCUPayload(startDate, endDate, 'months', 12));
  }, [fetchMAURequest, startDate, endDate, fetchMonthlyCCURequest]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleDateRangeChange = ({ start, end }) => {
    setDateRange({ startDate: start, endDate: end });
  };

  const datasets = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'core.overview.statistics_header.monthlyActiveUsers' }),
        data: statistics.mau.series,
      },
      {
        label: intl.formatMessage({ id: 'core.overview.statistics_header.peakConnections' }),
        data: statistics.monthlyConnection.series,
      },
    ],
    [intl, statistics.mau.series, statistics.monthlyConnection],
  );

  const renderLegend = useCallback(
    (onLegendClick, checkIsHidden) => {
      return (
        <StatisticsMetrics
          metrics={[
            {
              title: intl.formatMessage({ id: 'core.overview.statistics_header.monthlyActiveUsers' }),
              value: formatNumber(statistics.mau ? statistics.mau.max : 0),
            },
            {
              title: intl.formatMessage({ id: 'core.overview.statistics_header.peakConnections' }),
              value: formatNumber(statistics.monthlyConnection ? statistics.monthlyConnection.max : 0),
              color: cssVariables('green-5'),
            },
          ]}
          onLegendClick={onLegendClick}
          checkIsHidden={checkIsHidden}
        />
      );
    },
    [intl, statistics.mau, statistics.monthlyConnection],
  );

  return (
    <StatisticsItem>
      <StatisticsHeader>
        <StatisticsTitle>
          {intl.formatMessage({ id: 'core.overview.statistics_label.monthly' })}
          <OverviewTooltip
            tooltipContent={intl.formatMessage({ id: 'core.overview.statistics_tooltip.monthly' })}
            popperProps={{ modifiers: { offset: { offset: '-2, 4' } } }}
          >
            <TooltipTargetIcon icon="info" size={16} />
          </OverviewTooltip>
        </StatisticsTitle>
        <MonthRangePicker start={startDate} end={endDate} onApply={handleDateRangeChange} />
      </StatisticsHeader>
      <LineChart
        key="messaging_statistics_mau"
        height="280px"
        datasets={datasets}
        options={lineChartOptions['month']}
        renderLegend={renderLegend}
        showHighest={true}
        noPadding={true}
        colors={[cssColors('purple-7'), cssColors('green-5')]}
      />
    </StatisticsItem>
  );
};

type DailyProps = {
  statistics: {
    dau: StatisticsData;
    messages: StatisticsData;
    connections: StatisticsData;
  };
  fetchDAURequest: typeof coreActions.fetchDAURequest;
  fetchMessagesCountRequest: typeof coreActions.fetchMessagesCountRequest;
  fetchDailyCCURequest: typeof coreActions.fetchDailyCCURequest;
};

export const StatisticsDaily: React.FC<DailyProps> = ({
  statistics,
  fetchDAURequest,
  fetchMessagesCountRequest,
  fetchDailyCCURequest,
}) => {
  const intl = useIntl();
  const [date, setDate] = useState<DateRangePickerValue>(DateRangePickerValue.Last14Days);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: moment().subtract(2, 'weeks'),
    endDate: moment(),
  });

  const { startDate, endDate } = dateRange;

  const fetchStatistics = useCallback(() => {
    fetchDAURequest({
      startDate: startDate.format(ISO_DATE_FORMAT),
      endDate: endDate.format(ISO_DATE_FORMAT),
    });
    fetchMessagesCountRequest({
      startDate: startDate.format(ISO_DATE_FORMAT),
      endDate: endDate.format(ISO_DATE_FORMAT),
    });
    fetchDailyCCURequest(getCCUPayload(startDate, endDate, 'days', 62));
  }, [fetchDAURequest, startDate, endDate, fetchMessagesCountRequest, fetchDailyCCURequest]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const handleDateRangeChange = useCallback((value, dateRange) => {
    setDate(value);
    setDateRange(dateRange);
  }, []);

  const datasets = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'core.overview.statistics_header.dailyActiveUsers' }),
        data: statistics.dau.series,
      },
      {
        label: intl.formatMessage({ id: 'core.overview.statistics_header.dailyMessages' }),
        data: statistics.messages.series,
      },
      {
        label: intl.formatMessage({ id: 'core.overview.statistics_header.peakConnections' }),
        data: statistics.connections.series,
      },
    ],
    [intl, statistics.connections.series, statistics.dau.series, statistics.messages.series],
  );

  const renderLegend = useCallback(
    (onLegendClick, checkIsHidden) => (
      <StatisticsMetrics
        metrics={[
          {
            title: intl.formatMessage({ id: 'core.overview.statistics_header.dailyActiveUsers' }),
            value: formatNumber(statistics.dau ? statistics.dau.max : 0),
          },

          {
            title: intl.formatMessage({ id: 'core.overview.statistics_header.dailyMessages' }),
            value: formatNumber(statistics.messages ? statistics.messages.max : 0),
            color: cssVariables('blue-5'),
          },
          {
            title: intl.formatMessage({ id: 'core.overview.statistics_header.peakConnections' }),
            value: formatNumber(statistics.connections ? statistics.connections.max : 0),
            color: cssVariables('green-5'),
          },
        ]}
        onLegendClick={onLegendClick}
        checkIsHidden={checkIsHidden}
      />
    ),
    [intl, statistics.connections, statistics.dau, statistics.messages],
  );

  return (
    <StatisticsItem>
      <StatisticsHeader>
        <StatisticsTitle>
          {intl.formatMessage({ id: 'core.overview.statistics_label.daily' })}
          <OverviewTooltip
            tooltipContent={intl.formatMessage({ id: 'core.overview.statistics_tooltip.daily' })}
            popperProps={{ modifiers: { offset: { offset: '-2, 4' } } }}
          >
            <TooltipTargetIcon icon="info" size={16} />
          </OverviewTooltip>
        </StatisticsTitle>
        <DateRangePicker
          value={date}
          dateRange={dateRange}
          onChange={handleDateRangeChange}
          minimumNights={7}
          maximumNights={92}
          placement="bottom-end"
          size="small"
        />
      </StatisticsHeader>
      <CCUErrorAlert />
      <LineChart
        key="messaging_statistics_daily"
        height="280px"
        datasets={datasets}
        options={lineChartOptions['day']}
        showHighest={true}
        renderLegend={renderLegend}
        noPadding={true}
      />
    </StatisticsItem>
  );
};

type HourlyProps = {
  statistics: StatisticsData;
  fetchHourlyCCURequest: typeof coreActions.fetchHourlyCCURequest;
};

export const StatisticsHourlyConnections: React.FC<HourlyProps> = ({ statistics, fetchHourlyCCURequest }) => {
  const intl = useIntl();

  const [date, setDate] = useState<Moment>(moment());

  const fetchStatistics = useCallback(() => {
    fetchHourlyCCURequest(date.format(ISO_DATE_FORMAT));
  }, [date, fetchHourlyCCURequest]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const datasets = useMemo(
    () => [
      {
        label: intl.formatMessage({ id: 'core.overview.statistics_header.hourlyPeakConnections' }),
        data: statistics.series,
      },
    ],
    [intl, statistics.series],
  );

  const renderLegend = useCallback(
    (onLegendClick, checkIsHidden) => (
      <StatisticsMetrics
        metrics={[
          {
            title: intl.formatMessage({ id: 'core.overview.statistics_header.hourlyPeakConnections' }),
            value: formatNumber(statistics?.max ?? 0),
          },
        ]}
        onLegendClick={onLegendClick}
        checkIsHidden={checkIsHidden}
      />
    ),
    [intl, statistics],
  );

  return (
    <StatisticsItem>
      <StatisticsHeader>
        <StatisticsTitle>
          {intl.formatMessage({ id: 'core.overview.statistics_label.hourly' })}
          <OverviewTooltip
            tooltipContent={intl.formatMessage({ id: 'core.overview.statistics_tooltip.hourly' })}
            popperProps={{ modifiers: { offset: { offset: '-2, 4' } } }}
          >
            <TooltipTargetIcon icon="info" size={16} />
          </OverviewTooltip>
        </StatisticsTitle>
        <SingleDatePicker
          date={date}
          size="small"
          onChange={(date) => date && setDate(date)}
          popperProps={{
            placement: 'bottom-end',
            positionFixed: true,
            modifiers: { preventOverflow: { boundariesElement: 'viewport' } },
          }}
        />
      </StatisticsHeader>
      <LineChart
        key="messaging_statistics_hourly"
        height="280px"
        datasets={datasets}
        options={lineChartOptions['hour']}
        renderLegend={renderLegend}
        showHighest={true}
        noPadding={true}
        useArea={true}
      />
    </StatisticsItem>
  );
};
