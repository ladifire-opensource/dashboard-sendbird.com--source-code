import moment from 'moment-timezone';

import { AuthenticationActionTypes, ApplicationActionTypes, MessagesActionTypes } from '@actions/types';

const initialState = {
  // boolean state
  isFetching: false,
  isSearched: false,

  activeTab: 0,

  // search options
  options: {
    channel_url: '',
    keyword: '',
    user_id: '',
    timezone: moment.tz.guess() || 'UTC',
    excludeRemoved: false,
  },

  // data
  items: [],
  token: '',
  pagination: {} as BlockPagination,
};

export const messagesReducer: Reducer<MessagesState> = (state = initialState, action) => {
  switch (action.type) {
    case MessagesActionTypes.SEARCH_MESSAGES_REQUEST:
      return {
        ...state,
        isFetching: true,
        isSearched: false,
      };
    case MessagesActionTypes.SEARCH_MESSAGES_SUCCESS:
      return {
        ...state,
        items: action.payload.messages,
        pagination: action.payload.pagination,
        token: action.payload.pagination.token,
        isFetching: false,
        isSearched: true,
      };
    case MessagesActionTypes.SET_MESSAGES_SEARCH_OPTIONS:
      return {
        ...state,
        options: action.payload,
      };
    case MessagesActionTypes.UPDATE_MESSAGE_REQUEST:
      return {
        ...state,
        items: state.items.map((message) => {
          if (action.payload && message.message_id === action.payload.message_id) {
            return action.payload;
          }
          return message;
        }),
      };
    case MessagesActionTypes.SET_MESSAGES_ACTIVE_TAB:
      return {
        ...state,
        activeTab: action.payload,
      };
    case ApplicationActionTypes.RESET_APPLICATION_SUCCESS:
    case AuthenticationActionTypes.UNAUTHENTICATED:
    case MessagesActionTypes.RESET_MESSAGES_REQUEST:
      return initialState;
    default:
      return state;
  }
};
