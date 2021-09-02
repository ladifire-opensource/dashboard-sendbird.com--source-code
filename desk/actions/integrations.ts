import { createAction } from '@actions/createAction';
import { IntegrationsActionTypes } from '@actions/types';

export const IntegrationsActions: IntegrationActionCreators = {
  facebookLoadPagesRequest: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_LOAD_PAGES_REQUEST, payload),
  facebookLoadPagesSuccess: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_LOAD_PAGES_SUCCESS, payload),
  facebookLoadPagesFail: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_LOAD_PAGES_FAIL, payload),
  facebookLoadPagesCancel: () => createAction(IntegrationsActionTypes.FACEBOOK_LOAD_PAGES_CANCEL),

  facebookAddPagesRequest: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_ADD_PAGES_REQUEST, payload),
  facebookAddPagesSuccess: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_ADD_PAGES_SUCCESS, payload),
  facebookAddPagesFail: () => createAction(IntegrationsActionTypes.FACEBOOK_ADD_PAGES_FAIL),

  facebookSubscribeRequest: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_REQUEST, payload),
  facebookSubscribeSuccess: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_SUCCESS, payload),
  facebookSubscribeFail: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_FAIL, payload),
  facebookSubscribeCancel: () => createAction(IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_CANCEL),

  facebookUnsubscribeRequest: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_REQUEST, payload),
  facebookUnsubscribeSuccess: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_SUCCESS, payload),
  facebookUnsubscribeFail: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_FAIL, payload),
  facebookUnsubscribeCancel: () => createAction(IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_CANCEL),

  facebookActivePagesRequest: () => createAction(IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_REQUEST),
  facebookActivePagesSuccess: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_SUCCESS, payload),
  facebookActivePagesFail: (payload) => createAction(IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_FAIL, payload),
  facebookActivePagesCancel: () => createAction(IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_CANCEL),

  facebookUpdatePageSettingsRequest: (payload) =>
    createAction(IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_REQUEST, payload),
  facebookUpdatePageSettingsSuccess: (payload) =>
    createAction(IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_SUCCESS, payload),
  facebookUpdatePageSettingsFail: (payload) =>
    createAction(IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_FAIL, payload),
  facebookUpdatePageSettingsCancel: () => createAction(IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_CANCEL),
};
