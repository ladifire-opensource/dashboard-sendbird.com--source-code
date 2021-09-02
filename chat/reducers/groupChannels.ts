import {
  ApplicationActionTypes,
  AuthenticationActionTypes,
  ChannelsActionTypes,
  ModerationsActionTypes,
} from '@actions/types';
import { GroupChannelSearchOperator } from '@constants';

const initialState: GroupChannelsState = Object.freeze({
  channels: [],
  next: '',

  scrollLock: false,
  current: null,

  isFetching: true,

  isFetchingChannel: true,
  isFetchingLoadMore: false,

  search: {
    option: GroupChannelSearchOperator.nicknameEquals,
    query: '',
    isSearching: false,
    isSuccess: false,
  },
  showEmptyChannels: true,
});

export const groupChannelsReducer: Reducer<GroupChannelsState> = (state = initialState, action) => {
  switch (action.type) {
    case ChannelsActionTypes.FETCH_GROUP_CHANNELS_REQUEST:
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

    case ChannelsActionTypes.FETCH_GROUP_CHANNELS_SUCCESS:
      return {
        ...state,
        channels: action.payload.init ? action.payload.channels : state.channels.concat(action.payload.channels),
        next: action.payload.next,
        isFetching: false,
        isFetchingLoadMore: false,
      };
    case ChannelsActionTypes.SEARCH_GROUP_CHANNELS_REQUEST:
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
    case ChannelsActionTypes.SEARCH_GROUP_CHANNELS_SUCCESS:
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
    case ChannelsActionTypes.FETCH_GROUP_CHANNEL_REQUEST:
      return {
        ...state,
        isFetchingChannel: true,
      };
    case ChannelsActionTypes.SET_CURRENT_GROUP_CHANNEL:
      return {
        ...state,
        isFetchingChannel: false,
        channels: state.channels.some((channel) => channel.channel_url === action.payload.channel_url)
          ? state.channels.map((channel) =>
              channel.channel_url === action.payload.channel_url ? action.payload : channel,
            )
          : state.channels,
        current: action.payload,
      };
    case ChannelsActionTypes.UPDATE_GROUP_CHANNEL_IN_LIST:
      return {
        ...state,
        channels: state.channels.map((channel) => {
          if (action.payload && channel.channel_url === action.payload.channel_url) {
            return action.payload;
          }
          return channel;
        }),
      };
    case ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_OPTION:
      return {
        ...state,
        search: {
          ...state.search,
          option: action.payload,
        },
      };
    case ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_QUERY:
      return {
        ...state,
        search: {
          ...state.search,
          query: action.payload,
        },
      };
    case ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_STATE:
      return {
        ...state,
        search: {
          ...state.search,
          isSearching: action.payload,
        },
      };
    case ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_SUCCESS:
      return {
        ...state,
        search: {
          ...state.search,
          isSearching: false,
          isSuccess: action.payload,
        },
      };
    case ChannelsActionTypes.RESET_GROUP_CHANNELS_SEARCH:
      return {
        ...state,
        search: initialState.search,
      };

    case ChannelsActionTypes.SET_GROUP_CHANNEL_SHOW_EMPTY_CHANNELS:
      return { ...state, showEmptyChannels: action.payload };

    case ModerationsActionTypes.TOGGLE_GROUP_CHANNEL_SCROLL_LOCK:
      return {
        ...state,
        scrollLock: action.payload,
      };
    case ModerationsActionTypes.RESET_GROUP_CHANNELS:
    case ApplicationActionTypes.RESET_APPLICATION_SUCCESS:
      return initialState;
    case ModerationsActionTypes.RESET_GROUP_CHANNELS_MODERATION_DATA:
      return {
        ...state,
        current: null,
        scrollLock: false,
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
