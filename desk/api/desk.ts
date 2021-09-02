import { axios, getDeskURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { ClientStorage } from '@utils';

export const deskAuthentication: DeskAuthentication = (pid, region, { appId }) => {
  return axios.post(`${getDeskURL(region)}/api/auth/standalone/`, {
    dashboardToken: getSBAuthToken(),
    appId,
  });
};

/**
 * Update Desk Project Settings
 * @param {pid, payload}
 */
export const updateProjectSetting: UpdateProjectSettingAPI = (pid, region, { payload }) => {
  return axios.patch(`${getDeskURL(region)}/api/projects/${pid}/`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const getProjectSetting: GetProjectSettingAPI = (pid, region) => {
  return axios.get(`${getDeskURL(region)}/api/projects/${pid}/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchProjectApiKeys: FetchProjectApiKeysAPI = (pid, region, { offset = 0, limit = 50 }) => {
  const params = `limit=${limit}&offset=${offset}`;
  return axios.get(`${getDeskURL(region)}/api/projects/project_api_keys/?${params}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const createProjectApiKey: CreateProjectApiKeyAPI = (pid, region, { payload }) => {
  return axios.post(`${getDeskURL(region)}/api/project_api_keys`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const deleteProjectApiKey: DeleteProjectApiKeyAPI = (pid, region, { id }) => {
  const data: { status: ApiTokenStatus } = { status: 'INACTIVE' };
  return axios.patch(`${getDeskURL(region)}/api/project_api_keys/${id}/`, data, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const searchMacros: SearchMacrosAPI = (pid, region, { query = '' }) => {
  return axios.get(`${getDeskURL(region)}/api/macros/search/?query=${query}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchMacros: FetchMacrosAPI = (pid, region, { offset = 0, limit = 50 }) => {
  const params = `limit=${limit}&offset=${offset}`;
  return axios.get(`${getDeskURL(region)}/api/projects/macros/?${params}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const addMacro: AddMacroAPI = (pid, region, { payload }) => {
  return axios.post(`${getDeskURL(region)}/api/macros/`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const editMacro: EditMacroAPI = (pid, region, { mid, payload }) => {
  return axios.patch(`${getDeskURL(region)}/api/macros/${mid}/`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const deleteMacro: DeleteMacroAPI = (pid, region, { mid }) => {
  return axios.delete(`${getDeskURL(region)}/api/macros/${mid}/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
