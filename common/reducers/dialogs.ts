import {
  DialogsActionTypes,
  AuthenticationActionTypes,
  ModerationsActionTypes,
  OrganizationsActionTypes,
  ChannelsActionTypes,
  MessagesActionTypes,
  ApplicationActionTypes,
  SettingsActionTypes,
  TicketsActionTypes,
  DeskActionTypes,
  AccountActionTypes,
  SDKUserActionTypes,
} from '@actions/types';

const initialState = {
  dialogTypes: '',
  dialogProps: {},
  isFetching: false,
};

export const dialogsReducer = (state: DialogsState = initialState, action) => {
  switch (action.type) {
    case ModerationsActionTypes.SEND_ADMIN_MESSAGE_REQUEST:
    case ModerationsActionTypes.EDIT_MESSAGE_REQUEST:
    case ModerationsActionTypes.BAN_USER_REQUEST:
    case ModerationsActionTypes.MUTE_USER_REQUEST:
    case OrganizationsActionTypes.INVITE_MEMBER_REQUEST:
    case OrganizationsActionTypes.UPDATE_INVITATION_REQUEST:
    case OrganizationsActionTypes.CANCEL_INVITATION_REQUEST:
    case ChannelsActionTypes.CREATE_OPEN_CHANNEL_REQUEST:
    case ChannelsActionTypes.DELETE_CHANNELS_REQUEST:
    case MessagesActionTypes.DELETE_MESSAGES_REQUEST:
    case ApplicationActionTypes.CREATE_APP_REQUEST:
    case ApplicationActionTypes.CHANGE_APP_NAME_REQUEST:
    case SettingsActionTypes.PUSH_APNS_REGISTER_REQUEST:
    case SettingsActionTypes.PUSH_FCM_REGISTER_REQUEST:
    case SettingsActionTypes.DELETE_APPLICATION_REQUEST:
    case TicketsActionTypes.TRANSFER_TICKET_REQUEST:
    case TicketsActionTypes.CLOSE_TICKET_REQUEST:
    case TicketsActionTypes.FORCE_ASSIGN_TICKET_REQUEST:
    case TicketsActionTypes.REOPEN_TICKET_REQUEST:
    case DeskActionTypes.CREATE_API_TOKEN_REQUEST:
    case AccountActionTypes.CHANGE_PASSWORD_REQUEST:
    case ApplicationActionTypes.GET_API_TOKEN_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case SDKUserActionTypes.CREATE_SDK_USER_SUCCESS:
    case SDKUserActionTypes.CREATE_SDK_USER_FAIL:
    case SDKUserActionTypes.UPDATE_SDK_USER_SUCCESS:
    case SDKUserActionTypes.UPDATE_SDK_USER_FAIL:
    case ModerationsActionTypes.SEND_ADMIN_MESSAGE_SUCCESS:
    case ModerationsActionTypes.SEND_ADMIN_MESSAGE_FAIL:
    case ModerationsActionTypes.EDIT_MESSAGE_SUCCESS:
    case ModerationsActionTypes.EDIT_MESSAGE_FAIL:
    case ModerationsActionTypes.BAN_USER_SUCCESS:
    case ModerationsActionTypes.BAN_USER_FAIL:
    case ModerationsActionTypes.MUTE_USER_SUCCESS:
    case ModerationsActionTypes.MUTE_USER_FAIL:
    case OrganizationsActionTypes.INVITE_MEMBER_SUCCESS:
    case OrganizationsActionTypes.INVITE_MEMBER_FAIL:
    case OrganizationsActionTypes.UPDATE_INVITATION_SUCCESS:
    case OrganizationsActionTypes.UPDATE_INVITATION_FAIL:
    case OrganizationsActionTypes.CANCEL_INVITATION_SUCCESS:
    case OrganizationsActionTypes.CANCEL_INVITATION_FAIL:
    case ChannelsActionTypes.CREATE_OPEN_CHANNEL_SUCCESS:
    case ChannelsActionTypes.CREATE_OPEN_CHANNEL_FAIL:
    case ChannelsActionTypes.DELETE_CHANNELS_SUCCESS:
    case ChannelsActionTypes.DELETE_CHANNELS_FAIL:
    case MessagesActionTypes.DELETE_MESSAGES_SUCCESS:
    case MessagesActionTypes.DELETE_MESSAGES_FAIL:
    case ApplicationActionTypes.CREATE_APP_SUCCESS:
    case ApplicationActionTypes.CREATE_APP_FAIL:
    case ApplicationActionTypes.CHANGE_APP_NAME_SUCCESS:
    case ApplicationActionTypes.CHANGE_APP_NAME_FAIL:
    case SettingsActionTypes.PUSH_APNS_REGISTER_SUCCESS:
    case SettingsActionTypes.PUSH_APNS_REGISTER_FAIL:
    case SettingsActionTypes.PUSH_FCM_REGISTER_SUCCESS:
    case SettingsActionTypes.PUSH_FCM_REGISTER_FAIL:
    case SettingsActionTypes.DELETE_APPLICATION_SUCCESS:
    case SettingsActionTypes.DELETE_APPLICATION_FAIL:
    case TicketsActionTypes.TRANSFER_TICKET_SUCCESS:
    case TicketsActionTypes.TRANSFER_TICKET_FAIL:
    case TicketsActionTypes.CLOSE_TICKET_SUCCESS:
    case TicketsActionTypes.CLOSE_TICKET_FAIL:
    case TicketsActionTypes.FORCE_ASSIGN_TICKET_SUCCESS:
    case TicketsActionTypes.FORCE_ASSIGN_TICKET_FAIL:
    case TicketsActionTypes.REOPEN_TICKET_SUCCESS:
    case TicketsActionTypes.REOPEN_TICKET_FAIL:
    case DeskActionTypes.CREATE_API_TOKEN_SUCCESS:
    case DeskActionTypes.CREATE_API_TOKEN_FAIL:
    case AccountActionTypes.CHANGE_PASSWORD_SUCCESS:
    case AccountActionTypes.CHANGE_PASSWORD_FAIL:
    case ApplicationActionTypes.GET_API_TOKEN_SUCCESS:
    case ApplicationActionTypes.GET_API_TOKEN_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case DialogsActionTypes.SHOW_DIALOGS_SUCCESS:
      return { ...action.payload };
    case DialogsActionTypes.HIDE_DIALOGS_SUCCESS:
      return initialState;
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
