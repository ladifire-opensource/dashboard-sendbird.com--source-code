import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { LIST_LIMIT } from '@constants';
import { fixedEncodeURIComponent } from '@utils';

export const searchMessages = ({ appId, payload }) => {
  const parameters = `channel_url=${payload.channel_url}&start_timestamp=${payload.startDate}&end_timestamp=${
    payload.endDate
  }&keyword=${payload.keyword}&user_id=${fixedEncodeURIComponent(payload.user_id)}&exclude_removed=${
    payload.excludeRemoved
  }&limit=${LIST_LIMIT}&page=${payload.page}`;

  return axios.get(`${getGateURL()}/platform/dapi/messages/?${parameters}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchMessage = ({ appId, messageId }) => {
  return axios.get(`${getGateURL()}/platform/dapi/messages/${messageId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const recoverMessage = ({ appId, messageId }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/messages/${messageId}`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const deleteMessages = ({ appId, message_ids }) => {
  return axios.delete(`${getGateURL()}/platform/dapi/messages/`, {
    data: {
      message_ids,
    },
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const deleteMessage = ({ appId, channelType, channelURL, messageId }) => {
  return axios.delete(`${getGateURL()}/platform/v3/${channelType}/${channelURL}/messages/${messageId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const deleteAllChannelMessages = ({ appId, channelType, channelUrl }) => {
  return axios.delete(`${getGateURL()}/platform/dapi/${channelType}/${channelUrl}/messages/`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
