import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { LIST_LIMIT } from '@constants';

export const fetchDataExports: FetchDataExportsAPI = ({ app_id, data_type, limit = LIST_LIMIT, token = '' }) => {
  return axios.get(`${getGateURL()}/platform/v3/export/${data_type}?token=${token}&limit=${limit}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': app_id,
    },
  });
};

export const fetchDataExport: FetchDataExportAPI = ({ app_id, data_type, request_id }) => {
  return axios.get(`${getGateURL()}/platform/v3/export/${data_type}/${request_id}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': app_id,
    },
  });
};

export const requestDataExport: RequestDataExportAPI = ({ app_id, data_type, payload }) => {
  return axios.post(`${getGateURL()}/platform/v3/export/${data_type}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': app_id,
    },
  });
};
