import { ofType } from 'redux-observable';
import { of, from, iif } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { commonActions, deskActions } from '@actions';
import { DeskActionTypes } from '@actions/types';
import { deskApi, setDeskAPIToken } from '@api';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { isDeskEnabledApplication } from '@utils/isDeskEnabledApplication';
import { logException } from '@utils/logException';

export const deskAuthenticationEpic: SBEpicWithState<DeskAuthenticationRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(DeskActionTypes.DESK_AUTHENTICATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const {
        applicationState: { data: application },
        organizations: { current: organization },
        auth: {
          user: { email: userEmail },
        },
      } = state;
      const request = deskApi.deskAuthentication(pid, region, {
        dashboardToken: '',
        appId: application?.app_id || '',
      });
      const isDeskEnabled = (() => {
        if (application) {
          if (organization.is_self_serve) {
            return isDeskEnabledApplication(application);
          }
          return application.current_premium_features['desk'] || isDeskEnabledApplication(application);
        }
        return false;
      })();

      return iif(
        () => isDeskEnabled,
        from(request).pipe(
          map((response) => response.data),
          mergeMap((response) => {
            setDeskAPIToken(response.token);
            let refinedAgent;
            response.agents.forEach((agent) => {
              if (agent.project.sendbirdAppId === application?.app_id) {
                refinedAgent = agent;
              }
            });

            /**
             * FIXME:
             * Remove this email tweak when Desk back-end team fixes email sync delay issue.
             * https://sendbird.atlassian.net/browse/DESK-259
             *
             * ISSUE detail:
             * When a user updates his or her email, @var state.auth.user.email is updated
             * while @var state.desk.agent.email is remained as previous one because Desk server sync email every 3 minutes.
             *
             * Desk back-end engineer will work with Dashboard team to remove the delay later on.
             * You can remove the @var userEmail related codes once the back-end work is done.
             */
            const actions: any[] = [
              deskActions.deskAuthenticationSuccess({
                id: response.id,
                agent: { ...refinedAgent, email: userEmail },
              }),
            ];
            return from(actions);
          }),
          catchError((error) => {
            return from([
              generateBadRequest(error || ''),
              deskActions.deskAuthenticationFail(error || ''),
              commonActions.pushHistory(`/`),
            ]);
          }),
        ),
        from([commonActions.pushHistory(`/`)]),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.deskAuthenticationFail(error));
    }),
  );
};

export const updateProjectEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(DeskActionTypes.UPDATE_PROJECT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const { onSuccess, ...nextProject } = action.payload;
      const request = deskApi.updateProjectSetting(pid, region, { payload: nextProject });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((project) => {
          onSuccess && onSuccess();
          return from([
            deskActions.setDeskProject(project),
            deskActions.updateProjectSuccess(),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'desk.settings.message.updateProject.success' }),
            }),
          ]);
        }),
        takeUntil(
          action$.pipe(
            ofType(DeskActionTypes.UPDATE_PROJECT_CANCEL),
            mergeMap(() => {
              request['cancel']();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.updateProjectFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.updateProjectFail(error));
    }),
  );
};

export const updateOperationHoursEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(DeskActionTypes.UPDATE_OPERATION_HOURS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { onSuccess, ...operatingHourPayload } = action.payload;

      const request = deskApi.updateProjectSetting(pid, region, { payload: operatingHourPayload });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((project) => {
          onSuccess && onSuccess(project);
          return from([deskActions.setDeskProject(project), deskActions.updateOperationHoursSuccess()]);
        }),
        takeUntil(
          action$.pipe(
            ofType(DeskActionTypes.UPDATE_OPERATION_HOURS_CANCEL),
            mergeMap(() => {
              request['cancel']();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.updateOperationHoursFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.updateOperationHoursFail(error));
    }),
  );
};

export const fetchApiTokensEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(DeskActionTypes.FETCH_API_TOKENS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { offset, limit } = action.payload;

      const request = deskApi.fetchProjectApiKeys(pid, region, { offset, limit });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((apiTokens) =>
          from([deskActions.fetchApiTokensSuccess(apiTokens), deskActions.setApiTokenPagination({ offset, limit })]),
        ),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.fetchApiTokensFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchApiTokensFail(error));
    }),
  );
};

export const createApiTokenEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(DeskActionTypes.CREATE_API_TOKEN_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { payload } = action;

      const request = deskApi.createProjectApiKey(pid, region, { payload });
      return from(request).pipe(
        map((response) => response.data),
        withLatestFrom(state$),
        mergeMap(([, state]) => {
          const {
            pagination: { limit, count },
          } = state.desk.apiTokens;
          const offset = Math.floor((count + 1) / limit) * limit;
          return from([
            deskActions.createApiTokenSuccess(),
            deskActions.fetchApiTokensRequest({ limit, offset }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.createApiTokenFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createApiTokenFail(error));
    }),
  );
};

export const deleteApiTokenEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(DeskActionTypes.DELETE_API_TOKEN_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id, isLastItemOnPage } = action.payload;

      const request = deskApi.deleteProjectApiKey(pid, region, { id });
      return from(request).pipe(
        map((response) => response.data),
        withLatestFrom(state$),
        mergeMap(([, state]) => {
          const pagination = { ...state.desk.apiTokens.pagination };
          if (isLastItemOnPage) {
            pagination.offset = Math.max(0, pagination.offset - pagination.limit);
          }
          return from([deskActions.fetchApiTokensRequest(pagination)]);
        }),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.deleteApiTokenFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.deleteApiTokenFail(error));
    }),
  );
};
