import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { commonActions, coreActions, deskActions } from '@actions';
import { ApplicationActionTypes } from '@actions/types';
import { coreApi } from '@api';
import { generateBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';
import { ALERT_APPLICATION_NAME_CHANGED } from '@utils/text';

export const resetApplicationEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(ApplicationActionTypes.RESET_APPLICATION_REQUEST),
    mergeMap(() => {
      return from([commonActions.sbDisconnectRequest(), coreActions.resetApplicationSuccess()]);
    }),
  );
};

export const changeApplicationEpic: SBEpic<ChangeApplicationAction> = (action$) => {
  return action$.pipe(
    ofType(ApplicationActionTypes.CHANGE_APPLICATION_REQUEST),
    mergeMap((action) => {
      return from([
        coreActions.resetApplicationRequest(),
        deskActions.resetDesk(),
        commonActions.pushHistory(`/${action.payload.app_id}`, { applicationSummary: action.payload }),
      ]);
    }),
    catchError((error) => {
      logException({ error });
      return from([]);
    }),
  );
};

export const changeAppNameEpic: SBEpic<ChangeAppNameRequestAction> = (action$) => {
  return action$.pipe(
    ofType(ApplicationActionTypes.CHANGE_APP_NAME_REQUEST),
    mergeMap((action) => {
      const { app_id, app_name, onSuccess } = action.payload;
      if (app_name.length === 0) {
        const error = new Error(window.intl.formatMessage({ id: 'core.settings.general.app.error_required' }));
        return from([generateBadRequest(error), coreActions.changeAppNameFail(error)]);
      }
      if (app_name.length > 128) {
        const error = new Error(window.intl.formatMessage({ id: 'core.settings.general.app.error_limit' }));
        return from([generateBadRequest(error), coreActions.changeAppNameFail(error)]);
      }

      const request = coreApi.changeAppName({
        appId: app_id,
        appName: app_name,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          onSuccess && onSuccess();
          toast.success({ message: ALERT_APPLICATION_NAME_CHANGED });

          return from([
            coreActions.changeAppNameSuccess({ app_id, app_name: response.app_name }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.changeAppNameFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.changeAppNameFail(error));
    }),
  );
};

export const getAPITokenEpic: SBEpicWithState<GetAPITokenAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ApplicationActionTypes.GET_API_TOKEN_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { app_id: appId } = selectApplication_DEPRECATED(state);
      const request = coreApi.getAPIToken({
        appId,
        password: action.payload.password,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess(response.api_token);
          }
          return from([commonActions.hideDialogsRequest()]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.getAPITokenFail()]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.getAPITokenFail());
    }),
  );
};

export const fetchApplicationEpic: SBEpic<FetchApplicationRequestAction | FetchApplicationCancelAction> = (action$) =>
  action$.pipe(
    ofType<FetchApplicationRequestAction>(ApplicationActionTypes.FETCH_APPLICATION_REQUEST),
    mergeMap((action) => {
      const { app_id } = action.payload;
      const request = coreApi.getApplication({ app_id });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((application) => from([coreActions.fetchApplicationSuccess(application)])),
        takeUntil(
          action$.pipe(
            ofType(ApplicationActionTypes.FETCH_APPLICATION_CANCEL),
            mergeMap(() => {
              request.cancel();
              return from([]);
            }),
          ),
        ),
        catchError((error) => {
          const message = getErrorMessage(error);
          toast.error({ message });
          return from([coreActions.fetchApplicationFail(message), commonActions.pushHistory('/')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      const message = getErrorMessage(error);
      toast.error({ message });
      return from([coreActions.fetchApplicationFail(message), commonActions.pushHistory('/')]);
    }),
  );
