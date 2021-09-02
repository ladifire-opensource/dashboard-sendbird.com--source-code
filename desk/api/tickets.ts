import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, ClientStorage } from '@utils';

export const fetchTickets: FetchTicketsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/projects/tickets/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchTicket: FetchTicketAPI = (pid, region = '', { ticketId }) => {
  return axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const updateTicket: UpdateTicketAPI = (pid, region = '', { ticketId, params }) => {
  return axios.patch(`${getDeskURL(region)}/api/tickets/${ticketId}`, snakeCaseKeys(params), {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const transferTicket: TransferTicketAPI = (pid, region = '', { payload }) => {
  return axios.post(`${getDeskURL(region)}/api/transfers/`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const closeTicket: CloseTicketAPI = (pid, region = '', { ticketId, closeComment }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/tickets/${ticketId}/close/`,
    {
      closeComment,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const forceAssignTicket: ForceAssignTicketAPI = (pid, region = '', { ticketId, agentId }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/tickets/${ticketId}/force_assign/`,
    {
      agent: agentId,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const fetchTicketsCounts: FetchTicketsCountsAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/api/projects/${pid}/ticket_counts/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const addToWIP: AddToWIPAPI = (pid, region = '', { ticketId }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/tickets/${ticketId}/add_to_wip/`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const assignTicket: AssignTicketAPI = (pid, region = '', { ticketId }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/tickets/${ticketId}/assign/`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const reopenTicket: ReopenTicketAPI = (pid, region = '', { ticketId }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/tickets/${ticketId}/reopen/`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const assignTicketToAgentGroup: AssignTicketToAgentGroupAPI = (pid, region = '', { ticketId, groupId }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/tickets/${ticketId}/assign_group/`,
    { group_id: groupId },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const addTag: AddTagAPI = (pid, region = '', { ticketId, tagId }) => {
  return axios.post(
    `${getDeskURL(region)}/api/tickets/${ticketId}/add_tag/`,
    { tag: tagId },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const removeTag: RemoveTagAPI = (pid, region = '', { ticketId, tagId }) => {
  return axios.delete(`${getDeskURL(region)}/api/tickets/${ticketId}/delete_tag/`, {
    data: { tag: tagId },
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};
