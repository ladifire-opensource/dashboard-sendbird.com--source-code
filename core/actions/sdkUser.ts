import { createAction } from '@actions/createAction';
import { SDKUserActionTypes } from '@actions/types';

export const SDKUserActions: SDKUserActionCreators = {
  fetchSDKUserRequest: () => createAction(SDKUserActionTypes.FETCH_SDK_USER_REQUEST),
  fetchSDKUserSuccess: (payload) => createAction(SDKUserActionTypes.FETCH_SDK_USER_SUCCESS, payload),
  fetchSDKUserCancel: () => createAction(SDKUserActionTypes.FETCH_SDK_USER_CANCEL),
  fetchSDKUserFail: (payload) => createAction(SDKUserActionTypes.FETCH_SDK_USER_FAIL, payload),

  createSDKUserRequest: (payload) => createAction(SDKUserActionTypes.CREATE_SDK_USER_REQUEST, payload),
  createSDKUserSuccess: (payload) => createAction(SDKUserActionTypes.CREATE_SDK_USER_SUCCESS, payload),
  createSDKUserCancel: () => createAction(SDKUserActionTypes.CREATE_SDK_USER_CANCEL),
  createSDKUserFail: (payload) => createAction(SDKUserActionTypes.CREATE_SDK_USER_FAIL, payload),

  updateSDKUserRequest: (payload) => createAction(SDKUserActionTypes.UPDATE_SDK_USER_REQUEST, payload),
  updateSDKUserSuccess: (payload: SDKUser) => createAction(SDKUserActionTypes.UPDATE_SDK_USER_SUCCESS, payload),
  updateSDKUserCancel: () => createAction(SDKUserActionTypes.UPDATE_SDK_USER_CANCEL),
  updateSDKUserFail: (payload) => createAction(SDKUserActionTypes.UPDATE_SDK_USER_FAIL, payload),

  removeSDKUserRequest: () => createAction(SDKUserActionTypes.REMOVE_SDK_USER_REQUEST),
  removeSDKUserSuccess: () => createAction(SDKUserActionTypes.REMOVE_SDK_USER_SUCCESS),
  removeSDKUserFail: (payload) => createAction(SDKUserActionTypes.REMOVE_SDK_USER_FAIL, payload),
};
