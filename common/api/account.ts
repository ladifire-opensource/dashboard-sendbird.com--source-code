import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const changePassword = (payload: { password: string; new_password: string; new_password_confirm: string }) => {
  return axios.put(`${getGateURL()}/dashboard/auth/change_password/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const changeEmail: ChangeEmailAPI = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/profiles/change_user_email/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const updateProfile: UpdateProfileAPI = (id, payload) => {
  return axios.patch(`${getGateURL()}/dashboard_api/profiles/${id}/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const checkPassword = (password: string) => {
  return axios.post(
    `${getGateURL()}/dashboard/auth/check_password/`,
    {
      password,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const isAbleToUnregister: IsAbleToUnregisterAPI = () => {
  return axios.get(`${getGateURL()}/dashboard/auth/is_able_to_unregister/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const unregister = (password: string = '') => {
  return axios.post(
    `${getGateURL()}/dashboard/auth/unregister/`,
    {
      password,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const prepareTwoFactor = () => {
  return axios.post<{ provision_uri: string; secret_code: string }>(
    `${getGateURL()}/dashboard_api/two_factor_authentications/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const registerTwoFactor = (payload) => {
  return axios.post<{ recovery_code: string; token: string }>(
    `${getGateURL()}/dashboard_api/two_factor_authentications/confirm/`,
    payload,
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const turnoffTwoFactor = () => {
  return axios.delete(`${getGateURL()}/dashboard_api/two_factor_authentications/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};
