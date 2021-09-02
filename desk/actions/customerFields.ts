import { createAction } from '@actions/createAction';
import { CustomerFieldsActionTypes } from '@actions/types';

export const CustomerFieldsActions: CustomerFieldsActionCreators = {
  createCustomerFieldRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_REQUEST, payload),
  createCustomerFieldSuccess: () => createAction(CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_SUCCESS),
  createCustomerFieldFail: (payload) => createAction(CustomerFieldsActionTypes.CREATE_CUSTOMER_FIELD_FAIL, payload),

  fetchCustomerFieldsRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_REQUEST, payload),
  fetchCustomerFieldsSuccess: (payload) =>
    createAction(CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_SUCCESS, payload),
  fetchCustomerFieldsFail: (payload) => createAction(CustomerFieldsActionTypes.FETCH_CUSTOMER_FIELDS_FAIL, payload),

  getCustomerFieldRequest: (payload) => createAction(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_REQUEST, payload),
  getCustomerFieldSuccess: (payload) => createAction(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_SUCCESS, payload),
  getCustomerFieldFail: (payload) => createAction(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_FAIL, payload),

  checkCustomerFieldKeyValidationRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_REQUEST, payload),
  checkCustomerFieldKeyValidationSuccess: (payload) =>
    createAction(CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_SUCCESS, payload),
  checkCustomerFieldKeyValidationFail: (payload) =>
    createAction(CustomerFieldsActionTypes.CHECK_CUSTOMER_FIELD_KEY_VALIDATION_FAIL, payload),

  updateCustomerFieldRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_REQUEST, payload),
  updateCustomerFieldSuccess: () => createAction(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_SUCCESS),
  updateCustomerFieldFail: (payload) => createAction(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_FAIL, payload),

  deleteCustomerFieldRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_REQUEST, payload),
  deleteCustomerFieldSuccess: (payload) =>
    createAction(CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_SUCCESS, payload),
  deleteCustomerFieldFail: (payload) => createAction(CustomerFieldsActionTypes.DELETE_CUSTOMER_FIELD_FAIL, payload),

  addCustomerFieldDataRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.ADD_CUSTOMER_FIELD_DATA_REQUEST, payload),
  addCustomerFieldDataSuccess: (payload) =>
    createAction(CustomerFieldsActionTypes.ADD_CUSTOMER_FIELD_DATA_SUCCESS, payload),
  addCustomerFieldDataFail: (payload) => createAction(CustomerFieldsActionTypes.ADD_CUSTOMER_FIELD_DATA_FAIL, payload),

  getCustomerFieldDataListRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_REQUEST, payload),
  getCustomerFieldDataListSuccess: (payload) =>
    createAction(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_SUCCESS, payload),
  getCustomerFieldDataListFail: (payload) =>
    createAction(CustomerFieldsActionTypes.GET_CUSTOMER_FIELD_DATA_LIST_FAIL, payload),

  updateCustomerFieldDataRequest: (payload) =>
    createAction(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_DATA_REQUEST, payload),
  updateCustomerFieldDataSuccess: (payload) =>
    createAction(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_DATA_SUCCESS, payload),
  updateCustomerFieldDataFail: (payload) =>
    createAction(CustomerFieldsActionTypes.UPDATE_CUSTOMER_FIELD_DATA_FAIL, payload),

  setCheckingStatusCustomerFieldKeyValidation: (payload) =>
    createAction(CustomerFieldsActionTypes.SET_CHECKING_STATUS_CUSTOMER_FIELD_KEY_VALIDATION, payload),
};
