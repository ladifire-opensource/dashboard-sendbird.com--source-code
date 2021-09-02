import { createAction } from '@actions/createAction';
import { DeskActionTypes } from '@actions/types';

export const DeskActions: DeskActionCreators = {
  deskAuthenticationRequest: (payload) => createAction(DeskActionTypes.DESK_AUTHENTICATION_REQUEST, payload),
  deskAuthenticationSuccess: (payload) => createAction(DeskActionTypes.DESK_AUTHENTICATION_SUCCESS, payload),
  deskAuthenticationFail: (payload) => createAction(DeskActionTypes.DESK_AUTHENTICATION_FAIL, payload),

  fetchProjectRequest: () => createAction(DeskActionTypes.FETCH_PROJECT_REQUEST),
  fetchProjectSuccess: (payload) => createAction(DeskActionTypes.FETCH_PROJECT_SUCCESS, payload),
  fetchProjectFail: (payload) => createAction(DeskActionTypes.FETCH_PROJECT_FAIL, payload),
  fetchProjectCancel: () => createAction(DeskActionTypes.FETCH_PROJECT_CANCEL),

  updateProjectRequest: (payload) => createAction(DeskActionTypes.UPDATE_PROJECT_REQUEST, payload),
  updateProjectSuccess: () => createAction(DeskActionTypes.UPDATE_PROJECT_SUCCESS),
  updateProjectFail: (payload) => createAction(DeskActionTypes.UPDATE_PROJECT_FAIL, payload),
  updateProjectCancel: () => createAction(DeskActionTypes.UPDATE_PROJECT_CANCEL),

  initializeDateFilters: () => createAction(DeskActionTypes.INITIALIZE_DATE_FILTERS),

  updateOperationHoursRequest: (payload) => createAction(DeskActionTypes.UPDATE_OPERATION_HOURS_REQUEST, payload),
  updateOperationHoursSuccess: () => createAction(DeskActionTypes.UPDATE_OPERATION_HOURS_SUCCESS),
  updateOperationHoursFail: (payload) => createAction(DeskActionTypes.UPDATE_OPERATION_HOURS_FAIL, payload),
  updateOperationHoursCancel: () => createAction(DeskActionTypes.UPDATE_OPERATION_HOURS_CANCEL),

  fetchApiTokensRequest: (payload) => createAction(DeskActionTypes.FETCH_API_TOKENS_REQUEST, payload),
  fetchApiTokensSuccess: (payload) => createAction(DeskActionTypes.FETCH_API_TOKENS_SUCCESS, payload),
  fetchApiTokensFail: (payload) => createAction(DeskActionTypes.FETCH_API_TOKENS_FAIL, payload),

  setApiTokenPagination: (payload) => createAction(DeskActionTypes.SET_API_TOKEN_PAGINATION, payload),

  createApiTokenRequest: (payload) => createAction(DeskActionTypes.CREATE_API_TOKEN_REQUEST, payload),
  createApiTokenSuccess: () => createAction(DeskActionTypes.CREATE_API_TOKEN_SUCCESS),
  createApiTokenFail: (payload) => createAction(DeskActionTypes.CREATE_API_TOKEN_FAIL, payload),

  deleteApiTokenRequest: (payload) => createAction(DeskActionTypes.DELETE_API_TOKEN_REQUEST, payload),
  deleteApiTokenSuccess: (payload) => createAction(DeskActionTypes.DELETE_API_TOKEN_SUCCESS, payload),
  deleteApiTokenFail: (payload) => createAction(DeskActionTypes.DELETE_API_TOKEN_FAIL, payload),

  setDeskConnected: (payload) => createAction(DeskActionTypes.SET_DESK_CONNECTED, payload),
  setDeskProject: (payload) => createAction(DeskActionTypes.SET_DESK_PROJECT, payload),
  setDeskAgent: (payload) => createAction(DeskActionTypes.SET_DESK_AGENT, payload),

  setAgentConnection: (payload) => createAction(DeskActionTypes.SET_AGENT_CONNECTION, payload),

  // macros
  fetchMacrosRequest: (payload) => createAction(DeskActionTypes.FETCH_MACROS_REQUEST, payload),
  fetchMacrosSuccess: (payload) => createAction(DeskActionTypes.FETCH_MACROS_SUCCESS, payload),
  fetchMacrosFail: (payload) => createAction(DeskActionTypes.FETCH_MACROS_FAIL, payload),
  fetchMacrosCancel: (payload) => createAction(DeskActionTypes.FETCH_MACROS_CANCEL, payload),

  searchMacrosRequest: (payload) => createAction(DeskActionTypes.SEARCH_MACROS_REQUEST, payload),
  searchMacrosSuccess: (payload) => createAction(DeskActionTypes.SEARCH_MACROS_SUCCESS, payload),
  searchMacrosFail: (payload) => createAction(DeskActionTypes.SEARCH_MACROS_FAIL, payload),
  searchMacrosCancel: (payload) => createAction(DeskActionTypes.SEARCH_MACROS_CANCEL, payload),

  addMacrosRequest: (payload) => createAction(DeskActionTypes.ADD_MACROS_REQUEST, payload),
  addMacrosSucces: (payload) => createAction(DeskActionTypes.ADD_MACROS_SUCCESS, payload),
  addMacrosFail: (payload) => createAction(DeskActionTypes.ADD_MACROS_FAIL, payload),
  addMacrosCancel: () => createAction(DeskActionTypes.ADD_MACROS_CANCEL),

  editMacrosRequest: (payload) => createAction(DeskActionTypes.EDIT_MACROS_REQUEST, payload),
  editMacrosSucces: (payload) => createAction(DeskActionTypes.EDIT_MACROS_SUCCESS, payload),
  editMacrosFail: (payload) => createAction(DeskActionTypes.EDIT_MACROS_FAIL, payload),
  editMacrosCancel: () => createAction(DeskActionTypes.EDIT_MACROS_CANCEL),

  deleteMacrosRequest: (payload) => createAction(DeskActionTypes.DELETE_MACROS_REQUEST, payload),
  deleteMacrosSucces: (payload) => createAction(DeskActionTypes.DELETE_MACROS_SUCCESS, payload),
  deleteMacrosFail: (payload) => createAction(DeskActionTypes.DELETE_MACROS_FAIL, payload),
  deleteMacrosCancel: () => createAction(DeskActionTypes.DELETE_MACROS_CANCEL),

  resetDesk: () => createAction(DeskActionTypes.RESET_DESK),
};
