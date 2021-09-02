import { ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { withLatestFrom, mergeMap, map, catchError } from 'rxjs/operators';

import { deskActions, commonActions } from '@actions';
import { TicketFieldsActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchTicketFieldsEpic: SBEpicWithState<FetchTicketFieldAction> = (action$, state$) => {
  return action$.pipe(
    ofType(TicketFieldsActionTypes.FETCH_TICKET_FIELDS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { offset, limit } = action.payload;
      const request = deskApi.fetchTicketFields(pid, region, { offset, limit });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ results, count }) =>
          from([deskActions.fetchTicketFieldsSuccess({ items: results, total: count })]),
        ),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.fetchTicketFieldsFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTicketFieldsFail(error));
    }),
  );
};

export const createTicketFieldEpic: SBEpicWithState<CreateTicketFieldAction> = (action$, state$) => {
  return action$.pipe(
    ofType(TicketFieldsActionTypes.CREATE_TICKET_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { label: name, key, description, fieldType: field_type, readOnly: read_only, options } = action.payload;
      const request = deskApi.createTicketField(pid, region, {
        name,
        key,
        description,
        field_type,
        read_only,
        options,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => from([commonActions.pushHistory(`/${app_id}/desk/settings/ticket-fields`)])),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.createTicketFieldFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createTicketFieldFail(error));
    }),
  );
};

export const deleteTicketFieldEpic: SBEpicWithState<DeleteTicketFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.DELETE_TICKET_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id } = action.payload;
      const request = deskApi.deleteTicketField(pid, region, { id });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) =>
          from([
            deskActions.deleteTicketFieldSuccess(data),
            deskActions.fetchTicketFieldsRequest({ offset: 0, limit: 20 }),
          ]),
        ),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.deleteTicketFieldFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.deleteTicketFieldFail(error));
    }),
  );

export const getTicketFieldEpic: SBEpicWithState<GetTicketFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.GET_TICKET_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id } = action.payload;
      const request = deskApi.getTicketField(pid, region, { id });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => from([deskActions.getTicketFieldSuccess(data)])),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.getTicketFieldFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.getTicketFieldFail(error));
    }),
  );

export const updateTicketFieldEpic: SBEpicWithState<UpdateTicketFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { id, label: name, key, description, fieldType: field_type, readOnly: read_only, options } = action.payload;
      const request = deskApi.updateTicketField(pid, region, {
        id,
        name,
        key,
        field_type,
        read_only,
        description,
        options,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) =>
          from([
            // FIXME: sync with other code
            deskActions.getTicketFieldSuccess(data),
            commonActions.pushHistory(`/${app_id}/desk/settings/ticket-fields`),
          ]),
        ),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.updateTicketFieldFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.updateTicketFieldFail(error));
    }),
  );

export const getTicketFieldDataListEpic: SBEpicWithState<GetTicketFieldDataAction> = (action$, state$) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id } = action.payload;
      const request = deskApi.getTicketFieldDataList(pid, region, { id });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => from([deskActions.getTicketFieldDataListSuccess(data)])),
        catchError((error) =>
          from([generateBadRequest(error || ''), deskActions.getTicketFieldDataListFail(error || '')]),
        ),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.getTicketFieldDataListFail(error));
    }),
  );

export const addTicketFieldDataEpic: SBEpicWithState<AddTicketFieldDataAction> = (action$, state$) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.ADD_TICKET_FIELD_DATA_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id: ticket, fieldId: ticket_field, value } = action.payload;
      const request = deskApi.addTicketFieldData(pid, region, { ticket, ticket_field, value });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => from([deskActions.addTicketFieldDataSuccess(data)])),
        catchError((error) => from([generateBadRequest(error || ''), deskActions.addTicketFieldDataFail(error || '')])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.addTicketFieldDataFail(error));
    }),
  );

export const updateTicketFieldDataEpic: SBEpicWithState<UpdateTicketFieldDataAction> = (action$, state$) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_DATA_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id, value } = action.payload;
      const request = deskApi.updateTicketFieldData(pid, region, { id, value });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => from([deskActions.updateTicketFieldDataSuccess(data)])),
        catchError((error) =>
          from([generateBadRequest(error || ''), deskActions.updateTicketFieldDataFail(error || '')]),
        ),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.updateTicketFieldDataFail(error));
    }),
  );

export const checkTicketFieldKeyValidationEpic: SBEpicWithState<CheckTicketFieldKeyValidationAction> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType(TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { key } = action.payload;
      const payload: CheckTicketFieldKeyValidationAPIPayload = { key: key.trim() };
      const request = deskApi.checkTicketFieldKeyValidation(pid, region, payload);

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => from([deskActions.checkTicketFieldKeyValidationSuccess(data)])),
        catchError((error) =>
          from([generateBadRequest(error || ''), deskActions.checkTicketFieldKeyValidationFail(error || '')]),
        ),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.checkTicketFieldKeyValidationFail(error));
    }),
  );
