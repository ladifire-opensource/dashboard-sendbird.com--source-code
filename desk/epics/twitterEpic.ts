import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { deskActions } from '@actions';
import { TwitterActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchTwitterUserDetailEpic: SBEpicWithState = (action$, state$) =>
  action$.pipe(
    ofType<FetchTwitterUserDetailRequestAction>(TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.fetchTwitterUser(pid, region, {
        agentTwitterUserId: action.payload.agentTwitterUserId,
        customerTwitterUserId: action.payload.customerTwitterUserId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((twitterUserDetail) => {
          return from([deskActions.fetchTwitterUserDetailSuccess(twitterUserDetail)]);
        }),
        takeUntil(
          action$.pipe(
            ofType<FetchTwitterUserDetailCancelAction>(TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchTwitterUserDetailFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTwitterUserDetailFail(error));
    }),
  );

export const followTwitterUserEpic: SBEpicWithState = (action$, state$) =>
  action$.pipe(
    ofType<FollowTwitterUserRequestAction>(TwitterActionTypes.FOLLOW_TWITTER_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.followTwitterUser(pid, region, {
        agentTwitterUserId: action.payload.agentTwitterUserId,
        customerTwitterUserId: action.payload.customerTwitterUserId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((twitterUserDetail) => {
          return from([deskActions.followTwitterUserSuccess(twitterUserDetail)]);
        }),
        takeUntil(
          action$.pipe(
            ofType<FollowTwitterUserCancelAction>(TwitterActionTypes.FOLLOW_TWITTER_USER_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.followTwitterUserFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.followTwitterUserFail(error));
    }),
  );

export const unfollowTwitterUserEpic: SBEpicWithState = (action$, state$) =>
  action$.pipe(
    ofType<UnfollowTwitterUserRequestAction>(TwitterActionTypes.UNFOLLOW_TWITTER_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.unfollowTwitterUser(pid, region, {
        agentTwitterUserId: action.payload.agentTwitterUserId,
        customerTwitterUserId: action.payload.customerTwitterUserId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((twitterUserDetail) => {
          return from([deskActions.unfollowTwitterUserSuccess(twitterUserDetail)]);
        }),
        takeUntil(
          action$.pipe(
            ofType<UnfollowTwitterUserCancelAction>(TwitterActionTypes.UNFOLLOW_TWITTER_USER_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.unfollowTwitterUserFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.unfollowTwitterUserFail(error));
    }),
  );
