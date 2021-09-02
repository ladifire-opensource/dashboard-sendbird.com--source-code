import { createAction } from '@actions/createAction';
import { TicketHistoryActionTypes } from '@actions/types';

export const TicketHistoryActions: TicketHistoryActionCreators = {
  fetchTicketHistoryMessagesRequest: (payload) =>
    createAction(TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_REQUEST, payload),
  fetchTicketHistoryMessagesSuccess: (payload) =>
    createAction(TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_SUCCESS, payload),
  fetchTicketHistoryMessagesFail: (payload) =>
    createAction(TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_FAIL, payload),
  fetchTicketHistoryMessagesCancel: () => createAction(TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_CANCEL),

  setTicketHistoryCurrent: (payload) => createAction(TicketHistoryActionTypes.SET_TICKET_HISTORY_CURRENT, payload),

  resetTicketHistory: () => createAction(TicketHistoryActionTypes.RESET_TICKET_HISTORY),
  resetTicketHistoryCurrent: () => createAction(TicketHistoryActionTypes.RESET_TICKET_HISTORY_CURRENT),
};
