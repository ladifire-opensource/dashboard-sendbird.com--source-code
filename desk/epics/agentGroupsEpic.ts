import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';

import { deskActions, commonActions } from '@actions';
import { AgentGroupActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { AGENT_GROUP_LIST_LIMIT } from '@constants';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchAgentGroupsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AgentGroupActionTypes.FETCH_AGENT_GROUPS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { offset = 0, limit = AGENT_GROUP_LIST_LIMIT, query } = action.payload;
      const request = deskApi.fetchAgentGroups(pid, region, {
        offset,
        limit,
        query,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            deskActions.fetchAgentGroupsSuccess({
              items: data.results,
              pagination: {
                offset,
                limit,
                count: data.count,
                page: offset / limit + 1,
              },
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchAgentGroupsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchAgentGroupsFail(error));
    }),
  );
};

export const fetchAgentGroupEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AgentGroupActionTypes.FETCH_AGENT_GROUP_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { groupId } = action.payload;
      const request = deskApi.fetchAgentGroup(pid, region, { groupId });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            deskActions.fetchAgentGroupSuccess({
              formItem: data,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchAgentGroupFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchAgentGroupsFail(error));
    }),
  );
};

export const fetchCurrentAgentsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AgentGroupActionTypes.FETCH_CURRENT_AGENTS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const request = deskApi.fetchAgents(pid, region, {
        offset: 0,
        limit: 200,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([deskActions.fetchCurrentAgentsSuccess({ agents: data.results })]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchAgentGroupsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchAgentGroupsFail(error));
    }),
  );
};

export const createAgentGroupEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AgentGroupActionTypes.CREATE_AGENT_GROUP_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { name, key, description, agents } = action.payload;
      const request = deskApi.createAgentGroup(pid, region, {
        name,
        key,
        description,
        agents,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return from([
            deskActions.resetAgentGroupFormItem(),
            commonActions.pushHistory(`/${app_id}/desk/settings/teams`),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.createAgentGroupFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createAgentGroupFail(error));
    }),
  );
};

export const updateAgentGroupEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AgentGroupActionTypes.UPDATE_AGENT_GROUP_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { groupId, name, description, agents } = action.payload;
      const request = deskApi.updateAgentGroup(pid, region, {
        groupId,
        name,
        description,
        agents,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return from([
            deskActions.resetAgentGroupFormItem(),
            commonActions.pushHistory(`/${app_id}/desk/settings/teams`),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.updateAgentGroupFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.updateAgentGroupFail(error));
    }),
  );
};

export const deleteAgentGroupEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(AgentGroupActionTypes.DELETE_AGENT_GROUP_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { groupId, transferTargetGroupId, needFetchList = false } = action.payload;
      const request = deskApi.deleteAgentGroup(pid, region, { groupId, transferTargetGroupId });

      const successActions: any[] = [deskActions.resetAgentGroupFormItem()];
      if (needFetchList) {
        successActions.push(deskActions.fetchAgentGroupsRequest({}));
      } else {
        successActions.push(commonActions.pushHistory(`/${app_id}/desk/settings/teams`));
      }

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return from(successActions);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.updateAgentGroupFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.updateAgentGroupFail(error));
    }),
  );
};
