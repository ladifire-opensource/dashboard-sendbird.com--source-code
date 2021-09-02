import { Actions } from '@actions';
import { SettingsActionTypes, AuthenticationActionTypes, ApplicationActionTypes } from '@actions/types';

const initialState: SettingsState = {
  isFetchingAppName: false,
  isFetchingPushMessageTemplates: false,

  isFetchingFileMessageEvent: false,
  isFetchingWebhookInformation: false,
  isFetchingMaxLengthMessage: false,
  isFetchingIgnoreMessageOffset: false,
  isFetchingAutoEventMessage: false,
  isFetchingAccessTokenUserPolicy: false,
  isAddingCredentialsFilter: false,
  isFetchingModeratorInfoADMM: false,

  isPushMessageTemplatesFetched: false,

  isFetchedWebhook: false,
  webhook: {
    enabled: false,
    url: '',
    include_members: false,
    include_unread_count: false,
    enabled_events: [],
  },
  webhookAllEvents: [],

  isModeratorInfoInAdminMessage: false,
};

export const settingsReducer: Reducer<SettingsState, Actions> = (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.CHANGE_APP_NAME_REQUEST:
      return {
        ...state,
        isFetchingAppName: true,
      };
    case ApplicationActionTypes.CHANGE_APP_NAME_SUCCESS:
    case ApplicationActionTypes.CHANGE_APP_NAME_FAIL:
      return {
        ...state,
        isFetchingAppName: false,
      };
    case SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_REQUEST:
    case SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_REQUEST:
      return {
        ...state,
        isFetchingPushMessageTemplates: true,
      };
    case SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_SUCCESS:
    case SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_SUCCESS:
      if (!state.isPushMessageTemplatesFetched) {
        return {
          ...state,
          isPushMessageTemplatesFetched: true,
          isFetchingPushMessageTemplates: false,
        };
      }
      return {
        ...state,
        isFetchingPushMessageTemplates: false,
      };
    case SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_FAIL:
    case SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_FAIL:
      return {
        ...state,
        isFetchingPushMessageTemplates: false,
      };

    case SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_REQUEST:
      return {
        ...state,
        isFetchingFileMessageEvent: true,
      };
    case SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_SUCCESS:
    case SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_FAIL:
      return {
        ...state,
        isFetchingFileMessageEvent: false,
      };
    case SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_REQUEST:
      return {
        ...state,
        isFetchingWebhookInformation: true,
      };

    case SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_SUCCESS: {
      const webhookAllEvents = action.payload;
      return {
        ...state,
        webhookAllEvents,
        isFetchingWebhookInformation: false,
      };
    }
    case SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_FAIL:
      return {
        ...state,
        isFetchingWebhookInformation: false,
      };

    case SettingsActionTypes.GET_WEBHOOKS_INFORMATION_REQUEST:
      return {
        ...state,
        isFetchedWebhook: false,
        isFetchingWebhookInformation: true,
      };
    case SettingsActionTypes.GET_WEBHOOKS_INFORMATION_SUCCESS: {
      const webhook = action.payload;
      return {
        ...state,
        webhook,
        isFetchedWebhook: true,
        isFetchingWebhookInformation: false,
      };
    }
    case SettingsActionTypes.GET_WEBHOOKS_INFORMATION_FAIL:
      return {
        ...state,
        isFetchedWebhook: false,
        isFetchingWebhookInformation: false,
      };

    case SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_REQUEST:
      return {
        ...state,
        isFetchingWebhookInformation: true,
      };
    case SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_SUCCESS: {
      const webhook = action.payload;
      return {
        ...state,
        webhook,
        isFetchingWebhookInformation: false,
      };
    }
    case SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_FAIL:
      return {
        ...state,
        isFetchingWebhookInformation: false,
      };

    case SettingsActionTypes.UPDATE_MAX_LENGTH_MESSAGE_REQUEST:
      return {
        ...state,
        isFetchingMaxLengthMessage: true,
      };
    case SettingsActionTypes.UPDATE_MAX_LENGTH_MESSAGE_SUCCESS:
      return {
        ...state,
        isFetchingMaxLengthMessage: false,
      };
    case SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_REQUEST:
      return {
        ...state,
        isFetchingIgnoreMessageOffset: true,
      };
    case SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_SUCCESS:
    case SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_FAIL:
      return {
        ...state,
        isFetchingIgnoreMessageOffset: false,
      };
    case SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_REQUEST:
      return {
        ...state,
        isFetchingAutoEventMessage: true,
      };
    case SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_SUCCESS:
    case SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_FAIL:
      return {
        ...state,
        isFetchingAutoEventMessage: false,
      };
    case SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_REQUEST:
      return {
        ...state,
        isFetchingAccessTokenUserPolicy: true,
      };
    case SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_SUCCESS:
    case SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_FAIL:
      return {
        ...state,
        isFetchingAccessTokenUserPolicy: false,
      };
    case SettingsActionTypes.ADD_CREDENTIALS_FILTER_REQUEST:
      return {
        ...state,
        isAddingCredentialsFilter: true,
      };
    case SettingsActionTypes.ADD_CREDENTIALS_FILTER_SUCCESS:
    case SettingsActionTypes.ADD_CREDENTIALS_FILTER_FAIL:
      return {
        ...state,
        isAddingCredentialsFilter: false,
      };
    case SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_REQUEST:
    case SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_REQUEST:
      return {
        ...state,
        isFetchingModeratorInfoADMM: true,
      };
    case SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_SUCCESS:
    case SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_SUCCESS:
      return {
        ...state,
        isFetchingModeratorInfoADMM: false,
        isModeratorInfoInAdminMessage: action.payload,
      };
    case SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_FAIL:
    case SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_FAIL:
      return {
        ...state,
        isFetchingModeratorInfoADMM: false,
      };
    case ApplicationActionTypes.RESET_APPLICATION_SUCCESS:
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
