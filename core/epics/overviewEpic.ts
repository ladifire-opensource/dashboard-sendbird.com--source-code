import { ofType } from 'redux-observable';
import { forkJoin, from } from 'rxjs';
import { map, mergeMap, catchError, withLatestFrom } from 'rxjs/operators';

import { coreActions } from '@actions';
import { OverviewActionTypes } from '@actions/types';
import { coreApi } from '@api';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchStatisticsMAU: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OverviewActionTypes.FETCH_MAU_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = coreApi.fetchMAU({
        appId,
        payload: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ mau_list }) => {
          return from([coreActions.fetchMAUSuccess(mau_list)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchMAUFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchMAUFail(error)]);
    }),
  );
};

export const fetchStatisticsDAU: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OverviewActionTypes.FETCH_DAU_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = coreApi.fetchDAU({
        appId,
        payload: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ dau_list }) => {
          return from([coreActions.fetchDAUSuccess(dau_list)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchDAUFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchDAUFail(error)]);
    }),
  );
};

export const fetchStatisticsMesagesCount: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OverviewActionTypes.FETCH_MESSAGES_COUNT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = coreApi.fetchMessagesCount({
        appId,
        payload: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ message_count }) => {
          return from([coreActions.fetchMessagesCountSuccess(message_count)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchMessagesCountFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchMessagesCountFail(error)]);
    }),
  );
};

export const fetchStatisticsMonthlyCCU: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OverviewActionTypes.FETCH_MONTHLY_CCU_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;
      const promiseArray = action.payload.map((payload) => {
        return from(
          coreApi.fetchMonthlyCCU({
            appId,
            payload,
          }),
        );
      });
      return forkJoin(promiseArray).pipe(
        map((response) => {
          const peak_connections = response.reduce((prev: PeakConnection[], { data }) => {
            return [...prev, ...data.peak_connections];
          }, []);
          return {
            peak_connections,
          };
        }),
        mergeMap(({ peak_connections }) => {
          return from([coreActions.fetchMonthlyCCUSuccess(peak_connections)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchMonthlyCCUFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchMonthlyCCUFail(error)]);
    }),
  );
};

export const fetchStatisticsDailyCCU: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OverviewActionTypes.FETCH_DAILY_CCU_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;
      const promiseArray = action.payload.map((payload) => {
        return from(
          coreApi.fetchDailyCCU({
            appId,
            payload,
          }),
        );
      });
      return forkJoin(promiseArray).pipe(
        map((response) => {
          const peak_connections = response.reduce((prev: PeakConnection[], { data }) => {
            return [...prev, ...data.peak_connections];
          }, []);
          return {
            peak_connections,
          };
        }),
        mergeMap(({ peak_connections }) => {
          return from([coreActions.fetchDailyCCUSuccess(peak_connections)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchDailyCCUFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchDailyCCUFail(error)]);
    }),
  );
};

export const fetchHourlyCCU: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(OverviewActionTypes.FETCH_HOURLY_CCU_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;
      const request = coreApi.fetchHourlyCCU({
        appId,
        date: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ hourly_peak_ccu }) => {
          return from([
            coreActions.fetchHourlyCCUSuccess({
              date: action.payload,
              statistics: hourly_peak_ccu,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchHourlyCCUFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([coreActions.fetchHourlyCCUFail(error)]);
    }),
  );
};
