import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const signIn = ({ email, password }) => {
  return axios.post(`${getGateURL()}/dashboard/auth/authenticate/`, {
    email,
    password,
  });
};

export const signOut = () => {
  return axios.post(
    `${getGateURL()}/dashboard_api/profiles/sign_out/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const samlSigninInitiate: SamlSigninInitiateAPI = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/authentications/sso_saml/`, payload);
};

export const resendActivationMail: ResendActivationMailAPI = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/authentications/resend_activation_mail/`, payload);
};

export const activateAccount: ActivateAccountAPI = (payload) => {
  return axios.get(`${getGateURL()}/dashboard_api/authentications/activate_user/`, {
    params: payload,
  });
};

export const signUp = (payload) => {
  return axios.post(`${getGateURL()}/dashboard/auth/signup/`, payload);
};

export const verifyAuth: VerifyAuthAPI = () => {
  return axios.get(`${getGateURL()}/dashboard/auth/verify2/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const verifyEmail = (payload) => {
  return axios.get(`${getGateURL()}/dashboard_api/profiles/verify_user_email/?token=${payload.token}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const sendEmailVerificationMail = () => {
  return axios.post(
    `${getGateURL()}/dashboard_api/profiles/resend_email_verification_mail/`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const confirmEmailChange: ConfirmEmailChangeAPI = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/authentications/confirm_user_email_change/`, payload);
};

export const getEmailChange = (payload) => {
  return axios.get(
    `${getGateURL()}/dashboard_api/authentications/get_user_email_change_request/?token=${payload.token}`,
  );
};

export const resetPassword = (payload) => {
  return axios.post(`${getGateURL()}/dashboard/auth/reset_password/`, payload);
};

export const forgotPassword = (email) => {
  return axios.post(`${getGateURL()}/dashboard/auth/forgot_password/`, {
    email,
  });
};

/**
 * Set new password for auto signup user
 * @param password - replace password to user's
 */
export const setPassword = (password) => {
  return axios.post(
    `${getGateURL()}/dashboard/auth/set_password/`,
    { password },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

/**
 * Create first application in registration container
 * @param payload - region, app_name, organization_uid
 */
export const createApplicationInRegistration = ({ region, app_name, organization_uid }) => {
  return axios.post(
    `${getGateURL()}/dashboard/create_application/`,
    {
      app_name,
      region,
      organization_uid,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const fetchInvitation = (invite_hash) => {
  return axios.get(`${getGateURL()}/dashboard/auth/invitation/${invite_hash}/`);
};

export const oauthGoogle = ({ idToken }) => {
  return axios.post(`${getGateURL()}/dashboard_api/authentications/oauth_google/`, {
    id_token: idToken,
  });
};

export const verifyTwoFactor = (code) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/two_factor_authentications/verify/`,
    {
      code,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

export const recoverTwoFactor = (code) => {
  return axios.post(
    `${getGateURL()}/dashboard_api/two_factor_authentications/recover/`,
    {
      code,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
      },
    },
  );
};

/**
 * Prove yourself a green lantern
 * @param payload
 */
export const proveGreenLantern = (payload) => {
  return axios.post(`${getGateURL()}/dashboard_api/authentications/team_account_login/`, payload, {});
};
