import { ofType } from 'redux-observable';
import { from, of } from 'rxjs';
import { withLatestFrom, mergeMap, map, catchError } from 'rxjs/operators';

import { deskActions, commonActions } from '@actions';
import { CustomerFieldsActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { selectApplication_DEPRECATED } from '@selectors';

export const fetchCustomerFieldsEpic: SBEpicWithState<FetchCustomerFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { offset, limit } = action.payload;
      const request = deskApi.fetchCustomerFields(pid, region, { offset, limit });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ results, count }) => of(deskActions.fetchCustomerFieldsSuccess({ items: results, total: count }))),
        catchError((error) => of(deskActions.fetchCustomerFieldsFail(error))),
      );
    }),
  );

export const createCustomerFieldEpic: SBEpicWithState<CreateCustomerFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { label: name, key, fieldType: field_type, readOnly: read_only, options, description } = action.payload;
      const request = deskApi.createCustomerField(pid, region, {
        name,
        key,
        options,
        description,
        field_type,
        read_only,
      });

      return from(request).pipe(
        mergeMap(() =>
          from([
            deskActions.createCustomerFieldSuccess(),
            commonActions.pushHistory(`/${app_id}/desk/settings/customer-fields`),
          ]),
        ),
        catchError((error) => of(deskActions.createCustomerFieldFail(error))),
      );
    }),
  );

export const getCustomerFieldEpic: SBEpicWithState<GetCustomerFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id } = action.payload;
      const request = deskApi.getCustomerField(pid, region, { id });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((field) => of(deskActions.getCustomerFieldSuccess(field))),
        catchError((error) => of(deskActions.getCustomerFieldFail(error))),
      );
    }),
  );

export const updateCustomerFieldEpic: SBEpicWithState<UpdateCustomerFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { id, label: name, key, fieldType: field_type, readOnly: read_only, options, description } = action.payload;
      const request = deskApi.updateCustomerField(pid, region, {
        id,
        name,
        key,
        options,
        description,
        field_type,
        read_only,
      });

      return from(request).pipe(
        mergeMap(() =>
          from([
            deskActions.updateCustomerFieldSuccess(),
            commonActions.pushHistory(`/${app_id}/desk/settings/customer-fields`),
          ]),
        ),
        catchError((error) => of(deskActions.updateCustomerFieldFail(error))),
      );
    }),
  );

export const deleteCustomerFieldEpic: SBEpicWithState<DeleteCustomerFieldAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id } = action.payload;
      const request = deskApi.deleteCustomerField(pid, region, { id });

      return from(request).pipe(
        mergeMap(() => of(deskActions.deleteCustomerFieldSuccess(action.payload))),
        catchError((error) => of(deskActions.deleteCustomerFieldFail(error))),
      );
    }),
  );

export const checkCustomerFieldKeyValidationEpic: SBEpicWithState<CheckCustomerFieldKeyValidationAction> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { key } = action.payload;
      const request = deskApi.checkCustomerFieldKeyValidation(pid, region, { key });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((checkResult) => of(deskActions.checkCustomerFieldKeyValidationSuccess(checkResult))),
        catchError((error) => of(deskActions.checkCustomerFieldKeyValidationFail(error))),
      );
    }),
  );

export const getCustomerFieldDataListEpic: SBEpicWithState<GetCustomerFieldDataListAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id } = action.payload;
      const request = deskApi.getCustomerFieldDataList(pid, region, { id });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap(({ results }) => of(deskActions.getCustomerFieldDataListSuccess({ results }))),
        catchError((error) => of(deskActions.getCustomerFieldDataListFail(error))),
      );
    }),
  );

export const addCustomerFieldDataEpic: SBEpicWithState<AddCustomerFieldDataAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.ADD_CUSTOMER_FIELD_DATA_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id: customer, fieldId: customer_field, value } = action.payload;
      const request = deskApi.addCustomerFieldData(pid, region, { customer, customer_field, value });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => of(deskActions.addCustomerFieldDataSuccess(data))),
        catchError((error) => of(deskActions.addCustomerFieldDataFail(error))),
      );
    }),
  );

export const updateCustomerFieldDataEpic: SBEpicWithState<UpdateCustomerFieldDataAction> = (action$, state$) =>
  action$.pipe(
    ofType(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_DATA_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id, value } = action.payload;
      const request = deskApi.updateCustomerFieldData(pid, region, { id, value });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => of(deskActions.updateCustomerFieldDataSuccess(data))),
        catchError((error) => of(deskActions.updateCustomerFieldDataFail(error))),
      );
    }),
  );
