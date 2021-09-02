import { AuthenticationActionTypes, TicketDetailActionTypes } from '@actions/types';

const initialState: TicketDetailState = {
  isFetching: false,
  isFetchingMessages: false,
  messages: [],
  ticket: undefined,
};

export const ticketDetailReducer: Reducer<TicketDetailState> = (state = initialState, action) => {
  switch (action.type) {
    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_REQUEST:
      return {
        ...state,
        isFetching: true,
        messages: state.ticket && action.payload !== state.ticket.id ? [] : state.messages,
      };
    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_SUCCESS:
      return {
        ...state,
        isFetching: false,
        ticket: action.payload,
      };
    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_SUCCESS:
      if (state.ticket) {
        return {
          ...state,
          isFetching: false,
          ticket: {
            ...state.ticket,
            group: action.payload.group,
            recentAssignment: action.payload.recentAssignment,
            status: action.payload.status,
            status2: action.payload.status2,
            closeStatus: action.payload.closeStatus,
          },
        };
      }
      return initialState;

    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_REQUEST:
      return { ...state, isFetchingMessages: action.payload.types === 'initial' };

    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_SUCCESS: {
      const { messages, initialOrNextFetchedTimestamp } = action.payload;
      return {
        ...state,
        isFetchingMessages: false,
        messages: messages || state.messages,
        ...(initialOrNextFetchedTimestamp ? { initialOrNextFetchedTimestamp } : null),
      };
    }

    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_FAIL:
    case TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_CANCEL:
      return { ...state, isFetchingMessages: false };

    case TicketDetailActionTypes.UPDATE_TICKET_DETAIL_SENDBIRD_API_MESSAGE: {
      return {
        ...state,
        messages: state.messages.map((message: SendBirdAPIMessage) => {
          if (message.message_id === action.payload.message_id) {
            return action.payload;
          }
          return message;
        }),
      };
    }

    case TicketDetailActionTypes.UPDATE_TICKET_DETAIL:
      if (state.ticket) {
        return { ...state, ticket: { ...state.ticket, ...action.payload } };
      }
      return state;

    case TicketDetailActionTypes.RESET_TICKET_DETAIL:
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
