import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchMonitorMetric: FetchMonitorMetricAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/api/projects/metric/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
