import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { QUERY_USER_ID, LIST_LIMIT, QUERY_USER_NICKNAME, QUERY_USER_NICKNAME_STARTSWITH } from '@constants';

type GetQueryOptionsParams = { query: string; option: string };

const getQueryOptions = ({ query, option }: GetQueryOptionsParams) => {
  if (option === QUERY_USER_ID) {
    return `&user_ids=${encodeURIComponent(query)}`;
  }
  if (option === QUERY_USER_NICKNAME) {
    return `&nickname=${query}`;
  }
  if (option === QUERY_USER_NICKNAME_STARTSWITH) {
    return `&nickname_startswith=${query}`;
  }
  return '';
};

/** Users */
export const fetchUsers: FetchUsersAPI = ({ appId, activeMode, next = '' }) =>
  axios.get(`${getGateURL()}/platform/v3/users?token=${next}&active_mode=${activeMode}&limit=${LIST_LIMIT}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });

export const searchUsers: SearchUsersAPI = ({ appId, query, option, limit = LIST_LIMIT, next = '' }) => {
  return axios.get(
    `${getGateURL()}/platform/v3/users?token=${next}&limit=${limit}&active_mode=all${getQueryOptions({
      query,
      option,
    })}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const createUser: CreateUserAPI = ({ appId, userId, nickname, profileUrl, profileFile, issueAccessToken }) => {
  const formData = new FormData();
  formData.set('user_id', userId);
  formData.set('nickname', nickname);

  // profile_url is a required parameter even if it's empty
  formData.set('profile_url', profileUrl || '');

  // optionally can upload a profile image
  if (profileFile) {
    formData.set('profile_file', profileFile);
  }

  if (issueAccessToken) {
    formData.set('issue_access_token', 'true');
  }
  return axios.post(`${getGateURL()}/platform/v3/users`, formData, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const deleteUser: DeleteUserAPI = ({ appId, userId }) => {
  return axios.delete(`${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const reactivateUser: ReactivateUserAPI = ({ appId, userId }) => {
  return axios.put(
    `${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}`,
    {
      is_active: true,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const deactivateUser: DeactivateUserAPI = ({ appId, userId, leaveAll }) => {
  return axios.put(
    `${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}`,
    {
      is_active: false,
      leave_all_when_deactivated: leaveAll,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

/** User detail */
export const fetchUser: FetchUserAPI = ({ appId, userId }) => {
  return axios.get(`${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const editUser: EditUserAPI = ({ appId, userId, ...updates }) => {
  const payload = new FormData();
  if (updates.nickname) {
    payload.set('nickname', updates.nickname);
  }

  // using != null here to clear a profile image by passing an empty string
  if (updates.profileUrl != null) {
    payload.set('profile_url', updates.profileUrl);
  }

  // can optionally upload an image file to update profile image
  if (updates.profileFile) {
    payload.set('profile_file', updates.profileFile);
  }

  if (updates.issueAccessToken) {
    payload.set('issue_access_token', 'true');
  }

  return axios.put(`${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchUserPushTokens: FetchUserPushTokensAPI = ({ appId, userId, tokenType }) => {
  return axios.get(`${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}/push/${tokenType}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const deleteUserPushToken: DeleteUserPushTokenAPI = ({ appId, userId, tokenType, token }) => {
  return axios.delete(
    `${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}/push/${tokenType}/${encodeURIComponent(token)}`,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

/** Register an operator */
export const fetchRegisteredOperator: FetchRegisteredOperatorAPI = ({ appId, organizationUid, userId }) => {
  return axios.get(
    `${getGateURL()}/dashboard/organization/${organizationUid}/member_by_sdk_user/?sdk_user_id=${encodeURIComponent(
      userId,
    )}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const searchOrganizationMembers: SearchOrganizationMembersAPI = ({
  appId,
  organizationUid,
  userId = '',
  email = '',
}) => {
  return axios.get(
    `${getGateURL()}/dashboard/organization/${organizationUid}/members/search/?email=${encodeURIComponent(
      email,
    )}&sdk_user_id=${encodeURIComponent(userId)}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const registerUserAsOperator: RegisterUserAsOperatorAPI = ({ appId, organizationUid, userId, email }) => {
  return axios.put(
    `${getGateURL()}/dashboard/organization/${organizationUid}/members/link_sdk_user/`,
    { email, sdk_user_id: userId },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const unregisterUserAsOperator: UnregisterUserAsOperatorAPI = ({ appId, organizationUid, userId, email }) => {
  return axios.delete(`${getGateURL()}/dashboard/organization/${organizationUid}/members/link_sdk_user/`, {
    data: { sdk_user_id: userId, email },
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchUserGroupChannelCount: FetchUserGroupChannelCountAPI = ({ appId, userId }) => {
  return axios.get(`${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}/group_channel_count`, {
    params: {
      state: 'joined',
    },
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
