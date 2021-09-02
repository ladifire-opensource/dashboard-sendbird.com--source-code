import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchSystemMessages: FetchSystemMessagesAPI = (pid, region) =>
  axios.get(`${getDeskURL(region)}/api/projects/system_messages/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const updateSystemMessage: UpdateSystemMessageAPI = (pid, region, payload) =>
  axios.patch(
    `${getDeskURL(region)}/api/projects/system_messages`,
    { ...payload },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const fetchDefaultSystemMessages: FetchDefaultSystemMessagesAPI = (pid, region) =>
  axios.get(`${getDeskURL(region)}/api/projects/default_system_messages/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
