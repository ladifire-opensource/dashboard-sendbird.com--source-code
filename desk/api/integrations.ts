import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const facebookLoadPages: FacebookLoadPagesAPI = (pid, region = '', { accessToken }) => {
  return axios.post(
    `${getDeskURL(region)}/api/facebook_pages/load_pages/`,
    {
      short_lived_user_access_token: accessToken,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const facebookSendMessage: FacebookSendMessageAPI = (pid, region = '', { page_id }) => {
  return axios.post(
    `${getDeskURL(region)}/api/facebook_pages/${page_id}/load_pages`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const facebookSubscribe: FacebookSubscribeAPI = (pid, region = '', { page_id }) => {
  return axios.post(
    `${getDeskURL(region)}/api/facebook_pages/${page_id}/subscribe`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const facebookUnsubscribe: FacebookUnsubscribeAPI = (pid, region = '', { page_id }) => {
  return axios.delete(`${getDeskURL(region)}/api/facebook_pages/${page_id}/unsubscribe`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const facebookActivePages: GetFacebookActivePagesAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/api/projects/facebook_pages?limit=100`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const facebookUpdatePageSettings: UpdateFacebookPageSettingsAPI = (pid, region = '', { pageId, payload }) => {
  return axios.patch(`${getDeskURL(region)}/api/facebook_pages/${pageId}`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const getProjectTwitterUsers: GetProjectTwitterUsersAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/api/projects/twitter_users`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const getTwitterOauthToken: GetTwitterOauthTokenAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/twitter/oauth/request_token/`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const subscribeTwitter: SubscribeTwitterAPI = (pid, region = '', payload) => {
  return axios.post(`${getDeskURL(region)}/api/twitter_users`, payload, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const patchTwitterUser: PatchTwitterUserAPI = (pid, region = '', { id, ...updates }) => {
  return axios.patch(`${getDeskURL(region)}/api/twitter_users/${id}/`, updates, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const getProjectInstagramAccounts: GetProjectInstagramAccountAPI = (pid, region = '') => {
  return axios.get(`${getDeskURL(region)}/api/projects/instagram_users`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};

export const instagramLoadAccounts: InstagramLoadAccountsAPI = (pid, region = '', { accessToken }) => {
  return axios.post(
    `${getDeskURL(region)}/api/instagram_users/load_accounts/`,
    {
      shortLivedUserAccessToken: accessToken,
    },
    {
      headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
    },
  );
};

export const fetchInstagramUser: FetchInstagramUserAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/instagram_users/${id}/`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });

export const patchInstagramUser: PatchInstagramUserAPI = (
  pid,
  region,
  { instagramUserId, isCommentEnabled, status },
) => {
  return axios.patch(
    `${getDeskURL(region)}/api/instagram_users/${instagramUserId}/`,
    { isCommentEnabled, status },
    {
      headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
    },
  );
};

export const createIframeApp: CreateIframeAppAPI = (pid, region, { title, url, width }) =>
  axios.post(
    `${getDeskURL(region)}/api/apps_iframes/`,
    { title, url, width },
    {
      headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
    },
  );

export const fetchIframeAppDetail: FetchIframeAppAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/apps_iframes/${id}`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });

export const updateIframeApp: UpdateIframeAppAPI = (pid, region, { id, ...params }) =>
  axios.patch(`${getDeskURL(region)}/api/apps_iframes/${id}`, params, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });

export const createNexmoAccount: CreateNexmoAccountAPI = (pid, region, params) =>
  axios.post(`${getDeskURL(region)}/api/nexmo_accounts`, params, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const updateNexmoAccount: UpdateNexmoAccountAPI = (pid, region, { id, ...params }) =>
  axios.patch(`${getDeskURL(region)}/api/nexmo_accounts/${id}`, params, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const verifyNexmoApp: VerifyNexmoAppAPI = (pid, region, params) =>
  axios.post(`${getDeskURL(region)}/api/nexmo_accounts/verify`, params, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const getProjectNexmoAccounts: GetProjectNexmoAccountsAPI = (pid, region) =>
  axios.get(`${getDeskURL(region)}/api/projects/subscribed_nexmo_accounts`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

// FIXME: get -> fetch
export const getNexmoAccountDetail: GetNexmoAccountDetailAPI = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/nexmo_accounts/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
