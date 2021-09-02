import { createAction } from '@actions/createAction';
import { TicketDetailActionTypes } from '@actions/types';

export const TicketDetailActions: TicketDetailActionCreators = {
  fetchTicketDetailTicketRequest: (ticketId) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_REQUEST, ticketId),
  fetchTicketDetailTicketSuccess: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_SUCCESS, payload),
  fetchTicketDetailTicketFail: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_FAIL, payload),
  fetchTicketDetailTicketCancel: () => createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_CANCEL),

  fetchTicketDetailHeaderRequest: (ticketId) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_REQUEST, ticketId),
  fetchTicketDetailHeaderSuccess: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_SUCCESS, payload),
  fetchTicketDetailHeaderFail: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_FAIL, payload),
  fetchTicketDetailHeaderCancel: () => createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_CANCEL),

  fetchTicketDetailMessagesRequest: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_REQUEST, payload),
  fetchTicketDetailMessagesSuccess: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_SUCCESS, payload),
  fetchTicketDetailMessagesFail: (payload) =>
    createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_FAIL, payload),
  fetchTicketDetailMessagesCancel: () => createAction(TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_CANCEL),

  updateTicketDetailSendbirdAPIMessage: (payload) =>
    createAction(TicketDetailActionTypes.UPDATE_TICKET_DETAIL_SENDBIRD_API_MESSAGE, payload),

  updateTicketDetail: (payload) => createAction(TicketDetailActionTypes.UPDATE_TICKET_DETAIL, payload),
  resetTicketDetail: () => createAction(TicketDetailActionTypes.RESET_TICKET_DETAIL),
};
