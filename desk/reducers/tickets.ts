import moment from 'moment-timezone';

import { AuthenticationActionTypes, DeskActionTypes, TicketsActionTypes } from '@actions/types';
import { TicketStatus } from '@constants';

const defaultRefreshItem = {
  label: '10 Seconds',
  seconds: 10,
};

const initialState: TicketsState = {
  isFetching: false,
  /** @deprecated */
  // parameters: '&status=ASSIGNED&status=UNASSIGNED&status=CLOSED', // ALL
  filter: {
    status: {
      value: TicketStatus.ALL,
      label: 'All tickets',
    },
    assignee: {
      displayName: 'All agents',
      email: '',
    } as Agent,
    channelType: '',
    date: {
      startDate: moment().subtract(14, 'day'),
      endDate: moment(),
    },
  },
  items: [],
  pagination: {
    limit: 20,
    offset: 0,
    count: 0,
    page: 1,
  },
  refresh: {
    isAutomatic: false,
    automaticItem: defaultRefreshItem,
  },
};

export const ticketsReducer: Reducer<TicketsState> = (state = initialState, action) => {
  switch (action.type) {
    case TicketsActionTypes.FETCH_TICKETS_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case TicketsActionTypes.FETCH_TICKETS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        items: action.payload.items,
        filter: { ...action.payload.filter },
        pagination: {
          limit: action.payload.limit,
          offset: action.payload.offset,
          count: action.payload.count,
          page: action.payload.offset / action.payload.limit + 1,
        },
      };
    case TicketsActionTypes.SET_TICKETS_REFRESH_AUTOMATIC:
      return {
        ...state,
        refresh: {
          ...state.refresh,
          isAutomatic: action.payload,
        },
      };
    case TicketsActionTypes.SET_TICKETS_REFRESH_AUTOMATIC_ITEM:
      return {
        ...state,
        refresh: {
          ...state.refresh,
          automaticItem: action.payload,
        },
      };
    case TicketsActionTypes.UPDATE_TICKETS_ITEM:
      return {
        ...state,
        items: state.items.map((item) => {
          if (item.id === action.payload.id) {
            return action.payload;
          }
          return item;
        }),
      };
    case DeskActionTypes.INITIALIZE_DATE_FILTERS:
      return {
        ...state,
        filter: {
          ...state.filter,
          date: {
            startDate: moment().subtract(14, 'day'),
            endDate: moment(),
          },
        },
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
    case DeskActionTypes.RESET_DESK:
      return initialState;
    default:
      return state;
  }
};
