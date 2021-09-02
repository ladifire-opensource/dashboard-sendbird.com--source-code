import { createAction } from '@actions/createAction';
import { AccountActionTypes } from '@actions/types';

export const AccountActions: AccountActionCreators = {
  changePasswordRequest: (payload) => createAction(AccountActionTypes.CHANGE_PASSWORD_REQUEST, payload),
  changePasswordSuccess: (payload) => createAction(AccountActionTypes.CHANGE_PASSWORD_SUCCESS, payload),
  changePasswordFail: (payload) => createAction(AccountActionTypes.CHANGE_PASSWORD_FAIL, payload),
  changeEmailRequest: (payload) => createAction(AccountActionTypes.CHANGE_EMAIL_REQUEST, payload),
  changeEmailSuccess: (payload) => createAction(AccountActionTypes.CHANGE_EMAIL_SUCCESS, payload),
  changeEmailFail: (payload) => createAction(AccountActionTypes.CHANGE_EMAIL_FAIL, payload),
  unregisterRequest: (payload) => createAction(AccountActionTypes.UNREGISTER_REQUEST, payload),
  unregisterSuccess: () => createAction(AccountActionTypes.UNREGISTER_SUCCESS),
  unregisterFail: (payload) => createAction(AccountActionTypes.UNREGISTER_FAIL, payload),
  isAbleToUnregisterRequest: () => createAction(AccountActionTypes.IS_ABLE_TO_UNREGISTER_REQUEST),
  isAbleToUnregisterSuccess: (payload) => createAction(AccountActionTypes.IS_ABLE_TO_UNREGISTER_SUCCESS, payload),
  isAbleToUnregisterFail: (payload) => createAction(AccountActionTypes.IS_ABLE_TO_UNREGISTER_FAIL, payload),
  turnoffGoogleAuthenticatorRequest: () => createAction(AccountActionTypes.TURNOFF_GOOGLE_AUTHENTICATOR_REQUEST),
  turnoffGoogleAuthenticatorSuccess: (payload) =>
    createAction(AccountActionTypes.TURNOFF_GOOGLE_AUTHENTICATOR_SUCCESS, payload),
  turnoffGoogleAuthenticatorFail: (payload) =>
    createAction(AccountActionTypes.TURNOFF_GOOGLE_AUTHENTICATOR_FAIL, payload),

  updateUser: (payload) => createAction(AccountActionTypes.UPDATE_USER, payload),
};
