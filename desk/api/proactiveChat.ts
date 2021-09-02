import { axios, getDeskURL } from '@api/shared';
import { fixedEncodeURIComponent, ClientStorage } from '@utils';

export const getProactiveChatList: FetchProactiveChatListAPI = (pid, region = '', { offset = 0, limit = 50 }) => {
  return axios.get(`${getDeskURL(region)}/api/proactive_chats`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: {
      limit,
      offset,
    },
  });
};

export const getProactiveChatTickets: FetchProactiveChatTicketsAPI = (
  pid,
  region = '',
  { offset = 0, limit = 50, startDate, endDate, q, createdBy, groupId, customer, priority, order },
) => {
  return axios.get(`${getDeskURL(region)}/api/projects/proactive_chat_tickets`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: {
      limit,
      offset,
      start_date: startDate,
      end_date: endDate,
      q: q ? fixedEncodeURIComponent(q) : undefined,
      created_by: createdBy,
      group: groupId,
      customer,
      priority,
      order,
    },
  });
};

export const createProactiveChat: CreateProactiveChatAPI = (pid, region = '', payload) => {
  return axios.post(`${getDeskURL(region)}/api/proactive_chats/`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const sendFollowUpMessage: SendFollowUpMessageAPI = (pid, region, payload) =>
  axios.post(`${getDeskURL(region)}/api/projects/proactive_chat_tickets/follow_up_message`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const fetchProactiveChatDetail: FetchProactiveChatDetailAPI = (pid, region, { ticketId }) =>
  axios.get(`${getDeskURL(region)}/api/projects/proactive_chat_tickets/${ticketId}/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
