import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const submitSupportForm = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/sf_cases/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};
