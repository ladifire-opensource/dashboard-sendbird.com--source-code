import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { fixedEncodeURIComponent } from '@utils';

export const fetchSDKUser = ({ appId }: FetchSDKUserParams) => {
  return axios.get<{ sdk_user: SDKUser | null }>(`${getGateURL()}/dashboard/sdk_users2/`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchSDKUserByID = ({ appId, userId }: FetchSDKUserByIDParams) => {
  return axios.get<SDKUser>(`${getGateURL()}/dashboard/sdk_users/${userId}/`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const createSDKUser = ({ appId, data }: CreateSDKUserParams) => {
  const payload = new FormData();
  if (data.sdk_user_id) {
    payload.append('sdk_user_id', data.sdk_user_id);
  }
  payload.append('nickname', data.nickname);

  if (data.profile_url) {
    payload.append('profile_url', data.profile_url);
  }
  if (data.profile_file) {
    payload.append('profile_file', data.profile_file);
  }
  payload.append('issue_access_token', String(data.issue_access_token));

  return axios.post<SDKUser>(`${getGateURL()}/dashboard/sdk_users/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateSDKUser = ({ appId, userId, data }: UpdateSDKUserParams) => {
  const payload = new FormData();
  payload.append('nickname', data.nickname);

  if (data.profile_url) {
    payload.append('profile_url', data.profile_url);
  }
  if (data.profile_file) {
    payload.append('profile_file', data.profile_file);
  }

  return axios.put(`${getGateURL()}/dashboard/sdk_users/${fixedEncodeURIComponent(userId)}/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const unregisterSDKUser = ({ appId, userId }: { appId: string; userId: string }) => {
  return axios.delete(`${getGateURL()}/dashboard/sdk_users/${userId}/`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};
