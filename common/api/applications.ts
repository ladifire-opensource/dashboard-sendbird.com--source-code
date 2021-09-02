import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const fetchApplications: FetchApplicationsAPI = ({ limit, offset, app_name, app_name_or_app_id, order }) =>
  axios.get(`${getGateURL()}/dashboard/applications/`, {
    headers: { authorization: getSBAuthToken() },
    params: { limit, offset, app_name, app_name_or_app_id, order },
  });
