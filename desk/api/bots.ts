import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys } from '@utils';

export const createDeskBot: CreateDeskBotAPI = (pid, region, payload) => {
  const formData = new FormData();
  Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
  return axios.post(`${getDeskURL(region)}/api/bots`, formData, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });
};

export const updateDeskBot: UpdateDeskBotAPI = (pid, region, { id, payload }) => {
  const formData = new FormData();
  Object.keys(payload).forEach((key) => formData.append(key, payload[key]));
  return axios.patch(`${getDeskURL(region)}/api/bots/${id}`, formData, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchDeskBot: FetchDeskBotAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/bots/${id}`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });

export const fetchDeskBots: FetchDeskBotsAPI = (
  pid,
  region,
  { offset = 0, limit = 20, order = '-created_at', status, group, type },
) =>
  axios.get(`${getDeskURL(region)}/api/projects/bots`, {
    params: { offset, limit, order, status, group, type },
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });

export const fetchDeskBotWebhookLogs: FetchDeskBotWebhookLogsAPI = (
  pid,
  region,
  { id, order = '-created_at', offset = 0, limit = 20, ...otherParams },
) =>
  axios.get(`${getDeskURL(region)}/api/bots/${id}/webhook_logs`, {
    params: snakeCaseKeys({ ...otherParams, order, offset, limit }),
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });

export const checkIsBotKeyDuplicated: CheckIsBotKeyDuplicatedAPI = (pid, region, { botKey }) =>
  axios.get(`${getDeskURL(region)}/api/bots/key_duplicate_check?key=${botKey}`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });

export const uploadDeskFAQBotFile: UploadDeskFAQBotFileAPI = (pid, region, payload) => {
  const params = Object.entries(payload).reduce((formData, [key, value]) => {
    if (value) {
      formData.append(key, typeof value === 'number' ? value.toString() : value);
    }
    return formData;
  }, new FormData());
  return axios.post(`${getDeskURL(region)}/api/faq_files`, params, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchDeskFAQBotFiles: FetchDeskFAQBotFilesAPI = (
  pid,
  region,
  { id, offset, limit, order, startDate, endDate, status },
) => {
  return axios.get(`${getDeskURL(region)}/api/bots/${id}/faq_files/`, {
    params: snakeCaseKeys({ offset, limit, order, startDate, endDate, status }),
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });
};

export const checkIsBotFilenameDuplicated: CheckIsBotFilenameDuplicatedAPI = (pid, region, { id, filename }) =>
  axios.get(`${getDeskURL(region)}/api/bots/${id}/filename_duplicate_check/`, {
    params: { filename },
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });

export const fetchDeskFAQBotFile: FetchDeskFAQBotFileAPI = (pid, region, { id }) => {
  return axios.get(`${getDeskURL(region)}/api/faq_files/${id}/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });
};

export const updateDeskFAQBotFile: UpdateDeskFAQBotFileAPI = (pid, region, { id, status }) => {
  return axios.patch(
    `${getDeskURL(region)}/api/faq_files/${id}/`,
    { status },
    {
      headers: {
        Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const getFAQBotCSVFileDownloadURL: GetFAQBotCSVFileDownloadURLAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/faq_files/${id}/get_file_url/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
  });
