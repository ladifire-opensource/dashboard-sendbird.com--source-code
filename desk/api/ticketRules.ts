import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchTicketRules: FetchTicketRulesAPI = (pid, region, { type, offset, limit }) => {
  return axios.get(`${getDeskURL(region)}/api/rules/`, {
    params: {
      type,
      offset,
      limit,
    },
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchTicketRule: FetchTicketRuleAPI = (pid, region, { id }) => {
  return axios.get(`${getDeskURL(region)}/api/rules/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const createTicketRule: CreateTicketRuleAPI = (pid, region, { type, name, conditional }) => {
  return axios.post(
    `${getDeskURL(region)}/api/rules/`,
    { type, name, conditional },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateTicketRule: UpdateTicketRuleAPI = (pid, region, { id, name, status, conditional }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/rules/${id}`,
    { name, status, conditional },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateTicketRuleOrder: UpdateTicketRuleOrderAPI = (pid, region, { type, orders }) => {
  return axios.post(
    `${getDeskURL(region)}/api/rules/reorder`,
    { type, orders },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const deleteTicketRule: DeleteTicketRuleAPI = (pid, region, { id }) => {
  return axios.delete(`${getDeskURL(region)}/api/rules/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
