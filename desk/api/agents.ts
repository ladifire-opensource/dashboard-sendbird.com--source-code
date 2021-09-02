import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, ClientStorage } from '@utils';

export const fetchAgents: FetchAgentsAPI = (
  pid,
  region,
  { offset = 0, limit = 50, group, order, connection, query, tier, status, agentType, role, id },
) => {
  const url = `${getDeskURL(region)}/api/projects/agents/`;
  return axios.get(url, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: snakeCaseKeys({
      offset,
      limit,
      group,
      order,
      connection,
      tier,
      status,
      query,
      agentType,
      role,
      id,
    }),
  });
};

export const fetchAgent: FetchAgentAPI = (pid, region, { agentId, status }) => {
  return axios.get(`${getDeskURL(region)}/api/agents/${agentId}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: {
      status,
    },
  });
};

export const searchAgents: SearchAgentsAPI = (pid, region, { query, limit, offset, group, order }) => {
  return axios.get(`${getDeskURL(region)}/api/agents/search/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: {
      query,
      limit,
      offset,
      group,
      order,
    },
  });
};

export const fetchAgentBySendbirdSDKUserId: FetchAgentBySendbirdSDKUserIdAPI = (pid, region, { sendbirdSDKUserId }) => {
  return axios.get(`${getDeskURL(region)}/api/agents/${sendbirdSDKUserId}/profile`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const updateAgentProfile: UpdateAgentProfileAPI = (pid, region, { agentId, payload }) => {
  const url = `${getDeskURL(region)}/api/agents/${agentId}/`;
  return axios.patch(url, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const updateAgentRole: UpdateAgentRoleAPI = (pid, region, { agentId, role }) => {
  const url = `${getDeskURL(region)}/api/agents/${agentId}/role/`;
  return axios.patch(
    url,
    {
      role,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateAgentStatus: UpdateAgentStatusAPI = (pid, region, { agentId, status, transferGroupId }) => {
  const url = `${getDeskURL(region)}/api/agents/${agentId}/status/`;
  return axios.patch(
    url,
    { status, transferGroupId },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateAgentConnection: UpdateAgentConnectionAPI = (
  pid,
  region,
  { agentId, connection, transferGroupId },
) =>
  axios.patch(
    `${getDeskURL(region)}/api/agents/${agentId}/connection/`,
    {
      connection,
      transferGroupId,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const fetchAgentTicketsAPI: FetchAgentTicketsAPI = (pid, region, { agentId, params }) => {
  const url = `${getDeskURL(region)}/api/agents/${agentId}/tickets`;
  return axios.get(url, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};
