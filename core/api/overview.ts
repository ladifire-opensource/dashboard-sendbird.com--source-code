import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { axios, getGateURL, getDashboardAPIUrl } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const fetchMAU = ({ appId, payload: { startDate, endDate } }) => {
  return axios.get(`${getGateURL()}/platform/dapi/metrics/mau/?date_start=${startDate}&date_end=${endDate}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchMonthlyCCU = ({ appId, payload: { start_year, end_year, start_month, end_month } }) => {
  return axios.get(
    `${getGateURL()}/platform/v3/applications/peak_connections?time_dimension=monthly&start_year=${start_year}&end_year=${end_year}&start_month=${start_month}&end_month=${end_month}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchDAU = ({ appId, payload: { startDate, endDate } }) => {
  return axios.get(`${getGateURL()}/platform/dapi/metrics/dau/?date_start=${startDate}&date_end=${endDate}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchMessagesCount = ({ appId, payload: { startDate, endDate } }) => {
  return axios.get(
    `${getGateURL()}/platform/dapi/metrics/messages/daily_count?start_date=${startDate}&end_date=${endDate}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchDailyCCU = ({
  appId,
  payload: { start_year, end_year, start_month, end_month, start_day, end_day },
}) => {
  return axios.get(
    `${getGateURL()}/platform/v3/applications/peak_connections?time_dimension=daily&start_year=${start_year}&end_year=${end_year}&start_month=${start_month}&end_month=${end_month}&start_day=${start_day}&end_day=${end_day}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchHourlyCCU = ({ appId, date }) => {
  return axios.get(`${getGateURL()}/platform/dapi/metrics/ccu_hourly/?date=${date}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchMessagingUsage = (app_id) => {
  return axios.get(`${getGateURL()}/platform/dapi/metrics/usage/`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': app_id,
    },
  });
};

export const fetchCallsUsage: FetchCallsUsageAPI = (app_id) => {
  return axios.get(`${getGateURL()}/dashboard_api/v2oip/stat`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': app_id,
    },
  });
};

export const getAPIToken = ({ appId, password }) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/applications/${appId}/get_api_token/`,
    { password },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const checkDNSResolveStatus = ({ appId }) => {
  return axios.get(`${getDashboardAPIUrl()}/api/dns_resolver/${appId}`);
};

export const registerCallsApplication = ({ app_id }: { app_id: string }) =>
  axios.post(
    `${getGateURL()}/dashboard_api/v2oip/applications/${app_id}/register`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': app_id,
      },
    },
  );

export const setCoachmarkComplete = (): CancellableAxiosPromise<AuthUser> => {
  return axios.put(
    `${getGateURL()}/dashboard_api/profiles/set_coachmark_complete/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};
