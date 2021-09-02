import { ofType } from 'redux-observable';
import { from, forkJoin } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';

import { deskActions, commonActions } from '@actions';
import { IntegrationsActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { generateBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const facebookAddPagesEpic: SBEpicWithState<FacebookAddPagesAction> = (action$, state$) => {
  return action$.pipe(
    ofType(IntegrationsActionTypes.FACEBOOK_ADD_PAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { accessToken, onSuccessNavigateTo } = action.payload;

      const request = deskApi.facebookLoadPages(pid, region, { accessToken });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((facebookPages) => {
          if (facebookPages.length === 0) {
            return from([
              deskActions.facebookAddPagesSuccess({ facebookPages }),
              commonActions.addNotificationsRequest({
                status: 'warning',
                message: 'No page loaded.',
              }),
            ]);
          }
          const promiseArray = facebookPages.map((page) =>
            deskApi.facebookSubscribe(pid, region, { page_id: page.pageId }),
          );
          return forkJoin(promiseArray).pipe(
            mergeMap((response) => {
              const facebookPages = response.map((res: any) => res.data);
              return from([
                deskActions.facebookAddPagesSuccess({ facebookPages }),
                ...(onSuccessNavigateTo ? [commonActions.pushHistory(onSuccessNavigateTo)] : []),
                commonActions.addNotificationsRequest({
                  status: 'success',
                  message: window.intl.formatMessage({ id: 'desk.settings.integration.facebook.noti.add.success' }),
                }),
              ]);
            }),
            catchError((error) => {
              return from([generateBadRequest(error), deskActions.facebookAddPagesFail()]);
            }),
          );
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.facebookAddPagesFail()]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([deskActions.facebookAddPagesFail()]);
    }),
  );
};

export const facebookLoadPagesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(IntegrationsActionTypes.FACEBOOK_LOAD_PAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { accessToken, subscribeImmediately = false } = action.payload;

      const request = deskApi.facebookLoadPages(pid, region, { accessToken });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((facebookPages) => {
          return from([
            deskActions.facebookLoadPagesSuccess({ facebookPages }),
            ...(subscribeImmediately ? [deskActions.facebookSubscribeRequest({ facebookPages })] : []),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.facebookLoadPagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([deskActions.facebookLoadPagesFail(error)]);
    }),
  );
};

export const facebookSubscribeEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const promiseArray = action.payload.facebookPages.map((page) => {
        return from(deskApi.facebookSubscribe(pid, region, { page_id: page.pageId }));
      });
      return forkJoin(promiseArray).pipe(
        mergeMap((response) => {
          const facebookPages = response.map((res: any) => {
            return res.data;
          });
          return from([
            deskActions.facebookSubscribeSuccess({ facebookPages }),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: 'Selected pages are successfully subscribed.',
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.facebookSubscribeFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([deskActions.facebookSubscribeFail(error)]);
    }),
  );
};

export const facebookUnsubscribeEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      return from(
        deskApi.facebookUnsubscribe(pid, region, {
          page_id: action.payload.facebookPage.pageId,
        }),
      ).pipe(
        map((response) => response.data),
        mergeMap((facebookPage) => {
          return from([
            deskActions.facebookUnsubscribeSuccess({ facebookPage }),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'desk.settings.integration.facebook.noti.remove.success' }),
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.facebookUnsubscribeFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([deskActions.facebookUnsubscribeFail(error)]);
    }),
  );
};

export const facebookActivePagesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      return from(deskApi.facebookActivePages(pid, region)).pipe(
        map((response) => response.data.results),
        mergeMap((facebookPages) => {
          return from([deskActions.facebookActivePagesSuccess({ facebookPages })]);
        }),
        catchError((error) => {
          return from([deskActions.facebookActivePagesFail(getErrorMessage(error))]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([deskActions.facebookActivePagesFail(getErrorMessage(error))]);
    }),
  );
};

export const facebookUpdatePageSettingsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const { facebookPage } = action.payload;

      return from(
        deskApi.facebookUpdatePageSettings(pid, region, {
          pageId: facebookPage.pageId,
          payload: {
            isConversationEnabled: facebookPage.isConversationEnabled,
            isFeedEnabled: facebookPage.isFeedEnabled,
          },
        }),
      ).pipe(
        map((response) => response.data),
        mergeMap((facebookPage) => {
          return from([
            deskActions.facebookUpdatePageSettingsSuccess({ facebookPage }),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'desk.settings.integration.facebook.noti.update.success' }),
            }),
            commonActions.pushHistory(window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'))),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.facebookUpdatePageSettingsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([deskActions.facebookUpdatePageSettingsFail(error)]);
    }),
  );
};
