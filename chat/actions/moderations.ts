import { createAction } from '@actions/createAction';
import { ModerationsActionTypes } from '@actions/types';

export const ModerationsActions: ModerationsActionCreators = {
  // message
  sendAdminMessageRequest: (payload) => createAction(ModerationsActionTypes.SEND_ADMIN_MESSAGE_REQUEST, payload),
  sendAdminMessageSuccess: (payload) => createAction(ModerationsActionTypes.SEND_ADMIN_MESSAGE_SUCCESS, payload),
  sendAdminMessageFail: (payload) => createAction(ModerationsActionTypes.SEND_ADMIN_MESSAGE_FAIL, payload),
  sendAdminMessageCancel: () => createAction(ModerationsActionTypes.SEND_ADMIN_MESSAGE_CANCEL),
  editMessageRequest: (payload) => createAction(ModerationsActionTypes.EDIT_MESSAGE_REQUEST, payload),
  editMessageSuccess: (payload) => createAction(ModerationsActionTypes.EDIT_MESSAGE_SUCCESS, payload),
  editMessageFail: (payload) => createAction(ModerationsActionTypes.EDIT_MESSAGE_FAIL, payload),
  editMessageCancel: () => createAction(ModerationsActionTypes.EDIT_MESSAGE_CANCEL),

  // messages
  updateOpenChannelsMessages: (payload) => createAction(ModerationsActionTypes.UPDATE_OPEN_CHANNELS_MESSAGES, payload),
  updateOpenChannelsMessage: (payload) => createAction(ModerationsActionTypes.UPDATE_OPEN_CHANNELS_MESSAGE, payload),
  deleteOpenChannelsMessage: (payload) => createAction(ModerationsActionTypes.DELETE_OPEN_CHANNELS_MESSAGE, payload),

  // reset
  resetOpenChannelsRequest: () => createAction(ModerationsActionTypes.RESET_OPEN_CHANNELS),
  resetGroupChannelsRequest: () => createAction(ModerationsActionTypes.RESET_GROUP_CHANNELS),
  toggleOpenChannelScrollLock: (locked) => createAction(ModerationsActionTypes.TOGGLE_OPEN_CHANNEL_SCROLL_LOCK, locked),
  toggleGroupChannelScrollLock: (locked) =>
    createAction(ModerationsActionTypes.TOGGLE_GROUP_CHANNEL_SCROLL_LOCK, locked),
  resetOpenChannelsModerationData: () => createAction(ModerationsActionTypes.RESET_OPEN_CHANNELS_MODERATION_DATA),
  resetGroupChannelsModerationData: () => createAction(ModerationsActionTypes.RESET_GROUP_CHANNELS_MODERATION_DATA),

  // ban
  banUserRequest: (payload) => createAction(ModerationsActionTypes.BAN_USER_REQUEST, payload),
  banUserSuccess: (payload) => createAction(ModerationsActionTypes.BAN_USER_SUCCESS, payload),
  banUserFail: (payload) => createAction(ModerationsActionTypes.BAN_USER_FAIL, payload),
  unbanUserRequest: (payload) => createAction(ModerationsActionTypes.UNBAN_USER_REQUEST, payload),
  unbanUserSuccess: (payload) => createAction(ModerationsActionTypes.UNBAN_USER_SUCCESS, payload),
  unbanUserFail: (payload) => createAction(ModerationsActionTypes.UNBAN_USER_FAIL, payload),

  // mute
  muteUserRequest: (payload) => createAction(ModerationsActionTypes.MUTE_USER_REQUEST, payload),
  muteUserSuccess: (payload) => createAction(ModerationsActionTypes.MUTE_USER_SUCCESS, payload),
  muteUserFail: (payload) => createAction(ModerationsActionTypes.MUTE_USER_FAIL, payload),
  unmuteUserRequest: (payload) => createAction(ModerationsActionTypes.UNMUTE_USER_REQUEST, payload),

  // users
  setParticipants: (payload) => createAction(ModerationsActionTypes.SET_PARTICIPANTS, payload),

  // etc
  setOpenChannelsIsEntered: (payload) => createAction(ModerationsActionTypes.SET_OPEN_CHANNELS_IS_ENTERED, payload),
};
