import { createAction } from '@actions/createAction';
import { MessagesActionTypes } from '@actions/types';

export const MessagesActions = {
  searchMessagesRequest: (payload) => createAction(MessagesActionTypes.SEARCH_MESSAGES_REQUEST, payload),
  searchMessagesSuccess: (payload) => createAction(MessagesActionTypes.SEARCH_MESSAGES_SUCCESS, payload),
  searchMessagesFail: (payload) => createAction(MessagesActionTypes.SEARCH_MESSAGES_FAIL, payload),
  recoverMessageRequest: (payload) => createAction(MessagesActionTypes.RECOVER_MESSAGE_REQUEST, payload),
  recoverMessageSuccess: (payload) => createAction(MessagesActionTypes.RECOVER_MESSAGE_SUCCESS, payload),
  recoverMessageFail: (payload) => createAction(MessagesActionTypes.RECOVER_MESSAGE_FAIL, payload),
  updateMessageRequest: (payload) => createAction(MessagesActionTypes.UPDATE_MESSAGE_REQUEST, payload),
  updateMessageSuccess: (payload) => createAction(MessagesActionTypes.UPDATE_MESSAGE_SUCCESS, payload),
  updateMessageFail: (payload) => createAction(MessagesActionTypes.UPDATE_MESSAGE_FAIL, payload),
  deleteMessagesRequest: (payload) => createAction(MessagesActionTypes.DELETE_MESSAGES_REQUEST, payload),
  deleteMessagesSuccess: (payload) => createAction(MessagesActionTypes.DELETE_MESSAGES_SUCCESS, payload),
  deleteMessagesFail: (payload) => createAction(MessagesActionTypes.DELETE_MESSAGES_FAIL, payload),
  deleteMessageRequest: (payload) => createAction(MessagesActionTypes.DELETE_MESSAGE_REQUEST, payload),
  deleteMessageSuccess: (payload) => createAction(MessagesActionTypes.DELETE_MESSAGE_SUCCESS, payload),
  deleteMessageFail: (payload) => createAction(MessagesActionTypes.DELETE_MESSAGE_FAIL, payload),
  deleteAllChannelMessagesRequest: (payload) =>
    createAction(MessagesActionTypes.DELETE_ALL_CHANNEL_MESSAGES_REQUEST, payload),
  deleteAllChannelMessagesSuccess: (payload) =>
    createAction(MessagesActionTypes.DELETE_ALL_CHANNEL_MESSAGES_SUCCESS, payload),
  deleteAllChannelMessagesFail: (payload) =>
    createAction(MessagesActionTypes.DELETE_ALL_CHANNEL_MESSAGES_FAIL, payload),
  setMessagesSearchOptions: (payload) => createAction(MessagesActionTypes.SET_MESSAGES_SEARCH_OPTIONS, payload),
  resetMessagesRequest: () => createAction(MessagesActionTypes.RESET_MESSAGES_REQUEST),
  setMessagesActiveTab: (payload) => createAction(MessagesActionTypes.SET_MESSAGES_ACTIVE_TAB, payload),
};
