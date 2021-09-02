import { LocationChangeAction, LOCATION_CHANGE } from 'connected-react-router';
import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { of, from, iif, defer } from 'rxjs';
import { mergeMap, catchError, map, filter, tap } from 'rxjs/operators';

import { commonActions } from '@actions';
import { AuthenticationActionTypes } from '@actions/types';
import { setSBAuthToken, clearSBAuthToken, commonApi, getSBAuthToken, initSession, clearSession } from '@api';
import { confirmEmailChange } from '@common/api';
import { PredefinedRoles } from '@constants';
import { generateBadRequest, alertBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { logException } from '@utils/logException';
import { ALERT_PASSWORD_CHANGED_BY_RESET } from '@utils/text';

import { AuthError, AuthErrorCode } from './authError';

export const signinEpic: SBEpic<SigninRequestAction> = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.SIGNIN_REQUEST),
    mergeMap((action) => {
      const request = commonApi.signIn(action.payload);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          const responses: any[] = [];

          // Setting SBAuthToken here is required to verify the OTP entered by user in 2FA authentication process.
          initSession(response.token);
          if (response.two_factor_registration_required) {
            responses.push(
              commonActions.pushHistory(
                `/auth/two_factor_registration${action.payload.next === '' ? '' : `?next=${action.payload.next}`}`,
              ),
              commonActions.signinSuccess(response),
            );
          } else if (response.two_factor_authentication_required) {
            responses.push(
              commonActions.pushHistory(
                `/auth/two_factor${action.payload.next === '' ? '' : `?next=${action.payload.next}`}`,
              ),
              commonActions.signinSuccess(response),
            );
          } else if (action.payload.next) {
            responses.push(commonActions.pushHistory(action.payload.next));
          } else {
            responses.push(commonActions.verifyAuthenticationRequest());
          }
          return from(responses);
        }),
        catchError<any, any>((error) => {
          clearSBAuthToken();
          const errorCode = error && error.data && error.data.code;
          switch (errorCode) {
            case AuthErrorCode.organizationSsoEnforced:
              return from([
                commonActions.pushHistory({
                  pathname: '/auth/sso',
                  search: `?slug_name=${encodeURIComponent(error.data.slug_name)}`,
                }),
                commonActions.samlSigninInitiateFail(AuthError.fromAny(error)),
              ]);
            default:
              return from([alertBadRequest(error), commonActions.signinFail(error)]);
          }
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.authenticationFail(error));
    }),
  );
};

export const samlSigninInitiateEpic: SBEpic<SamlSigninInitiateAction> = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.SAML_SIGNIN_INITIATE_REQUEST),
    mergeMap((action) => {
      const request = commonApi.samlSigninInitiate(action.payload);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          window.location.assign(response.redirect_to);
          return from([commonActions.samlSigninInitiateSuccess()]);
        }),
        catchError((error) => {
          return of(commonActions.samlSigninInitiateFail(AuthError.fromAny(error)));
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.samlSigninInitiateFail(AuthError.fromAny(error)));
    }),
  );
};

export const samlSigninCallbackEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(LOCATION_CHANGE),
    filter((action) => action.payload.location.pathname === '/sso' && action.payload.location['query']),
    mergeMap<LocationChangeAction, any>((action) => {
      const { code, err_msg, token, ...data } = action.payload.location['query'];
      if (code === 'type.auth.sso.user.not_exist') {
        return from([
          commonActions.pushHistory(`/auth/signup?sso_token=${token}&sso_type=saml`, {
            email: data.email,
          }),
        ]);
      }
      if (code === 'type.auth.sso.success') {
        initSession(token);
        return from([commonActions.verifyAuthenticationRequest()]);
      }
      return from([commonActions.samlSigninInitiateFail(new AuthError(code as AuthErrorCode, err_msg, data))]);
    }),
  );
};

export const resendActivationMailEpic: SBEpic<ResendActivationMailAction> = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.RESEND_ACTIVATION_MAIL),
    mergeMap((action) => {
      const request = commonApi.resendActivationMail(action.payload);
      return from(request).pipe(
        mergeMap(() =>
          of(commonActions.samlSigninInitiateFail(new AuthError(AuthErrorCode.ssoUserActivationMailSent))),
        ),
        catchError((error) => of(generateBadRequest(error))),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(generateBadRequest(error));
    }),
  );
};

export const verifyEmailEpic: SBEpic<VerifyEmailAction> = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.VERIFY_EMAIL_REQUEST),
    mergeMap((action) => {
      return of(action.payload).pipe(
        map((payload) => payload.token),
        mergeMap((token) =>
          iif(
            () => !!token,
            defer(() => {
              if (!getSBAuthToken()) {
                // The user is unauthorized. Redirect the user to sign in screen.
                return from([
                  commonActions.verifyEmailFail('unauthorized'),
                  commonActions.pushHistory(`/auth/signin?next=/auth/verify_email?email_verification_token=${token}`, {
                    isVerifyingEmail: true,
                  }),
                ]);
              }
              const request = commonApi.verifyEmail({ token });
              return from(request).pipe(
                mergeMap(() => {
                  return from([commonActions.verifyEmailSuccess(), commonActions.pushHistory('/')]);
                }),
                catchError((error) => {
                  const errorMessage = getErrorMessage(error);
                  toast.error({
                    message:
                      errorMessage === 'Token does not exists.'
                        ? 'This email verification link is invalid. Resend a verification email to get a new link.'
                        : errorMessage,
                  });
                  return from([commonActions.verifyEmailFail(error), commonActions.pushHistory('/')]);
                }),
              );
            }),
            from([commonActions.verifyEmailFail('token undefined'), commonActions.pushHistory('/')]),
          ),
        ),
      );
    }),
  );
};

export const confirmEmailChangeEpic: SBEpic<ConfirmEmailChangeAction> = (action$) =>
  action$.pipe(
    ofType(AuthenticationActionTypes.CONFIRM_EMAIL_CHANGE_REQUEST),
    map((action) => action.payload),
    mergeMap(({ token, password }) =>
      from(
        confirmEmailChange({
          token,
          password,
        }),
      ).pipe(
        map((response) => response.data),
        mergeMap((data) =>
          from([commonActions.confirmEmailChangeSuccess(), commonActions.pushHistory('/')]).pipe(
            tap(() => setSBAuthToken(data.token)),
          ),
        ),
        catchError((error) => from([generateBadRequest(error), commonActions.confirmEmailChangeFail(error)])),
      ),
    ),
  );

export const sendEmailVerificationMailEpic: SBEpic<SendEmailVerificationMailAction> = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.SEND_EMAIL_VERIFICATION_MAIL_REQUEST),
    mergeMap(() => {
      const request = commonApi.sendEmailVerificationMail();
      return from(request).pipe(
        mergeMap(() => {
          return from([commonActions.sendEmailVerificationMailSuccess()]);
        }),
        catchError((error) => {
          generateBadRequest(error);
          return from([commonActions.sendEmailVerificationMailFail(), commonActions.pushHistory('/')]);
        }),
      );
    }),
  );
};

export const activateAccountEpic: SBEpic<LocationChangeAction> = (action$) => {
  return action$.pipe(
    ofType(LOCATION_CHANGE),
    filter((action) => action.payload.location.pathname === '/activate' && !!action.payload.location.query),
    mergeMap((action) => {
      const { user_activation_token } = action.payload.location['query'];
      const request = commonApi.activateAccount({ token: user_activation_token });
      return from(request).pipe(
        mergeMap((response) =>
          from([
            commonActions.pushHistory({
              pathname: '/auth/sso',
              search: `?slug_name=${encodeURIComponent(response.data.slug_name)}&activation=done`,
            }),
          ]),
        ),
        catchError((error) => {
          const { slug_name } = error && error.response && error.response.data;
          const search = slug_name ? `?slug_name=${encodeURIComponent(slug_name)}` : undefined;

          return from([
            commonActions.pushHistory({
              pathname: '/auth/sso',
              search,
            }),
            commonActions.samlSigninInitiateFail(AuthError.fromAny(error)),
          ]);
        }),
        catchError((error) => {
          logException({ error });
          return of(generateBadRequest(error));
        }),
      );
    }),
  );
};

export const verifyAuthenticationEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.VERIFY_AUTHENTICATION_REQUEST),
    mergeMap((action) => {
      // verify error cases
      const request = commonApi.verifyAuth();
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((authenticatedResponse) => {
          // Right after the user signed up, set his role Owner.
          const role: AuthorizedRole =
            authenticatedResponse.organizations.length === 0
              ? {
                  name: PredefinedRoles.OWNER,
                  permissions: [
                    'organization.general.all',
                    'organization.applications.all',
                    'organization.members.all',
                    'organization.billing.all',
                    'organization.security.all',
                    'application.overview.view',
                    'application.channels.openChannel.all',
                    'application.channels.groupChannel.all',
                    'application.announcements.all',
                    'application.dataExport.all',
                    'application.messageSearch.all',
                    'application.users.all',
                    'application.analytics.view',
                    'application.settings.all',
                    'support.technical',
                  ],
                  is_predefined: true,
                }
              : authenticatedResponse.role;
          const responses: any[] = [commonActions.authenticated({ ...authenticatedResponse, role })];
          if (action.payload && !!action.payload.invited) {
            responses.push(commonActions.pushHistory('/'));
          }
          if (action.payload && action.payload.next) {
            responses.push(commonActions.pushHistory(action.payload.next));
          }
          return from(responses);
        }),
        catchError((error) => {
          const errorResponses: any[] = [];
          if (error && !!error.status) {
            if (error.status === 400 && !!error.data) {
              clearSBAuthToken();
              errorResponses.push(
                commonActions.addNotificationsRequest({
                  status: 'error',
                  message: error.data.message,
                }),
              );
              errorResponses.push(commonActions.pushHistory(`/auth/signin?next=${window.location.pathname}`));
            } else if (error.status === 401 && !!error.data) {
              errorResponses.push(commonActions.pushHistory(`/auth/signin?next=${window.location.pathname}`));
            } else {
              // FIXME: 500 responses will fall to this block. We should give users another option here, like signing out.
              toast.error({ message: getErrorMessage(error) });
            }
          } else {
            toast.error({ message: getErrorMessage(error) });
          }
          return from(errorResponses);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.authenticationFail(error));
    }),
  );
};

export const recoverTwoFactorAuthenticationEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.RECOVER_TWO_FACTOR_AUTHENTICATION_REQUEST),
    mergeMap((action) => {
      const request = commonApi.recoverTwoFactor(action.payload.code);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return from([
            commonActions.addNotificationsRequest({
              status: 'success',
              message: 'Two-factor authentication has been successfully disabled',
            }),
            commonActions.verifyAuthenticationRequest({ next: '/auth/signin' }),
          ]);
        }),
        catchError((error) => {
          return from([alertBadRequest(error), commonActions.recoverTwoFactorAuthenticationFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return [commonActions.recoverTwoFactorAuthenticationFail(error), commonActions.pushHistory('/auth/signin')];
    }),
  );
};

export const signupEpic: SBEpic<SignupRequestAction> = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.SIGNUP_REQUEST),
    mergeMap((action) => {
      const request = commonApi.signUp(action.payload);
      return from(request).pipe(
        mergeMap((response) => {
          initSession(response.data.token);
          const responses: any[] = [];
          if (action.payload && !!action.payload.invite_hash) {
            responses.push(commonActions.verifyAuthenticationRequest({ invited: true }));
          } else {
            responses.push(commonActions.verifyAuthenticationRequest({ next: '/' }));
          }
          return from(responses);
        }),
        catchError((error) => {
          if (error.data.code && error.data.code === 'type.auth.sso.user.activation_mail_sent') {
            return from([
              commonActions.pushHistory('/auth/sso'),
              commonActions.samlSigninInitiateFail(AuthError.fromAny(error)),
            ]);
          }
          return from([generateBadRequest(error), commonActions.signupFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.authenticationFail(error));
    }),
  );
};

export const signoutEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.SIGNOUT_REQUEST),
    mergeMap(() => {
      clearSession();
      return from([
        commonActions.sbDisconnectRequest(),
        commonActions.unauthenticated(),
        () => {
          // after sbDisconnectRequest & unauthenticated are called, move to /auth/signin
          window.location.href = '/auth/signin';
        },
      ]);
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.authenticationFail(error));
    }),
  );
};

export const forgotPasswordEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.FORGOT_PASSWORD_REQUEST),
    mergeMap((action) => {
      const request = commonApi.forgotPassword(action.payload);
      return from(request).pipe(
        mergeMap((response: any) => {
          return from([
            commonActions.addNotificationsRequest({
              status: response.data.message_type === 'sent' ? 'info' : 'warning',
              message: response.data.message,
            }),
            commonActions.forgotPasswordSuccess(),
            commonActions.pushHistory('/auth/signin'),
          ]);
        }),
        catchError((error) => {
          return from([alertBadRequest(error), commonActions.forgotPasswordFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([commonActions.forgotPasswordFail(error)]);
    }),
  );
};

export const resetPasswordEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.RESET_PASSWORD_REQUEST),
    mergeMap((action) => {
      const request = commonApi.resetPassword(action.payload);
      return from(request).pipe(
        mergeMap(() => {
          /**
           * Server API dosen't return authentication information
           * So we need to expire current token to invalidate the user's session
           */
          clearSBAuthToken();
          return from([
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_PASSWORD_CHANGED_BY_RESET,
            }),
            commonActions.resetPasswordSuccess(),
            commonActions.pushHistory('/auth/signin'),
          ]);
        }),
        catchError((error) => {
          return from([alertBadRequest(error), commonActions.resetPasswordFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.resetPasswordFail(error));
    }),
  );
};

export const fetchInvitationEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.FETCH_INVITATION_REQUEST),
    mergeMap((action) => {
      const request = commonApi.fetchInvitation(action.payload.invite_hash);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess(response);
          }
          return from([commonActions.fetchInvitationSuccess(response)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.fetchInvitationFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.fetchInvitationFail(error));
    }),
  );
};

export const oauthGoogleEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.OAUTH_GOOGLE_REQUEST),
    mergeMap((action) => {
      const { id_token, state: stateString } = action.payload;
      const request = commonApi.oauthGoogle({
        idToken: id_token,
      });
      const state = stateString ? JSON.parse(stateString) : null;
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          const responses: any[] = [];
          if (response.code) {
            if (response.code === 'type.auth.google.user.not_exist') {
              responses.push(
                commonActions.pushHistory(`/auth/signup?sso_token=${response.token}&sso_type=google`, {
                  email: response.email,
                }),
              );
            }
            if (response.code === 'type.auth.google.success') {
              initSession(response.token);
              if (response.two_factor_registration_required) {
                responses.push(
                  commonActions.pushHistory(
                    `/auth/two_factor_registration${action.payload.next === '' ? '' : `?next=${action.payload.next}`}`,
                  ),
                  commonActions.signinSuccess(response),
                );
              } else if (response.two_factor_authentication_required) {
                responses.push(
                  commonActions.pushHistory(`/auth/two_factor${state ? `?next=${state.next}` : ''}`),
                  commonActions.signinSuccess({
                    ...response,
                    two_factor_authentication_required: true,
                  }),
                );
              } else {
                responses.push(commonActions.verifyAuthenticationRequest({ next: state ? state.next : '/' }));
              }
            }
          }
          return from(responses);
        }),
        catchError((error) => {
          return from([
            generateBadRequest(error),
            commonActions.oauthGoogleFail(error),
            commonActions.pushHistory('/auth/signin'),
          ]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.oauthGoogleFail(error));
    }),
  );
};

export const proveGreenLanternEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AuthenticationActionTypes.PROVE_GREEN_LANTERN_REQUEST),
    mergeMap((action) => {
      const request = commonApi.proveGreenLantern(action.payload);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          setSBAuthToken(response.token);
          const responses: any[] = [];
          responses.push(commonActions.authenticated(response), commonActions.pushHistory('/'));
          return from(responses);
        }),
        catchError((error) => {
          return from([
            generateBadRequest(error),
            commonActions.proveGreenLanternFail(error),
            commonActions.pushHistory('/auth/greenlantern'),
          ]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.proveGreenLanternFail(error));
    }),
  );
};
