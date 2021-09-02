import { createAction } from '@actions/createAction';
import { SettingsActionTypes } from '@actions/types';

export const SettingsActions: SettingsActionCreators = {
  // push
  togglePushEnabledRequest: (payload) => createAction(SettingsActionTypes.TOGGLE_PUSH_ENABLED_REQUEST, payload),
  togglePushEnabledSuccess: () => createAction(SettingsActionTypes.TOGGLE_PUSH_ENABLED_SUCCESS),
  togglePushEnabledFail: (payload) => createAction(SettingsActionTypes.TOGGLE_PUSH_ENABLED_FAIL, payload),
  fetchPushMessageTemplatesRequest: () => createAction(SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_REQUEST),
  fetchPushMessageTemplatesSuccess: (payload) =>
    createAction(SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_SUCCESS, payload),
  fetchPushMessageTemplatesFail: (payload) =>
    createAction(SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_FAIL, payload),
  updatePushMessageTemplatesRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_REQUEST, payload),
  updatePushMessageTemplatesSuccess: () => createAction(SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_SUCCESS),
  updatePushMessageTemplatesFail: (payload) =>
    createAction(SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_FAIL, payload),
  updateFileMessageEventRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_REQUEST, payload),
  updateFileMessageEventSuccess: () => createAction(SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_SUCCESS),
  updateFileMessageEventFail: (payload) => createAction(SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_FAIL, payload),
  getWebhookAllCategoriesRequest: () => createAction(SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_REQUEST),
  getWebhookAllCategoriesSuccess: (payload) =>
    createAction(SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_SUCCESS, payload),
  getWebhookAllCategoriesFail: (payload) => createAction(SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_FAIL, payload),
  getWebhooksInformationRequest: () => createAction(SettingsActionTypes.GET_WEBHOOKS_INFORMATION_REQUEST),
  getWebhooksInformationSuccess: (payload) =>
    createAction(SettingsActionTypes.GET_WEBHOOKS_INFORMATION_SUCCESS, payload),
  getWebhooksInformationFail: (payload) => createAction(SettingsActionTypes.GET_WEBHOOKS_INFORMATION_FAIL, payload),
  updateWebhookInformationRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_REQUEST, payload),
  updateWebhookInformationSuccess: (payload) =>
    createAction(SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_SUCCESS, payload),
  updateWebhookInformationFail: (payload) => createAction(SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_FAIL, payload),

  updateMaxLengthMessageRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_MAX_LENGTH_MESSAGE_REQUEST, payload),
  updateMaxLengthMessageSuccess: () => createAction(SettingsActionTypes.UPDATE_MAX_LENGTH_MESSAGE_SUCCESS),
  updateMaxLengthMessageFail: (payload) => createAction(SettingsActionTypes.UPDATE_MAX_LENGTH_MESSAGE_FAIL, payload),
  updateIgnoreMessageOffsetRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_REQUEST, payload),
  updateIgnoreMessageOffsetSuccess: () => createAction(SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_SUCCESS),
  updateIgnoreMessageOffsetFail: (payload) =>
    createAction(SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_FAIL, payload),
  updateAutoEventMessageRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_REQUEST, payload),
  updateAutoEventMessageSuccess: () => createAction(SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_SUCCESS),
  updateAutoEventMessageFail: (payload) => createAction(SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_FAIL, payload),
  updateAccessTokenUserPolicyRequest: (payload) =>
    createAction(SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_REQUEST, payload),
  updateAccessTokenUserPolicySuccess: () => createAction(SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_SUCCESS),
  updateAccessTokenUserPolicyFail: (payload) =>
    createAction(SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_FAIL, payload),
  addCredentialsFilterRequest: (payload) => createAction(SettingsActionTypes.ADD_CREDENTIALS_FILTER_REQUEST, payload),
  addCredentialsFilterSuccess: () => createAction(SettingsActionTypes.ADD_CREDENTIALS_FILTER_SUCCESS),
  addCredentialsFilterFail: (payload) => createAction(SettingsActionTypes.ADD_CREDENTIALS_FILTER_FAIL, payload),
  removeCredentialsFilterRequest: (payload) =>
    createAction(SettingsActionTypes.REMOVE_CREDENTIALS_FILTER_REQUEST, payload),
  removeCredentialsFilterSuccess: () => createAction(SettingsActionTypes.REMOVE_CREDENTIALS_FILTER_SUCCESS),
  removeCredentialsFilterFail: (payload) => createAction(SettingsActionTypes.REMOVE_CREDENTIALS_FILTER_FAIL, payload),
  deleteApplicationRequest: (payload) => createAction(SettingsActionTypes.DELETE_APPLICATION_REQUEST, payload),
  deleteApplicationSuccess: (payload) => createAction(SettingsActionTypes.DELETE_APPLICATION_SUCCESS, payload),
  deleteApplicationFail: (payload) => createAction(SettingsActionTypes.DELETE_APPLICATION_FAIL, payload),
  pushAPNSRegisterRequest: (payload) => createAction(SettingsActionTypes.PUSH_APNS_REGISTER_REQUEST, payload),
  pushAPNSRegisterSuccess: (payload) => createAction(SettingsActionTypes.PUSH_APNS_REGISTER_SUCCESS, payload),
  pushAPNSRegisterFail: (payload) => createAction(SettingsActionTypes.PUSH_APNS_REGISTER_FAIL, payload),
  pushFCMRegisterRequest: (payload) => createAction(SettingsActionTypes.PUSH_FCM_REGISTER_REQUEST, payload),
  pushFCMRegisterSuccess: (payload) => createAction(SettingsActionTypes.PUSH_FCM_REGISTER_SUCCESS, payload),
  pushFCMRegisterFail: (payload) => createAction(SettingsActionTypes.PUSH_FCM_REGISTER_FAIL, payload),
  deletePushConfigurationRequest: (payload) =>
    createAction(SettingsActionTypes.DELETE_PUSH_CONFIGURATION_REQUEST, payload),
  deletePushConfigurationSuccess: (payload) =>
    createAction(SettingsActionTypes.DELETE_PUSH_CONFIGURATION_SUCCESS, payload),
  deletePushConfigurationFail: (payload) => createAction(SettingsActionTypes.DELETE_PUSH_CONFIGURATION_FAIL, payload),
  fetchModeratorInfoADMMRequest: () => createAction(SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_REQUEST),
  fetchModeratorInfoADMMSuccess: (payload: boolean) =>
    createAction(SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_SUCCESS, payload),
  fetchModeratorInfoADMMFail: (error: any) => createAction(SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_FAIL, error),
  updateModeratorInfoADMMRequest: (payload: boolean) =>
    createAction(SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_REQUEST, payload),
  updateModeratorInfoADMMSuccess: (payload: boolean) =>
    createAction(SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_SUCCESS, payload),
  updateModeratorInfoADMMFail: (error: any) => createAction(SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_FAIL, error),
};
