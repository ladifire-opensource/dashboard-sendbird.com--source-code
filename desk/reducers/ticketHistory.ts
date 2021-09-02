import { AuthenticationActionTypes, TicketHistoryActionTypes } from '@actions/types';

const initialState: TicketHistoryState = {
  isFetching: false,
  isFetchingInitialMessages: false,
  isFetchingPrevMessages: false,
  tickets: [],
  current: null,
  messages: [],
};

export const ticketHistoryReducer = (state: TicketHistoryState = initialState, action): TicketHistoryState => {
  switch (action.type) {
    case TicketHistoryActionTypes.SET_TICKET_HISTORY_CURRENT:
      return {
        ...state,
        current: action.payload,
      };
    case TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_REQUEST:
      return {
        ...state,
        isFetchingInitialMessages: action.payload.types === 'initial',
        isFetchingPrevMessages: action.payload.types === 'prev',
      };
    case TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_SUCCESS:
      return {
        ...state,
        isFetchingInitialMessages: false,
        isFetchingPrevMessages: false,
        messages: action.payload.messages,
      };

    case TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_CANCEL:
    case TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_FAIL:
      return { ...state, isFetchingInitialMessages: false, isFetchingPrevMessages: false };

    case TicketHistoryActionTypes.RESET_TICKET_HISTORY_CURRENT:
      return {
        ...state,
        current: null,
        messages: [],
      };
    case TicketHistoryActionTypes.RESET_TICKET_HISTORY:
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
