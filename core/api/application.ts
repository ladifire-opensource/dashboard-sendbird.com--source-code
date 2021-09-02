import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const createApplication: CreateApplicationAPI = (payload: {}) => {
  return axios.post(`${getGateURL()}/dashboard/applications/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchAPITokens = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/api_tokens`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const createAPITokens = ({ appId, apiToken }) => {
  return axios.post(
    `${getGateURL()}/platform/v3/applications/api_tokens`,
    {
      HTTP_API_TOKEN: apiToken,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const revokeAPITokens = ({ appId, apiToken }) => {
  return axios.delete(`${getGateURL()}/platform/v3/applications/api_tokens/${apiToken}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
export const getApplicationSummary = ({ app_id }: { app_id: string }) =>
  axios.get<{
    id: number;
    app_id: string;
    region: string;
    is_moderator_info_in_admin_message: boolean;
    is_calls_enabled?: boolean; // FIXME: optional flag will be unnecessary after API update
  }>(`${getGateURL()}/dashboard/application/${app_id}/`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': app_id },
  });

export const getApplication: GetApplicationAPI = ({ app_id }) =>
  axios.get(`${getGateURL()}/dashboard/applications/${app_id}/get_detail/`, {
    headers: { authorization: getSBAuthToken() },
  });

export const fetchEnabledFeatures: FetchEnabledFeaturesAPI = (app_id) => {
  return axios.get(`${getGateURL()}/dashboard_api/applications/${app_id}/enabled_features/`, {
    headers: { authorization: getSBAuthToken() },
  });
};

export const updateEnabledFeatures: UpdateEnabledFeaturesAPI = ({ app_id, payload }) => {
  return axios.put(`${getGateURL()}/dashboard_api/applications/${app_id}/enabled_features/`, payload, {
    headers: { authorization: getSBAuthToken() },
  });
};

/**
 * This API is used to display the status of the pipeline execution on Application Settings > Features.
 */
export const getMessageSearchPipeline: GetMessageSearchPipelineAPI = (app_id) => {
  return axios.get(`${getGateURL()}/message_search_api/migration_pipeline/`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': app_id },
  });
};
