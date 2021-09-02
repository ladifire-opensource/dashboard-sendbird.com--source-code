import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { commonActions, coreActions } from '@actions';
import { SDKUserActionTypes } from '@actions/types';
import { fetchSDKUser, createSDKUser, updateSDKUser } from '@core/api';
import { getErrorMessage } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchSDKUserEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SDKUserActionTypes.FETCH_SDK_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = fetchSDKUser({ appId });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([coreActions.fetchSDKUserSuccess(data.sdk_user)]);
        }),
        takeUntil(
          action$.pipe(
            ofType(SDKUserActionTypes.FETCH_SDK_USER_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([coreActions.fetchSDKUserFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchSDKUserFail(error)]);
    }),
  );
};

export const createSDKUserEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SDKUserActionTypes.CREATE_SDK_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = createSDKUser({
        appId,
        data: action.payload.data,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((sdkUser) => {
          return from([coreActions.createSDKUserSuccess(sdkUser), commonActions.hideDialogsRequest()]);
        }),
        catchError((error) => {
          if (error?.status === 403) {
            return of(
              coreActions.createSDKUserFail(
                window.intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.error.permissionDenied' }),
              ),
            );
          }

          if (error?.status === 400 && error.data?.code === 'gate400102' && error.data?.message) {
            return of(
              coreActions.createSDKUserFail(
                window.intl.formatMessage(
                  { id: 'chat.moderation.createModeratorDialog.error.withReason' },
                  { reason: error.data.message },
                ),
              ),
            );
          }

          if (error?.status === 400 || error?.status === 500) {
            return of(
              coreActions.createSDKUserFail(
                window.intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.error.general' }),
              ),
            );
          }

          return of(coreActions.createSDKUserFail(getErrorMessage(error)));
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.createSDKUserFail(getErrorMessage(error))]);
    }),
  );
};

export const updateSDKUserEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SDKUserActionTypes.UPDATE_SDK_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = updateSDKUser({
        appId,
        userId: action.payload.userId,
        data: action.payload.data,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((sdkUser) => {
          if (window.dashboardSB) {
            window.dashboardSB.updateCurrentUserInfo(sdkUser.nickname, sdkUser.profile_url, () => {
              return false;
            });
          }
          return from([coreActions.updateSDKUserSuccess(sdkUser), commonActions.hideDialogsRequest()]);
        }),
        catchError((error) => {
          return from([coreActions.updateSDKUserFail(getErrorMessage(error))]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.updateSDKUserFail(getErrorMessage(error))]);
    }),
  );
};
