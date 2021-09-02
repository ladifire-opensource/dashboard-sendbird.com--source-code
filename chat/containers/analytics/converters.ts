import moment, { Moment, unitOfTime } from 'moment-timezone';
import qs from 'qs';

import { StatisticsMetricsLegacy, StatisticsMetrics } from '@constants';

type DateRange = { startDate: Moment; endDate: Moment } | null;

export const transitionDate = moment('2020-03-01');

export const getDateRange = (startDate: Moment, endDate: Moment, type: unitOfTime.DurationConstructor = 'days') => {
  const diff = endDate.diff(startDate, type);
  const range: string[] = [];
  for (let i = 0; i <= diff; i++) {
    range.push(
      startDate
        .clone()
        .add(i, type)
        .format(type === 'days' ? 'YYYY-MM-DD' : 'YYYY-MM'),
    );
  }
  return range;
};

export const getAnalyticsDateRange = (metricName, dateRange) => {
  let legacyDateRange: DateRange = null;
  if (dateRange.startDate.isBefore(transitionDate)) {
    legacyDateRange = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate.isBefore(transitionDate)
        ? dateRange.endDate
        : transitionDate.clone().subtract(1, 'days'),
    };
  }
  let activeDateRange: DateRange = null;
  if (dateRange.endDate.isSameOrAfter(transitionDate)) {
    if (dateRange.startDate.isSameOrAfter(transitionDate)) {
      activeDateRange = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };
      legacyDateRange = null;
    } else {
      activeDateRange = {
        startDate: transitionDate.clone(),
        endDate: dateRange.endDate,
      };
    }
  }

  // @legacy bypass members per channel (channel_member) to use only legacy
  if (metricName === StatisticsMetricsLegacy.channel_member) {
    legacyDateRange = dateRange;
    activeDateRange = null;
  }
  if (metricName === StatisticsMetrics.deleted_users) {
    legacyDateRange = null;
    activeDateRange = dateRange;
  }

  return {
    legacyDateRange,
    activeDateRange,
  };
};

export const getAnalyticsLegacyParams = ({ dateRange, timeDimension, exportAsCSV = false }) => {
  if (dateRange) {
    const date =
      timeDimension === 'daily'
        ? {
            start_date: dateRange.startDate.format('YYYY-MM-DD'),
            end_date: dateRange.endDate.format('YYYY-MM-DD'),
          }
        : {
            start_month: dateRange.startDate.format('YYYY-MM'),
            end_month: dateRange.endDate.format('YYYY-MM'),
          };
    return qs.stringify({
      ...date,
      export: exportAsCSV,
    });
  }
  return '';
};

export const getAnalyticsActiveParams = ({ metricType, dateRange, timeDimension, segments, exportAsCSV = false }) => {
  if (dateRange) {
    const queries = {
      start_year: dateRange.startDate.format('YYYY'),
      end_year: dateRange.endDate.format('YYYY'),
      start_month: dateRange.startDate.format('MM'),
      end_month: dateRange.endDate.format('MM'),
      time_dimension: timeDimension,
      metric_type: metricType,
      segments,
      export_as_csv: exportAsCSV,
    };
    if (timeDimension === 'daily') {
      queries['start_day'] = dateRange.startDate.format('DD');
      queries['end_day'] = dateRange.endDate.format('DD');
    }
    return qs.stringify(queries);
  }
  return '';
};
