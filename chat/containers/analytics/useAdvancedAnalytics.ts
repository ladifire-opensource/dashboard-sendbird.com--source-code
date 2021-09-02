import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import isEqual from 'lodash/isEqual';
import { Moment } from 'moment-timezone';

import { fetchStatisticsLegacy, fetchStatistics } from '@chat/api';
import { StatisticsMetrics } from '@constants';
import { useAsync, usePrevious } from '@hooks';

import { getAnalyticsActiveParams, getAnalyticsLegacyParams, getAnalyticsDateRange, getDateRange } from './converters';
import { transformMetricTypeToLegacy, getAnalyticsData } from './transformers';

const useFetchStatisticsAPI = (params: string) => {
  const appId = useSelector((state: RootState) => state.applicationState.data?.app_id);

  const [{ data, status }, load] = useAsync(async () => {
    if (params !== '') {
      let response = await fetchStatistics({ appId, params });
      const result = response.data;
      while (response.data.next) {
        response = await fetchStatistics({ appId, params: `${params}&token=${response.data.next}` });
        result.values = result.values.concat(response.data.values);
      }
      return result;
    }
    return Promise.resolve({ values: [] });
  }, [appId, params]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, data, reload: load };
};

const useFetchStatisticsLegacyAPI = (metricType, params, timeDimension = 'daily') => {
  const appId = useSelector((state: RootState) => state.applicationState.data?.app_id);

  const [{ data: state, status }, load] = useAsync(async () => {
    if (params !== '') {
      return await fetchStatisticsLegacy({
        appId,
        metricType,
        timeDimension: metricType === 'active_users' || metricType === 'active_channels' ? timeDimension : '',
        params,
      });
    }
    return Promise.resolve({ data: { statistics: [] } });
  }, [appId, metricType, params, timeDimension]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, state, reload: load };
};

interface UseAdvancedAnalytics {
  (payload: {
    metricType: StatisticsMetrics | any;
    timeDimension: 'daily' | 'weekly' | 'monthly';
    dateRange: {
      startDate: Moment;
      endDate: Moment;
    };
    segments?: string;
  }): {
    isLoading: boolean;
    data: AdvancedAnalyticsData;
    fetchedAt: number | null;
  };
}

export const useAdvancedAnalytics: UseAdvancedAnalytics = ({
  metricType,
  timeDimension = 'daily',
  dateRange,
  segments = '',
}) => {
  const dataRef = useRef<AdvancedAnalyticsData>({
    statistics: [],
    total: 0,
    average: 0,
    channelCustomTypeData: {},
    messageCustomTypeData: {},
  });
  const { legacyDateRange, activeDateRange } = getAnalyticsDateRange(metricType, dateRange);

  const legacyParams = getAnalyticsLegacyParams({ dateRange: legacyDateRange, timeDimension });
  const { status: statusLegacy, state: stateLegacy } = useFetchStatisticsLegacyAPI(
    transformMetricTypeToLegacy(metricType, segments),
    legacyParams,
    timeDimension,
  );

  const params = getAnalyticsActiveParams({ metricType, dateRange: activeDateRange, timeDimension, segments });
  const { status, data } = useFetchStatisticsAPI(params);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'success') {
      setFetchedAt(Date.now());
    }
  }, [status]);

  const legacyStats = legacyDateRange ? stateLegacy?.data.statistics : [];
  const activeStats = activeDateRange ? data?.values ?? [] : [];
  const stats = {
    legacy: legacyStats,
    active: activeStats,
  };
  const previousStats = usePrevious(stats);

  if (!isEqual(previousStats, stats) && status !== 'loading' && statusLegacy !== 'loading') {
    const dateRangeString = getDateRange(
      dateRange.startDate,
      dateRange.endDate,
      timeDimension === 'daily' ? 'days' : 'months',
    );
    dataRef.current = getAnalyticsData(stats, dateRangeString, segments);
  }

  return useMemo(
    () => ({
      isLoading: status === 'loading' || statusLegacy === 'loading',
      data: dataRef.current,
      fetchedAt,
    }),
    [fetchedAt, status, statusLegacy],
  );
};

const ap2Apps = [
  '4ED4A015-33AF-4232-B688-D85C3467A71E',
  'D37B2724-256E-4364-A133-B51340CADE12',
  '12D52DA8-441A-4936-8014-FB7FF0235189',
  '00D61803-A570-4D77-B842-1F1631F18EA0',
  '6BD594DD-4ABF-44D4-89DA-87B0328A9B60',
  'D1861F9D-FE4A-4E95-8D36-1B66A8BCF119',
  'E9CCC065-88F3-4304-9172-C8FA8F2588B1',
  '2F72AECC-E721-4447-BDC2-39086FC0E976',
  '88CA8C74-5A5F-4A67-ABCA-C23D24C33C37',
  'DCECA434-A3C6-4164-8A99-D4F6C8A199EA',
  '4E1B1B91-F548-4DBF-9245-B23E9824158F',
  '0D1078A2-03F8-4091-B733-0D6D8F0E946F',
  'F3185317-00CB-4B92-8394-D2E3A7F0A53C',
];

export const useAdvancedAnalyticsAvailableApps = (appId) => ap2Apps.includes(appId);
