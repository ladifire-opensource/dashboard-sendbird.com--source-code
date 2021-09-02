import { createAction } from '@actions/createAction';
import { ApplicationActionTypes } from '@actions/types';

export const ApplicationActions: ApplicationActionCreators = {
  fetchApplicationRequest: (payload) => createAction(ApplicationActionTypes.FETCH_APPLICATION_REQUEST, payload),
  fetchApplicationSuccess: (payload) => createAction(ApplicationActionTypes.FETCH_APPLICATION_SUCCESS, payload),
  fetchApplicationFail: (payload) => createAction(ApplicationActionTypes.FETCH_APPLICATION_FAIL, payload),
  fetchApplicationCancel: () => createAction(ApplicationActionTypes.FETCH_APPLICATION_CANCEL),
  setApplicationRequest: (payload) => createAction(ApplicationActionTypes.SET_APPLICATION_REQUEST, payload),
  updateApplicationAttributes: (payload) => createAction(ApplicationActionTypes.UPDATE_APPLICATION_ATTRIBUTES, payload),
  resetApplicationRequest: () => createAction(ApplicationActionTypes.RESET_APPLICATION_REQUEST),
  resetApplicationSuccess: () => createAction(ApplicationActionTypes.RESET_APPLICATION_SUCCESS),
  resetApplicationsRequest: () => createAction(ApplicationActionTypes.RESET_APPLICATIONS_REQUEST),
  createAppRequest: (payload) => createAction(ApplicationActionTypes.CREATE_APP_REQUEST, payload),
  createAppSuccess: (payload) => createAction(ApplicationActionTypes.CREATE_APP_SUCCESS, payload),
  createAppFail: (payload) => createAction(ApplicationActionTypes.CREATE_APP_FAIL, payload),
  changeAppNameRequest: (payload) => createAction(ApplicationActionTypes.CHANGE_APP_NAME_REQUEST, payload),
  changeAppNameSuccess: (payload) => createAction(ApplicationActionTypes.CHANGE_APP_NAME_SUCCESS, payload),
  changeAppNameFail: (payload) => createAction(ApplicationActionTypes.CHANGE_APP_NAME_FAIL, payload),

  /**
   * Used for app change
   */
  changeApplicationRequest: (payload) => createAction(ApplicationActionTypes.CHANGE_APPLICATION_REQUEST, payload),

  getAPITokenRequest: (payload) => createAction(ApplicationActionTypes.GET_API_TOKEN_REQUEST, payload),
  getAPITokenSuccess: (payload) => createAction(ApplicationActionTypes.GET_API_TOKEN_SUCCESS, payload),
  getAPITokenFail: () => createAction(ApplicationActionTypes.GET_API_TOKEN_FAIL),

  registerCallsApplication: (payload) => createAction(ApplicationActionTypes.REGISTER_CALLS_APPLICATION, payload),
};
