import { combineEpics } from 'redux-observable';

import {
  fetchAgentGroupsEpic,
  fetchAgentGroupEpic,
  createAgentGroupEpic,
  fetchCurrentAgentsEpic,
  updateAgentGroupEpic,
  deleteAgentGroupEpic,
} from './agentGroupsEpic';
import {
  fetchConversationEpic,
  moveTicketToWIPEpic,
  assignTicketToMyselfEpic,
  updateConversationTicketAssignmentEpic,
  fetchConversationMessagesEpic, // facebook
  fetchFacebookMessagesEpic,
  sendFacebookMessageEpic,
  fetchFacebookFeedsEpic,
  createFacebookFeedEpic,
  editFacebookFeedEpic,
  deleteFacebookFeedEpic,
  facebookFeedLikeEpic,
  facebookFeedUnlikeEpic, // twitter
  fetchTwitterDirectMessagesEpic,
  createTwitterDirectMessageEventEpic,
  deleteTwitterDirectMessageEventEpic,
  fetchTwitterStatusesEpic,
  createTwitterStatusEpic,
  patchTwitterStatusEpic,
  patchTwitterStatusTwitterUserEpic, // instagram
  fetchInstagramCommentsEpic,
  createInstagramCommentsEpic,
  deleteInstagramCommentsEpic, // utils
  fetchURLPreviewEpic,
  markAsReadEpic,
  fetchWhatsAppMessagesEpic,
  createWhatsAppMessageEpic,
} from './conversationEpic';
import {
  fetchCustomerFieldsEpic,
  createCustomerFieldEpic,
  getCustomerFieldEpic,
  updateCustomerFieldEpic,
  deleteCustomerFieldEpic,
  checkCustomerFieldKeyValidationEpic,
  addCustomerFieldDataEpic,
  updateCustomerFieldDataEpic,
  getCustomerFieldDataListEpic,
} from './customerFieldsEpic';
import { fetchCustomersEpic, fetchCustomerEpic, fetchCustomerTicketsEpic } from './customersEpic';
import {
  deskAuthenticationEpic,
  updateProjectEpic,
  updateOperationHoursEpic,
  fetchApiTokensEpic,
  createApiTokenEpic,
  deleteApiTokenEpic,
} from './deskEpic';
import {
  facebookAddPagesEpic,
  facebookLoadPagesEpic,
  facebookSubscribeEpic,
  facebookActivePagesEpic,
  facebookUnsubscribeEpic,
  facebookUpdatePageSettingsEpic,
} from './integrationsEpic';
import {
  fetchTicketDetailTicketEpic,
  fetchTicketDetailHeaderEpic,
  fetchTicketDetailMessagesEpic,
} from './ticketDetailEpic';
import {
  fetchTicketFieldsEpic,
  createTicketFieldEpic,
  deleteTicketFieldEpic,
  getTicketFieldEpic,
  updateTicketFieldEpic,
  getTicketFieldDataListEpic,
  addTicketFieldDataEpic,
  updateTicketFieldDataEpic,
  checkTicketFieldKeyValidationEpic,
} from './ticketFieldsEpic';
import { fetchTicketHistoryMessagesEpic } from './ticketHistoryEpic';
import {
  fetchTicketsEpic,
  closeTicketEpic,
  forceAssignEpic,
  transferTicketEpic,
  reopenTicketEpic,
  assignTicketToAgentGroupEpic,
  moveTicketToIdleEpic,
} from './ticketsEpic';
import { fetchTwitterUserDetailEpic, followTwitterUserEpic, unfollowTwitterUserEpic } from './twitterEpic';
import { addWebhookEpic, fetchWebhooksEpic, editWebhookEpic, getSignatureEpic } from './webhooksEpic';

export const deskEpics = combineEpics(
  // desk
  deskAuthenticationEpic,
  updateProjectEpic,
  updateOperationHoursEpic,
  fetchApiTokensEpic,
  createApiTokenEpic,
  deleteApiTokenEpic,

  // conversatoin
  fetchConversationEpic,
  moveTicketToWIPEpic,
  assignTicketToMyselfEpic,
  updateConversationTicketAssignmentEpic,
  fetchConversationMessagesEpic,
  fetchFacebookMessagesEpic,
  sendFacebookMessageEpic,
  fetchFacebookFeedsEpic,
  createFacebookFeedEpic,
  editFacebookFeedEpic,
  deleteFacebookFeedEpic,
  facebookFeedLikeEpic,
  facebookFeedUnlikeEpic,
  fetchTwitterDirectMessagesEpic,
  createTwitterDirectMessageEventEpic,
  deleteTwitterDirectMessageEventEpic,
  fetchTwitterStatusesEpic,
  createTwitterStatusEpic,
  patchTwitterStatusEpic,
  patchTwitterStatusTwitterUserEpic,
  fetchWhatsAppMessagesEpic,
  createWhatsAppMessageEpic,
  markAsReadEpic,
  // utils
  fetchURLPreviewEpic,

  // ticketDetail
  fetchTicketDetailTicketEpic,
  fetchTicketDetailHeaderEpic,
  fetchTicketDetailMessagesEpic,

  // ticketHistory
  fetchTicketHistoryMessagesEpic,

  // tickets
  fetchTicketsEpic,
  closeTicketEpic,
  forceAssignEpic,
  transferTicketEpic,
  reopenTicketEpic,
  assignTicketToAgentGroupEpic,
  moveTicketToIdleEpic,

  // agent group
  fetchAgentGroupsEpic,
  fetchAgentGroupEpic,
  fetchCurrentAgentsEpic,
  createAgentGroupEpic,
  updateAgentGroupEpic,
  deleteAgentGroupEpic,

  // customers
  fetchCustomersEpic,
  fetchCustomerEpic,
  fetchCustomerTicketsEpic,

  // ticketField
  fetchTicketFieldsEpic,
  createTicketFieldEpic,
  deleteTicketFieldEpic,
  getTicketFieldEpic,
  updateTicketFieldEpic,
  getTicketFieldDataListEpic,
  addTicketFieldDataEpic,
  updateTicketFieldDataEpic,
  checkTicketFieldKeyValidationEpic,

  // customerField
  fetchCustomerFieldsEpic,
  createCustomerFieldEpic,
  getCustomerFieldEpic,
  updateCustomerFieldEpic,
  deleteCustomerFieldEpic,
  checkCustomerFieldKeyValidationEpic,
  getCustomerFieldDataListEpic,
  addCustomerFieldDataEpic,
  updateCustomerFieldDataEpic,

  // integration
  facebookAddPagesEpic,
  facebookLoadPagesEpic,
  facebookSubscribeEpic,
  facebookUnsubscribeEpic,
  facebookActivePagesEpic,
  facebookUpdatePageSettingsEpic,

  // webhooks
  addWebhookEpic,
  fetchWebhooksEpic,
  editWebhookEpic,
  getSignatureEpic,

  // twiiter
  fetchTwitterUserDetailEpic,
  followTwitterUserEpic,
  unfollowTwitterUserEpic,

  // instagram
  fetchInstagramCommentsEpic,
  createInstagramCommentsEpic,
  deleteInstagramCommentsEpic,
);
