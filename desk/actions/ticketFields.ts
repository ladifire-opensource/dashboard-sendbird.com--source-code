import { createAction } from '@actions/createAction';
import { TicketFieldsActionTypes } from '@actions/types';

export const TicketFieldsActions: TicketFieldsActionCreators = {
  fetchTicketFieldsRequest: (payload) => createAction(TicketFieldsActionTypes.FETCH_TICKET_FIELDS_REQUEST, payload),
  fetchTicketFieldsSuccess: (payload) => createAction(TicketFieldsActionTypes.FETCH_TICKET_FIELDS_SUCCESS, payload),
  fetchTicketFieldsFail: (payload) => createAction(TicketFieldsActionTypes.FETCH_TICKET_FIELDS_FAIL, payload),

  createTicketFieldRequest: (payload) => createAction(TicketFieldsActionTypes.CREATE_TICKET_FIELD_REQUEST, payload),
  createTicketFieldSuccess: () => createAction(TicketFieldsActionTypes.CREATE_TICKET_FIELD_SUCCESS),
  createTicketFieldFail: (payload) => createAction(TicketFieldsActionTypes.CREATE_TICKET_FIELD_FAIL, payload),

  updateTicketFieldRequest: (payload) => createAction(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_REQUEST, payload),
  updateTicketFieldSuccess: (payload) => createAction(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_SUCCESS, payload),
  updateTicketFieldFail: (payload) => createAction(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_FAIL, payload),

  deleteTicketFieldRequest: (payload) => createAction(TicketFieldsActionTypes.DELETE_TICKET_FIELD_REQUEST, payload),
  deleteTicketFieldSuccess: (payload) => createAction(TicketFieldsActionTypes.DELETE_TICKET_FIELD_SUCCESS, payload),
  deleteTicketFieldFail: (payload) => createAction(TicketFieldsActionTypes.DELETE_TICKET_FIELD_FAIL, payload),

  getTicketFieldRequest: (payload) => createAction(TicketFieldsActionTypes.GET_TICKET_FIELD_REQUEST, payload),
  getTicketFieldSuccess: (payload) => createAction(TicketFieldsActionTypes.GET_TICKET_FIELD_SUCCESS, payload),
  getTicketFieldFail: (payload) => createAction(TicketFieldsActionTypes.GET_TICKET_FIELD_FAIL, payload),

  addTicketFieldDataRequest: (payload) => createAction(TicketFieldsActionTypes.ADD_TICKET_FIELD_DATA_REQUEST, payload),
  addTicketFieldDataSuccess: (payload) => createAction(TicketFieldsActionTypes.ADD_TICKET_FIELD_DATA_SUCCESS, payload),
  addTicketFieldDataFail: (payload) => createAction(TicketFieldsActionTypes.ADD_TICKET_FIELD_DATA_FAIL, payload),

  getTicketFieldDataListRequest: (payload) =>
    createAction(TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_REQUEST, payload),
  getTicketFieldDataListSuccess: (payload) =>
    createAction(TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_SUCCESS, payload),
  getTicketFieldDataListFail: (payload) =>
    createAction(TicketFieldsActionTypes.GET_TICKET_FIELD_DATA_LIST_FAIL, payload),

  updateTicketFieldDataRequest: (payload) =>
    createAction(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_DATA_REQUEST, payload),
  updateTicketFieldDataSuccess: (payload) =>
    createAction(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_DATA_SUCCESS, payload),
  updateTicketFieldDataFail: (payload) => createAction(TicketFieldsActionTypes.UPDATE_TICKET_FIELD_DATA_FAIL, payload),

  checkTicketFieldKeyValidationRequest: (payload) =>
    createAction(TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_REQUEST, payload),
  checkTicketFieldKeyValidationSuccess: (payload) =>
    createAction(TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_SUCCESS, payload),
  checkTicketFieldKeyValidationFail: (payload) =>
    createAction(TicketFieldsActionTypes.CHECK_TICKET_FIELD_KEY_VALIDATION_FAIL, payload),

  setCheckingStatusTicketFieldKeyValidation: (payload) =>
    createAction(TicketFieldsActionTypes.SET_CHECKING_STATUS_TICKET_FIELD_KEY_VALIDATION, payload),
};
