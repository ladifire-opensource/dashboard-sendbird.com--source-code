import { createAction } from '@actions/createAction';
import { AuthenticationActionTypes } from '@actions/types';

export const AuthenticationActions: AuthenticationActionCreators = {
  signinRequest: (payload) => createAction(AuthenticationActionTypes.SIGNIN_REQUEST, payload),
  signinSuccess: (payload) => createAction(AuthenticationActionTypes.SIGNIN_SUCCESS, payload),
  signinFail: (payload) => createAction(AuthenticationActionTypes.SIGNIN_FAIL, payload),

  // SAML sign-in initiation
  samlSigninInitiateRequest: (payload) => createAction(AuthenticationActionTypes.SAML_SIGNIN_INITIATE_REQUEST, payload),

  samlSigninInitiateSuccess: () => createAction(AuthenticationActionTypes.SAML_SIGNIN_INITIATE_SUCCESS),

  samlSigninInitiateFail: (error) => createAction(AuthenticationActionTypes.SAML_SIGNIN_INITIATE_FAIL, error),

  samlSigninInitiateReset: () => createAction(AuthenticationActionTypes.SAML_SIGNIN_INITIATE_RESET),

  resendActivationMail: (payload) => createAction(AuthenticationActionTypes.RESEND_ACTIVATION_MAIL, payload),

  signupRequest: (payload) => createAction(AuthenticationActionTypes.SIGNUP_REQUEST, payload),
  signupSuccess: () => createAction(AuthenticationActionTypes.SIGNUP_SUCCESS),
  signupFail: (payload) => createAction(AuthenticationActionTypes.SIGNUP_FAIL, payload),
  verifyAuthenticationRequest: (payload?) =>
    createAction(AuthenticationActionTypes.VERIFY_AUTHENTICATION_REQUEST, payload),
  verifyAuthenticationSuccess: (payload) =>
    createAction(AuthenticationActionTypes.VERIFY_AUTHENTICATION_SUCCESS, payload),
  verifyAuthenticationFail: (payload) => createAction(AuthenticationActionTypes.VERIFY_AUTHENTICATION_FAIL, payload),
  verifyEmailRequest: (payload) => createAction(AuthenticationActionTypes.VERIFY_EMAIL_REQUEST, payload),
  verifyEmailSuccess: () => createAction(AuthenticationActionTypes.VERIFY_EMAIL_SUCCESS),
  verifyEmailFail: (payload) => createAction(AuthenticationActionTypes.VERIFY_EMAIL_FAIL, payload),
  sendEmailVerificationMailRequest: () => createAction(AuthenticationActionTypes.SEND_EMAIL_VERIFICATION_MAIL_REQUEST),
  sendEmailVerificationMailSuccess: () => createAction(AuthenticationActionTypes.SEND_EMAIL_VERIFICATION_MAIL_SUCCESS),
  sendEmailVerificationMailFail: () => createAction(AuthenticationActionTypes.SEND_EMAIL_VERIFICATION_MAIL_FAIL),
  confirmEmailChangeRequest: (payload) => createAction(AuthenticationActionTypes.CONFIRM_EMAIL_CHANGE_REQUEST, payload),
  confirmEmailChangeSuccess: () => createAction(AuthenticationActionTypes.CONFIRM_EMAIL_CHANGE_SUCCESS),
  confirmEmailChangeFail: (payload) => createAction(AuthenticationActionTypes.CONFIRM_EMAIL_CHANGE_FAIL, payload),
  authenticated: (authenticatedResponse: AuthenticationResponse) =>
    createAction(AuthenticationActionTypes.AUTHENTICATED, authenticatedResponse),
  unauthenticated: () => createAction(AuthenticationActionTypes.UNAUTHENTICATED),
  authenticationFail: (payload) => createAction(AuthenticationActionTypes.AUTHENTICATION_FAIL, payload),
  signoutRequest: () => createAction(AuthenticationActionTypes.SIGNOUT_REQUEST),
  signoutSuccess: () => createAction(AuthenticationActionTypes.SIGNOUT_SUCCESS),
  forgotPasswordRequest: (email: string) => createAction(AuthenticationActionTypes.FORGOT_PASSWORD_REQUEST, email),
  forgotPasswordSuccess: () => createAction(AuthenticationActionTypes.FORGOT_PASSWORD_SUCCESS),
  forgotPasswordFail: (payload) => createAction(AuthenticationActionTypes.FORGOT_PASSWORD_FAIL, payload),
  resetPasswordRequest: (payload: { key: string; password: string; password_confirm: string }) =>
    createAction(AuthenticationActionTypes.RESET_PASSWORD_REQUEST, payload),
  resetPasswordSuccess: () => createAction(AuthenticationActionTypes.RESET_PASSWORD_SUCCESS),
  resetPasswordFail: (payload) => createAction(AuthenticationActionTypes.RESET_PASSWORD_FAIL, payload),
  // home
  fetchInvitationRequest: (payload: { invite_hash: string; onSuccess: (response) => void }) =>
    createAction(AuthenticationActionTypes.FETCH_INVITATION_REQUEST, payload),
  fetchInvitationSuccess: (payload: Invitation) =>
    createAction(AuthenticationActionTypes.FETCH_INVITATION_SUCCESS, payload),
  fetchInvitationFail: (payload) => createAction(AuthenticationActionTypes.FETCH_INVITATION_FAIL, payload),

  // social
  oauthGoogleRequest: (payload) => createAction(AuthenticationActionTypes.OAUTH_GOOGLE_REQUEST, payload),
  oauthGoogleFail: () => createAction(AuthenticationActionTypes.OAUTH_GOOGLE_FAIL),

  setTwoFactorAuthentication: (payload: { two_factor_authentication: boolean }) =>
    createAction(AuthenticationActionTypes.SET_TWO_FACTOR_AUTHENTICATION, payload),

  recoverTwoFactorAuthenticationRequest: (payload: { code: string }) =>
    createAction(AuthenticationActionTypes.RECOVER_TWO_FACTOR_AUTHENTICATION_REQUEST, payload),
  recoverTwoFactorAuthenticationSuccess: (payload) =>
    createAction(AuthenticationActionTypes.RECOVER_TWO_FACTOR_AUTHENTICATION_SUCCESS, payload),
  recoverTwoFactorAuthenticationFail: (payload) =>
    createAction(AuthenticationActionTypes.RECOVER_TWO_FACTOR_AUTHENTICATION_FAIL, payload),
  proveGreenLanternRequest: (payload: { eid: string; password: string; targetUserEmail: string }) =>
    createAction(AuthenticationActionTypes.PROVE_GREEN_LANTERN_REQUEST, payload),
  proveGreenLanternSuccess: (payload) => createAction(AuthenticationActionTypes.PROVE_GREEN_LANTERN_SUCCESS, payload),
  proveGreenLanternFail: (payload) => createAction(AuthenticationActionTypes.PROVE_GREEN_LANTERN_FAIL, payload),
};
