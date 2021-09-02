import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, ClientStorage } from '@utils';

export const fetchQuickReplies: FetchQuickRepliesAPI = (pid, region = '', { limit, offset, q, availableType }) => {
  return axios.get(`${getDeskURL(region)}/api/projects/quick_replies/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: snakeCaseKeys({ limit, offset, q, availableType, order: '-created_at' }),
  });
};

export const searchQuickReply: SearchQuickRepliesAPI = (
  pid,
  region = '',
  { limit, offset, name, availableType, group },
) => {
  return axios.get(`${getDeskURL(region)}/api/projects/search_quick_replies/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: snakeCaseKeys({ limit, offset, name, availableType, group, order: '-created_at' }),
  });
};

export const fetchQuickReplySearchCounts: FetchQuickReplySearchCountsAPI = (
  pid,
  region = '',
  { limit, offset, name },
) => {
  return axios.get(`${getDeskURL(region)}/api/projects/search_quick_reply_count/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: { limit, offset, name },
  });
};

export const fetchQuickReply: FetchQuickReplyAPI = (pid, region = '', { id }) => {
  return axios.get(`${getDeskURL(region)}/api/quick_replies/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const createQuickReply: CreateQuickReplyAPI = (
  pid,
  region = '',
  { message, name, availableAgent, availableType, group },
) => {
  return axios.post(
    `${getDeskURL(region)}/api/quick_replies/`,
    { message, name, availableAgent, availableType, group },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateQuickReply: UpdateQuickRepliesAPI = (
  pid,
  region = '',
  { id, message, name, availableAgent, availableType, group },
) => {
  return axios.patch(
    `${getDeskURL(region)}/api/quick_replies/${id}`,
    { availableAgent, availableType, group, message, name },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const deleteQuickReply: DeleteQuickRepliesAPI = (pid, region = '', { id }) => {
  return axios.delete(`${getDeskURL(region)}/api/quick_replies/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
