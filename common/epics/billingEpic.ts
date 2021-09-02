import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, takeUntil, withLatestFrom } from 'rxjs/operators';

import { commonActions } from '@actions';
import { BillingActionTypes } from '@actions/types';
import { commonApi } from '@api';
import { generateBadRequest } from '@epics/generateBadRequest';
import { logException } from '@utils/logException';

export const fetchCardInfoEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(BillingActionTypes.FETCH_CARD_INFO_REQUEST),
    mergeMap((action) => {
      const request = commonApi.fetchCardInfo({
        organization_uid: action.payload.organization_uid,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((cardInfo) => {
          return from([commonActions.fetchCardInfoSuccess(cardInfo)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.fetchCardInfoFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.fetchCardInfoFail(error));
    }),
  );
};

export const saveBillingContactsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(BillingActionTypes.SAVE_BILLING_CONTACTS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const request = commonApi.updateOrganization(action.payload.organization_uid, {
        billing_email: JSON.stringify(action.payload.emails),
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((organization) => {
          return from([
            commonActions.updateOrganizationSuccess(organization),
            commonActions.saveBillingContactsSuccess(),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: state.intl.language.messages['alerts.billingContactsSaveComplete'],
            }),
          ]);
        }),
        takeUntil(
          action$.pipe(
            ofType(BillingActionTypes.SAVE_BILLING_CONTACTS_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error || ''), commonActions.saveBillingContactsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.saveBillingContactsFail(error));
    }),
  );
};
