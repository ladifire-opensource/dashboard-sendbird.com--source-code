import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const fetchStatisticsLegacy: FetchStatisticsLegacyAPI = ({ appId, metricType, timeDimension = '', params }) => {
  return axios.get(
    `${getGateURL()}/platform/v3/statistics/${metricType}${timeDimension ? `/${timeDimension}` : ''}?${params}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchStatistics: FetchStatisticsAPI = ({ appId, params }) => {
  return axios.get(`${getGateURL()}/platform/v3/statistics/metric?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
