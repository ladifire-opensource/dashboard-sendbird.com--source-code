import { AuthenticationActionTypes, ChannelsActionTypes, ModerationsActionTypes } from '@actions/types';
import { OpenChannelSearchOperator } from '@constants';

const initialModerationState = {
  isEntered: false,
  scrollLock: false,
  isFetchingChannel: true,
  current: null,
  isFetchingMessages: true,
  messages: [],
  preservedMessages: [],
  participants: [],
  bannedList: [],
  mutedList: [],
};

const initialState: OpenChannelsState = {
  channels: [],
  next: '',

  isFetching: true,
  isFetchingLoadMore: false,

  search: {
    option: OpenChannelSearchOperator.nameContains,
    query: '',
    isSearching: false,
    isSuccess: false,
  },

  // moderation
  ...initialModerationState,
};

export const openChannelsReducer: Reducer<OpenChannelsState> = (state = initialState, action) => {
  switch (action.type) {
    case ChannelsActionTypes.FETCH_OPEN_CHANNELS_REQUEST:
      if (action.payload.init) {
        return {
          ...state,
          isFetching: true,
        };
      }
      return {
        ...state,
        isFetchingLoadMore: true,
      };

    case ChannelsActionTypes.FETCH_OPEN_CHANNELS_SUCCESS:
      return {
        ...state,
        channels: action.payload.init ? action.payload.channels : state.channels.concat(action.payload.channels),
        next: action.payload.next,
        isFetching: false,
        isFetchingLoadMore: false,
      };
    case ChannelsActionTypes.SEARCH_OPEN_CHANNELS_REQUEST:
      return {
        ...state,
        isFetching: true,
        search: {
          ...state.search,
          query: action.payload.query,
          option: action.payload.option,
          isSearching: true,
          isSuccess: false,
        },
      };
    case ChannelsActionTypes.SEARCH_OPEN_CHANNELS_SUCCESS:
      return {
        ...state,
        channels: action.payload.init ? action.payload.channels : state.channels.concat(action.payload.channels),
        next: action.payload.next,
        isFetching: false,
        isFetchingLoadMore: false,
        search: {
          ...state.search,
          query: action.payload.query,
          isSearching: false,
          isSuccess: true,
        },
      };
    case ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_OPTION:
      return {
        ...state,
        search: {
          ...state.search,
          option: action.payload,
        },
      };
    case ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_QUERY:
      return {
        ...state,
        search: {
          ...state.search,
          query: action.payload,
          isSuccess: false,
        },
      };
    case ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_STATE:
      return {
        ...state,
        search: {
          ...state.search,
          isSearching: action.payload,
        },
      };
    case ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_SUCCESS:
      return {
        ...state,
        search: {
          ...state.search,
          isSearching: false,
          isSuccess: action.payload,
        },
      };
    case ChannelsActionTypes.RESET_OPEN_CHANNELS_SEARCH:
      return {
        ...state,
        search: initialState.search,
      };
    case ChannelsActionTypes.SET_CURRENT_OPEN_CHANNEL:
      return {
        ...state,
        isFetchingChannel: false,
        current: { ...action.payload },
      };
    case ChannelsActionTypes.UPDATE_OPEN_CHANNEL_IN_LIST:
      return {
        ...state,
        channels: state.channels.map((channel) => {
          if (action.payload && channel.channel_url === action.payload.channel_url) {
            return action.payload;
          }
          return channel;
        }),
      };
    case ModerationsActionTypes.UPDATE_OPEN_CHANNELS_MESSAGES: {
      return {
        ...state,
        isFetchingMessages: false,
        messages: action.payload.messages,
        preservedMessages: action.payload.preservedMessages || state.preservedMessages,
      };
    }
    case ModerationsActionTypes.UPDATE_OPEN_CHANNELS_MESSAGE:
      return {
        ...state,
        messages: state.messages.map((message) => {
          if (action.payload && message.messageId === action.payload.messageId) {
            return action.payload;
          }
          return message;
        }),
      };
    case ModerationsActionTypes.DELETE_OPEN_CHANNELS_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter((message) => {
          return message.messageId !== parseInt(action.payload);
        }),
      };
    case ModerationsActionTypes.SET_PARTICIPANTS:
      if (action.payload.init) {
        return {
          ...state,
          participants: action.payload.participants,
        };
      }
      return {
        ...state,
        participants: state.participants.concat(action.payload.participants),
      };

    case ModerationsActionTypes.UNBAN_USER_SUCCESS:
      return {
        ...state,
        bannedList: state.bannedList.filter((bannedUser) => {
          return bannedUser.userId !== action.payload;
        }),
      };
    case ModerationsActionTypes.TOGGLE_OPEN_CHANNEL_SCROLL_LOCK:
      if (action.payload !== state.scrollLock) {
        return {
          ...state,
          scrollLock: action.payload,
        };
      }
      return state;
    case ModerationsActionTypes.SET_OPEN_CHANNELS_IS_ENTERED:
      return {
        ...state,
        isEntered: action.payload,
      };
    case ModerationsActionTypes.RESET_OPEN_CHANNELS:
      return initialState;
    case ModerationsActionTypes.RESET_OPEN_CHANNELS_MODERATION_DATA:
      return {
        ...state,
        ...initialModerationState,
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
