import { createAction } from '@actions/createAction';
import { TicketsActionTypes } from '@actions/types';

export const TicketsActions: TicketsActionCreators = {
  fetchTicketsRequest: (payload) => createAction(TicketsActionTypes.FETCH_TICKETS_REQUEST, payload),
  fetchTicketsSuccess: (payload) => createAction(TicketsActionTypes.FETCH_TICKETS_SUCCESS, payload),
  fetchTicketsFail: (payload) => createAction(TicketsActionTypes.FETCH_TICKETS_FAIL, payload),
  fetchTicketsCancel: () => createAction(TicketsActionTypes.FETCH_TICKETS_CANCEL),

  setTicketsSearchOn: () => createAction(TicketsActionTypes.SET_TICKETS_SEARCH_ON),
  setTicketsSearchOff: () => createAction(TicketsActionTypes.SET_TICKETS_SEARCH_OFF),
  setTicketsSearchToggle: () => createAction(TicketsActionTypes.SET_TICKETS_SEARCH_TOGGLE),
  resetTicketsSearch: (payload) => createAction(TicketsActionTypes.RESET_TICKETS_SEARCH, payload),

  setTicketsSearchQuery: (payload) => createAction(TicketsActionTypes.SET_TICKETS_SEARCH_QUERY, payload),

  setTicketsSearchSavedParameters: (payload) =>
    createAction(TicketsActionTypes.SET_TICKETS_SEARCH_SAVED_PARAMETERS, payload),

  closeTicketRequest: (payload) => createAction(TicketsActionTypes.CLOSE_TICKET_REQUEST, payload),
  closeTicketSuccess: () => createAction(TicketsActionTypes.CLOSE_TICKET_SUCCESS),
  closeTicketFail: (payload) => createAction(TicketsActionTypes.CLOSE_TICKET_FAIL, payload),
  closeTicketCancel: () => createAction(TicketsActionTypes.CLOSE_TICKET_CANCEL),

  forceAssignTicketRequest: (payload) => createAction(TicketsActionTypes.FORCE_ASSIGN_TICKET_REQUEST, payload),
  forceAssignTicketSuccess: () => createAction(TicketsActionTypes.FORCE_ASSIGN_TICKET_SUCCESS),
  forceAssignTicketFail: (payload) => createAction(TicketsActionTypes.FORCE_ASSIGN_TICKET_FAIL, payload),
  forceAssignTicketCancel: () => createAction(TicketsActionTypes.FORCE_ASSIGN_TICKET_CANCEL),

  transferTicketRequest: (payload) => createAction(TicketsActionTypes.TRANSFER_TICKET_REQUEST, payload),
  transferTicketSuccess: () => createAction(TicketsActionTypes.TRANSFER_TICKET_SUCCESS),
  transferTicketFail: (payload) => createAction(TicketsActionTypes.TRANSFER_TICKET_FAIL, payload),
  transferTicketCancel: () => createAction(TicketsActionTypes.TRANSFER_TICKET_CANCEL),

  reopenTicketRequest: (payload) => createAction(TicketsActionTypes.REOPEN_TICKET_REQUEST, payload),
  reopenTicketSuccess: () => createAction(TicketsActionTypes.REOPEN_TICKET_SUCCESS),
  reopenTicketFail: (payload) => createAction(TicketsActionTypes.REOPEN_TICKET_FAIL, payload),
  reopenTicketCancel: () => createAction(TicketsActionTypes.REOPEN_TICKET_CANCEL),

  assignTicketToAgentGroupRequest: (payload) =>
    createAction(TicketsActionTypes.ASSIGN_TICKET_TO_AGENT_GROUP_REQUEST, payload),
  assignTicketToAgentGroupSuccess: () => createAction(TicketsActionTypes.ASSIGN_TICKET_TO_AGENT_GROUP_SUCCESS),
  assignTicketToAgentGroupFail: (payload) =>
    createAction(TicketsActionTypes.ASSIGN_TICKET_TO_AGENT_GROUP_FAIL, payload),
  assignTicketToAgentGroupCancel: () => createAction(TicketsActionTypes.ASSIGN_TICKET_TO_AGENT_GROUP_CANCEL),

  setTicketsRefreshAutomatic: (payload) => createAction(TicketsActionTypes.SET_TICKETS_REFRESH_AUTOMATIC, payload),
  setTicketsRefreshAutomaticItem: (payload) =>
    createAction(TicketsActionTypes.SET_TICKETS_REFRESH_AUTOMATIC_ITEM, payload),

  moveTicketToWIPRequest: (payload) => createAction(TicketsActionTypes.MOVE_TICKET_TO_WIP_REQUEST, payload),
  moveTicketToWIPSuccess: () => createAction(TicketsActionTypes.MOVE_TICKET_TO_WIP_SUCCESS),
  moveTicketToWIPFail: (payload) => createAction(TicketsActionTypes.MOVE_TICKET_TO_WIP_FAIL, payload),

  moveTicketToIdleRequest: (payload) => createAction(TicketsActionTypes.MOVE_TICKET_TO_IDLE_REQUEST, payload),
  moveTicketToIdleSuccess: () => createAction(TicketsActionTypes.MOVE_TICKET_TO_IDLE_SUCCESS),
  moveTicketToIdleFail: (payload) => createAction(TicketsActionTypes.MOVE_TICKET_TO_IDLE_FAIL, payload),
  updateTicketsItem: (payload) => createAction(TicketsActionTypes.UPDATE_TICKETS_ITEM, payload),
};
