import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, catchError, withLatestFrom, map } from 'rxjs/operators';

import { commonActions } from '@actions';
import { AccountActionTypes } from '@actions/types';
import { setSBAuthToken, commonApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { generateBadRequest } from '@epics/generateBadRequest';
import { logException } from '@utils/logException';
import { ALERT_PASSWORD_CHANGED } from '@utils/text';

export const changePasswordEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType<ReturnType<typeof commonActions.changePasswordRequest>>(AccountActionTypes.CHANGE_PASSWORD_REQUEST),
    mergeMap((action) => {
      const request = commonApi.changePassword(action.payload);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((result) => {
          setSBAuthToken(result.token);
          return from([
            commonActions.changePasswordSuccess(result),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_PASSWORD_CHANGED,
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.changePasswordFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.changePasswordFail(error));
    }),
  );
};

export const changeEmailEpic: SBEpic<ChangeEmailAction> = (action$) => {
  return action$.pipe(
    ofType(AccountActionTypes.CHANGE_EMAIL_REQUEST),
    mergeMap((action) => {
      const request = commonApi.changeEmail({
        email: action.payload.email,
        password: action.payload.password,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            commonActions.changeEmailSuccess({ newEmail: data.new_email }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        // TODO: error typing
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.changeEmailFail(error)]);
        }),
      );
    }),
  );
};

export const isAbleToUnregisterEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AccountActionTypes.IS_ABLE_TO_UNREGISTER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const currentOrganization = state.organizations.current;
      const request = commonApi.isAbleToUnregister();
      return from(request).pipe(
        mergeMap((response) => {
          const dialogProps = response.data.organizations.find((org) => org.uid === currentOrganization.uid);
          return from([
            commonActions.unregisterSuccess(),
            commonActions.showDialogsRequest({
              dialogTypes: DialogType.DeleteAccount,
              dialogProps,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.isAbleToUnregisterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.isAbleToUnregisterFail(error));
    }),
  );
};

export const unregisterEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AccountActionTypes.UNREGISTER_REQUEST),
    mergeMap((action) => {
      const request = commonApi.unregister(action.payload.password);
      return from(request).pipe(
        mergeMap(() => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess();
          }
          return from([commonActions.unregisterSuccess()]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.unregisterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.unregisterFail(error));
    }),
  );
};

export const turnoffGoogleAuthenticatorEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(AccountActionTypes.TURNOFF_GOOGLE_AUTHENTICATOR_REQUEST),
    mergeMap(() => {
      const request = commonApi.turnoffTwoFactor();
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          return from([
            commonActions.turnoffGoogleAuthenticatorSuccess(response),
            commonActions.setTwoFactorAuthentication({
              two_factor_authentication: false,
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.turnoffGoogleAuthenticatorFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.turnoffGoogleAuthenticatorFail(error));
    }),
  );
};
