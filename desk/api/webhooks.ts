import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchWebhooks: FetchWebhooksAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/api/projects/webhooks?status=ACTIVE`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const addWebhooks: AddWebhookAPI = (pid, region = '', payload) => {
  return axios.post(`${getDeskURL(region)}/api/webhooks`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const searchWebhooks: SearchWebhookAPI = (pid, region = '', payload) => {
  return axios.get(`${getDeskURL(region)}/api/webhooks/${payload.id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const editWebhook: EditWebhookAPI = (pid, region = '', payload) => {
  if (payload.status !== 'INACTIVE') {
    delete payload.status;
  }

  return axios.patch(`${getDeskURL(region)}/api/webhooks/${payload.id}`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const getWebhookSignature: GetSignatureAPI = (pid, region = '', payload) => {
  return axios.get(`${getDeskURL(region)}/api/webhooks/${payload.id}/signature`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
