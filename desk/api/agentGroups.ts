import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys } from '@utils';
import { ClientStorage } from '@utils';

export const fetchAgentGroups: FetchAgentGroupsAPI = (pid, region, { offset, limit, query, isBotOnly }) => {
  return axios.get(`${getDeskURL(region)}/api/projects/groups/`, {
    params: snakeCaseKeys({
      offset,
      limit,
      query,
      isBotOnly,
    }),
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchAgentGroup: FetchAgentGroupAPI = (pid, region, { groupId }) => {
  return axios.get(`${getDeskURL(region)}/api/groups/${groupId}/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const createAgentGroup: CreateAgentGroupAPI = (pid, region, { name, key, description, agents }) => {
  return axios.post(
    `${getDeskURL(region)}/api/groups/`,
    {
      name,
      key,
      description,
      agents,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateAgentGroup: UpdateAgentGroupAPI = (pid, region, { groupId, name, agents, description }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/groups/${groupId}/`,
    {
      name,
      agents,
      description,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const deleteAgentGroup: DeleteAgentGroupAPI = (pid, region, { groupId, transferTargetGroupId }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/groups/${groupId}/inactive/`,
    {
      transferTargetGroupId,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const checkAgentGroupKeyDuplicate: CheckAgentGroupKeyDuplicateAPI = (pid, region, params) => {
  return axios.get(`${getDeskURL(region)}/api/groups/key_duplicate_check`, {
    params,
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const checkAgentGroupNameDuplicate: CheckAgentGroupNameDuplicateAPI = (pid, region, params) => {
  return axios.get(`${getDeskURL(region)}/api/groups/name_duplicate_check`, {
    params,
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const searchAgentGroups: SearchAgentGroupsAPI = (pid, region, { name }) => {
  return axios.get(`${getDeskURL(region)}/api/groups/search/`, {
    params: {
      name,
    },
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
