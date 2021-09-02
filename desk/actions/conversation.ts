import { createAction } from '@actions/createAction';
import { ConversationActionTypes } from '@actions/types';

export const ConversationActions: ConversationActionCreators = {
  fetchConversationRequest: (payload) => createAction(ConversationActionTypes.FETCH_CONVERSATION_REQUEST, payload),
  fetchConversationSuccess: (payload) => createAction(ConversationActionTypes.FETCH_CONVERSATION_SUCCESS, payload),
  fetchConversationFail: (payload) => createAction(ConversationActionTypes.FETCH_CONVERSATION_FAIL, payload),
  fetchConversationCancel: () => createAction(ConversationActionTypes.FETCH_CONVERSATION_CANCEL),
  fetchConversationMessagesRequest: (payload) =>
    createAction(ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_REQUEST, payload),
  fetchConversationMessagesSuccess: (payload) =>
    createAction(ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_SUCCESS, payload),
  fetchConversationMessagesFail: (payload) =>
    createAction(ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_FAIL, payload),
  fetchConversationMessagesCancel: () => createAction(ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_CANCEL),

  updateConversationTicketMessage: (payload) =>
    createAction(ConversationActionTypes.UPDATE_CONVERSATION_TICKET_MESSAGE, payload),

  updateConversationTicketAssignmentRequest: (payload) =>
    createAction(ConversationActionTypes.UPDATE_CONVERSATION_TICKET_ASSIGNMENT_REQUEST, payload),
  /**
   * Update ticket assignment via API
   */
  setConversationAssignment: (payload) => createAction(ConversationActionTypes.SET_CONVERSATION_ASSIGNMENT, payload),
  resetConversation: () => createAction(ConversationActionTypes.RESET_CONVERSATION),
  resetConversationMessages: () => createAction(ConversationActionTypes.RESET_CONVERSATION_MESSAGES),

  // URL Preview
  fetchURLPreviewRequest: (payload) => createAction(ConversationActionTypes.FETCH_URL_PREVIEW_REQUEST, payload),
  fetchURLPreviewSuccess: (payload) => createAction(ConversationActionTypes.FETCH_URL_PREVIEW_SUCCESS, payload),
  fetchURLPreviewFail: (payload) => createAction(ConversationActionTypes.FETCH_URL_PREVIEW_FAIL, payload),

  // assign ticket to myself
  assignTicketToMyselfRequest: (payload) =>
    createAction(ConversationActionTypes.ASSIGN_TICKET_TO_MYSELF_REQUEST, payload),
  assignTicketToMyselfSuccess: (payload) =>
    createAction(ConversationActionTypes.ASSIGN_TICKET_TO_MYSELF_SUCCESS, payload),
  assignTicketToMyselfFail: (payload) => createAction(ConversationActionTypes.ASSIGN_TICKET_TO_MYSELF_FAIL, payload),
  setTypingStatus: (payload) => createAction(ConversationActionTypes.SET_TYPING_STATUS, payload),
  setAgentTypingStatus: (payload) => createAction(ConversationActionTypes.SET_AGENT_TYPING_STATUS, payload),
  setOthersTypingStatus: (payload) => createAction(ConversationActionTypes.SET_OTHERS_TYPING_STATUS, payload),

  /**
   * Social
   */

  // facebook - message
  fetchFacebookMessagesRequest: (payload) =>
    createAction(ConversationActionTypes.FETCH_FACEBOOK_MESSAGES_REQUEST, payload),
  fetchFacebookMessagesSuccess: (payload) =>
    createAction(ConversationActionTypes.FETCH_FACEBOOK_MESSAGES_SUCCESS, payload),
  fetchFacebookMessagesFail: (payload) => createAction(ConversationActionTypes.FETCH_FACEBOOK_MESSAGES_FAIL, payload),
  updateFacebookMessageRequest: (payload) =>
    createAction(ConversationActionTypes.UPDATE_FACEBOOK_MESSAGE_REQUEST, payload),
  sendFacebookMessageRequest: (payload) => createAction(ConversationActionTypes.SEND_FACEBOOK_MESSAGE_REQUEST, payload),
  sendFacebookMessageSuccess: (payload) => createAction(ConversationActionTypes.SEND_FACEBOOK_MESSAGE_SUCCESS, payload),
  sendFacebookMessageFail: (payload) => createAction(ConversationActionTypes.SEND_FACEBOOK_MESSAGE_FAIL, payload),
  // facebook - feed
  fetchFacebookFeedsRequest: (payload) => createAction(ConversationActionTypes.FETCH_FACEBOOK_FEEDS_REQUEST, payload),
  fetchFacebookFeedsSuccess: (payload) => createAction(ConversationActionTypes.FETCH_FACEBOOK_FEEDS_SUCCESS, payload),
  fetchFacebookFeedsFail: (payload) => createAction(ConversationActionTypes.FETCH_FACEBOOK_FEEDS_FAIL, payload),
  updateFacebookFeedsRequest: (payload) => createAction(ConversationActionTypes.UPDATE_FACEBOOK_FEEDS_REQUEST, payload),
  updateFacebookFeedRequest: (payload) => createAction(ConversationActionTypes.UPDATE_FACEBOOK_FEED_REQUEST, payload),
  createFacebookFeedRequest: (payload) => createAction(ConversationActionTypes.CREATE_FACEBOOK_FEED_REQUEST, payload),

  editFacebookFeedRequest: (payload) => createAction(ConversationActionTypes.EDIT_FACEBOOK_FEED_REQUEST, payload),
  editFacebookFeedSuccess: (payload) => createAction(ConversationActionTypes.EDIT_FACEBOOK_FEED_SUCCESS, payload),
  editFacebookFeedFail: (payload) => createAction(ConversationActionTypes.EDIT_FACEBOOK_FEED_FAIL, payload),

  deleteFacebookFeedRequest: (payload) => createAction(ConversationActionTypes.DELETE_FACEBOOK_FEED_REQUEST, payload),
  deleteFacebookFeedSuccess: (payload) => createAction(ConversationActionTypes.DELETE_FACEBOOK_FEED_SUCCESS, payload),
  deleteFacebookFeedFail: (payload) => createAction(ConversationActionTypes.DELETE_FACEBOOK_FEED_FAIL, payload),

  facebookFeedLikeRequest: (payload) => createAction(ConversationActionTypes.FACEBOOK_FEED_LIKE_REQUEST, payload),
  facebookFeedLikeSuccess: (payload) => createAction(ConversationActionTypes.FACEBOOK_FEED_LIKE_SUCCESS, payload),
  facebookFeedLikeFail: (payload) => createAction(ConversationActionTypes.FACEBOOK_FEED_LIKE_FAIL, payload),

  facebookFeedUnlikeRequest: (payload) => createAction(ConversationActionTypes.FACEBOOK_FEED_UNLIKE_REQUEST, payload),
  facebookFeedUnlikeSuccess: (payload) => createAction(ConversationActionTypes.FACEBOOK_FEED_UNLIKE_SUCCESS, payload),
  facebookFeedUnlikeFail: (payload) => createAction(ConversationActionTypes.FACEBOOK_FEED_UNLIKE_FAIL, payload),

  markAsReadRequest: (payload) => createAction(ConversationActionTypes.MARK_AS_READ_REQUEST, payload),
  markAsReadSuccess: (payload) => createAction(ConversationActionTypes.MARK_AS_READ_SUCCESS, payload),
  markAsReadFail: (payload) => createAction(ConversationActionTypes.MARK_AS_READ_FAIL, payload),

  // twitter
  fetchTwitterDirectMessagesRequest: (payload) =>
    createAction(ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_REQUEST, payload),
  fetchTwitterDirectMessagesSuccess: (payload) =>
    createAction(ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_SUCCESS, payload),
  fetchTwitterDirectMessagesFail: (payload) =>
    createAction(ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_FAIL, payload),

  createTwitterDirectMessageRequest: (payload) =>
    createAction(ConversationActionTypes.CREATE_TWITTER_DIRECT_MESSAGE_EVENT_REQUEST, payload),
  createTwitterDirectMessageSuccess: (payload) =>
    createAction(ConversationActionTypes.CREATE_TWITTER_DIRECT_MESSAGE_EVENT_SUCCESS, payload),
  createTwitterDirectMessageFail: () => createAction(ConversationActionTypes.CREATE_TWITTER_DIRECT_MESSAGE_EVENT_FAIL),

  deleteTwitterDirectMessageEventRequest: (payload) =>
    createAction(ConversationActionTypes.DELETE_TWITTER_DIRECT_MESSAGE_EVENT_REQUEST, payload),
  deleteTwitterDirectMessageEventSuccess: (payload) =>
    createAction(ConversationActionTypes.DELETE_TWITTER_DIRECT_MESSAGE_EVENT_SUCCESS, payload),
  deleteTwitterDirectMessageEventFail: (payload) =>
    createAction(ConversationActionTypes.DELETE_TWITTER_DIRECT_MESSAGE_EVENT_FAIL, payload),

  upsertTwitterDirectMessageEvent: (payload) =>
    createAction(ConversationActionTypes.UPSERT_TWITTER_DIRECT_MESSAGE_EVENT, payload),

  fetchTwitterStatusesRequest: (payload) =>
    createAction(ConversationActionTypes.FETCH_TWITTER_STATUSES_REQUEST, payload),
  fetchTwitterStatusesSuccess: (payload) =>
    createAction(ConversationActionTypes.FETCH_TWITTER_STATUSES_SUCCESS, payload),
  fetchTwitterStatusesFail: (payload) => createAction(ConversationActionTypes.FETCH_TWITTER_STATUSES_FAIL, payload),

  createTwitterStatusRequest: (payload) => createAction(ConversationActionTypes.CREATE_TWITTER_STATUS_REQUEST, payload),
  createTwitterStatusSuccess: (payload) => createAction(ConversationActionTypes.CREATE_TWITTER_STATUS_SUCCESS, payload),
  createTwitterStatusFail: () => createAction(ConversationActionTypes.CREATE_TWITTER_STATUS_FAIL),

  patchTwitterStatusRequest: (payload) => createAction(ConversationActionTypes.PATCH_TWITTER_STATUS_REQUEST, payload),
  patchTwitterStatusSuccess: (payload) => createAction(ConversationActionTypes.PATCH_TWITTER_STATUS_SUCCESS, payload),
  patchTwitterStatusFail: (payload) => createAction(ConversationActionTypes.PATCH_TWITTER_STATUS_FAIL, payload),

  patchTwitterStatusTwitterUserRequest: (payload) =>
    createAction(ConversationActionTypes.PATCH_TWITTER_STATUS_TWITTER_USER_REQUEST, payload),
  patchTwitterStatusTwitterUserSuccess: (payload) =>
    createAction(ConversationActionTypes.PATCH_TWITTER_STATUS_TWITTER_USER_SUCCESS, payload),
  patchTwitterStatusTwitterUserFail: (payload) =>
    createAction(ConversationActionTypes.PATCH_TWITTER_STATUS_TWITTER_USER_FAIL, payload),

  updateTwitterStatusFromDeskEvent: (payload) =>
    createAction(ConversationActionTypes.UPDATE_TWITTER_STATUS_FROM_DESK_EVENT, payload),

  fetchInstagramCommentsRequest: (payload) =>
    createAction(ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_REQUEST, payload),
  fetchInstagramCommentsSuccess: (payload) =>
    createAction(ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_SUCCESS, payload),
  fetchInstagramCommentsFail: (payload) => createAction(ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_FAIL, payload),

  createInstagramCommentRequest: (payload) =>
    createAction(ConversationActionTypes.CREATE_INSTAGRAM_COMMENT_REQUEST, payload),
  createInstagramCommentSuccess: (payload) =>
    createAction(ConversationActionTypes.CREATE_INSTAGRAM_COMMENT_SUCCESS, payload),
  createInstagramCommentFail: () => createAction(ConversationActionTypes.CREATE_INSTAGRAM_COMMENT_FAIL),

  deleteInstagramCommentRequest: (payload) =>
    createAction(ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_REQUEST, payload),
  deleteInstagramCommentSuccess: (payload) =>
    createAction(ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_SUCCESS, payload),
  deleteInstagramCommentFail: () => createAction(ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_FAIL),

  updateInstagramCommentSuccess: (payload) =>
    createAction(ConversationActionTypes.UPDATE_INSTAGRAM_COMMENT_SUCCESS, payload),

  updateInstagramCommentFromDeskEvent: (payload) =>
    createAction(ConversationActionTypes.UPDATE_INSTAGRAM_COMMENT_FROM_DESK_EVENT, payload),

  fetchWhatsAppMessagesRequest: (payload) =>
    createAction(ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_REQUEST, payload),
  fetchWhatsAppMessagesSuccess: (payload) =>
    createAction(ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_SUCCESS, payload),
  fetchWhatsAppMessagesFail: () => createAction(ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_FAIL),

  createWhatsAppMessageRequest: (payload) =>
    createAction(ConversationActionTypes.CREATE_WHATSAPP_MESSAGE_REQUEST, payload),
  createWhatsAppMessageSuccess: (payload) =>
    createAction(ConversationActionTypes.CREATE_WHATSAPP_MESSAGE_SUCCESS, payload),
  createWhatsAppMessageFail: () => createAction(ConversationActionTypes.CREATE_WHATSAPP_MESSAGE_FAIL),

  updateWhatsAppMessageFromDeskEvent: (payload) =>
    createAction(ConversationActionTypes.UPDATE_WHATSAPP_MESSAGE_FROM_DESK_EVENT, payload),
};
