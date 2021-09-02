import { Actions } from '@actions';
import { AccountActionTypes, AuthenticationActionTypes, ApplicationActionTypes } from '@actions/types';

const initialState: AuthState = {
  isFetching: false,
  token: '',
  authenticated: false,
  user: {
    country_code: '',
    email: '',
    new_email: '',
    email_verified: false,
    nickname: '',
    first_name: '',
    last_name: '',
    country_name: '',
    profile_id: 0,
    profile_url: '',
    user_id: 0,
    two_factor_authentication: false,
    verification_email_sent: false,
    coachmark_completed: false,
  },
  role: {
    name: 'GUEST',
    permissions: [],
    is_predefined: false,
  },
  samlSigninInitiateError: null,
  is_social: false,
  is_sso: false,
};

export const authReducer: Reducer<AuthState, Actions> = (state = initialState, action) => {
  switch (action.type) {
    case AuthenticationActionTypes.SIGNIN_REQUEST:
    case AuthenticationActionTypes.SAML_SIGNIN_INITIATE_REQUEST:
    case AuthenticationActionTypes.VERIFY_AUTHENTICATION_REQUEST:
    case AuthenticationActionTypes.SIGNUP_REQUEST:
    case AuthenticationActionTypes.FORGOT_PASSWORD_REQUEST:
    case AuthenticationActionTypes.RESET_PASSWORD_REQUEST:
    case AuthenticationActionTypes.PROVE_GREEN_LANTERN_REQUEST:
      return { ...state, isFetching: true };
    case AuthenticationActionTypes.AUTHENTICATED:
      return {
        ...state,
        isFetching: false,
        authenticated: true,
        ...action.payload,
      };
    case AuthenticationActionTypes.SIGNIN_SUCCESS:
      return {
        ...state,
        authenticated: !action.payload.two_factor_authentication_required,
        token: action.payload.token,
        isFetching: false,
        ...action.payload,
      };
    case AccountActionTypes.CHANGE_EMAIL_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          new_email: action.payload.newEmail,
        },
      };
    case AuthenticationActionTypes.SIGNUP_SUCCESS:
    case AuthenticationActionTypes.SEND_EMAIL_VERIFICATION_MAIL_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          verification_email_sent: true,
        },
      };
    case AuthenticationActionTypes.VERIFY_EMAIL_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case AuthenticationActionTypes.VERIFY_EMAIL_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case AuthenticationActionTypes.VERIFY_EMAIL_SUCCESS:
      return {
        ...state,
        user: {
          ...state.user,
          email_verified: true,
        },
        isFetching: false,
      };
    case AuthenticationActionTypes.SIGNIN_FAIL:
    case AuthenticationActionTypes.VERIFY_AUTHENTICATION_SUCCESS:
    case AuthenticationActionTypes.SIGNUP_FAIL:
    case AuthenticationActionTypes.FORGOT_PASSWORD_SUCCESS:
    case AuthenticationActionTypes.FORGOT_PASSWORD_FAIL:
    case AuthenticationActionTypes.RESET_PASSWORD_SUCCESS:
    case AuthenticationActionTypes.RESET_PASSWORD_FAIL:
    case AuthenticationActionTypes.AUTHENTICATION_FAIL:
    case AuthenticationActionTypes.PROVE_GREEN_LANTERN_SUCCESS:
    case AuthenticationActionTypes.PROVE_GREEN_LANTERN_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case AuthenticationActionTypes.SAML_SIGNIN_INITIATE_FAIL:
      return {
        ...state,
        isFetching: false,
        samlSigninInitiateError: action.payload,
      };
    case AuthenticationActionTypes.SAML_SIGNIN_INITIATE_RESET:
      return {
        ...state,
        isFetching: false,
        samlSigninInitiateError: null,
      };
    case AccountActionTypes.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
      };
    case AccountActionTypes.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      };
    case AuthenticationActionTypes.SET_TWO_FACTOR_AUTHENTICATION:
      return {
        ...state,
        user: {
          ...state.user,
          two_factor_authentication: action.payload.two_factor_authentication,
        },
      };
    case ApplicationActionTypes.REGISTER_CALLS_APPLICATION:
      return {
        ...state,
        ...action.payload,
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
