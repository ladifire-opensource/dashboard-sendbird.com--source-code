import { StateObservable, ofType } from 'redux-observable';
import { from, Observable, of } from 'rxjs';
import { mergeMap, withLatestFrom, map, catchError } from 'rxjs/operators';

import { deskActions, commonActions } from '@actions';
import { WebhooksActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { selectApplication_DEPRECATED } from '@selectors';

export const addWebhookEpic = (action$: Observable<AddWebhookAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    ofType(WebhooksActionTypes.ADD_WEBHOOK_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { endpointUrl, signature } = action.payload;
      let payload;

      if (signature) {
        payload = {
          endpointUrl,
          signature,
        };
      } else {
        payload = {
          endpointUrl,
        };
      }

      const request = deskApi.addWebhooks(pid, region, payload);

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return of(deskActions.addWebhookSuccess({}));
        }),
        catchError((error) => {
          return of(deskActions.addWebhookFail(error.data.detail));
        }),
      );
    }),
  );
};

export const fetchWebhooksEpic = (action$: Observable<FetchWebhooksAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    ofType(WebhooksActionTypes.FETCH_WEBHOOKS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.fetchWebhooks(pid, region);

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((webhooks) => {
          return of(deskActions.fetchWebhooksSuccess(webhooks.results));
        }),
        catchError((error) => {
          return of(deskActions.fetchWebhooksFail(error));
        }),
      );
    }),
  );
};

export const editWebhookEpic = (action$: Observable<EditWebhookAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    ofType(WebhooksActionTypes.EDIT_WEBHOOK_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.editWebhook(pid, region, action.payload);

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return of(deskActions.editWebhookSuccess());
        }),
        catchError((error) => {
          commonActions.addNotificationsRequest({
            status: 'success',
            message: '',
          });
          return of(deskActions.editWebhookFail(error.data.detail));
        }),
      );
    }),
  );
};

export const getSignatureEpic = (action$: Observable<GetSignatureAction>, state$: StateObservable<RootState>) => {
  return action$.pipe(
    ofType(WebhooksActionTypes.GET_SIGNATURE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.getWebhookSignature(pid, region, action.payload);

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return of(deskActions.getSignatureSuccess(data.signature));
        }),
        catchError((error) => {
          return of(deskActions.getSignatureFail(error));
        }),
      );
    }),
  );
};
