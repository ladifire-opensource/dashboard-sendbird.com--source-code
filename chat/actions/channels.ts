import { createAction } from '@actions/createAction';
import { ChannelsActionTypes } from '@actions/types';

export const ChannelsActions: ChannelsActionCreators = {
  createOpenChannelRequest: (payload) => createAction(ChannelsActionTypes.CREATE_OPEN_CHANNEL_REQUEST, payload),
  createOpenChannelSuccess: (payload) => createAction(ChannelsActionTypes.CREATE_OPEN_CHANNEL_SUCCESS, payload),
  createOpenChannelFail: (payload) => createAction(ChannelsActionTypes.CREATE_OPEN_CHANNEL_FAIL, payload),
  createOpenChannelCancel: () => createAction(ChannelsActionTypes.CREATE_OPEN_CHANNEL_CANCEL),

  fetchMetadataRequest: (payload) => createAction(ChannelsActionTypes.FETCH_METADATA_REQUEST, payload),
  fetchMetadataSuccess: (payload) => createAction(ChannelsActionTypes.FETCH_METADATA_SUCCESS, payload),
  fetchMetadataFail: (payload) => createAction(ChannelsActionTypes.FETCH_METADATA_FAIL, payload),
  fetchMetadataCancel: () => createAction(ChannelsActionTypes.FETCH_METADATA_CANCEL),

  setMetadataRequest: (payload) => createAction(ChannelsActionTypes.SET_METADATA_REQUEST, payload),
  setMetadataSuccess: () => createAction(ChannelsActionTypes.SET_METADATA_SUCCESS),
  setMetadataFail: (payload) => createAction(ChannelsActionTypes.SET_METADATA_FAIL, payload),
  setMetadataCancel: () => createAction(ChannelsActionTypes.SET_METADATA_CANCEL),

  deleteChannelsRequest: (payload) => createAction(ChannelsActionTypes.DELETE_CHANNELS_REQUEST, payload),
  deleteChannelsSuccess: () => createAction(ChannelsActionTypes.DELETE_CHANNELS_SUCCESS),
  deleteChannelsFail: (payload) => createAction(ChannelsActionTypes.DELETE_CHANNELS_FAIL, payload),
  deleteChannelsCancel: () => createAction(ChannelsActionTypes.DELETE_CHANNELS_CANCEL),

  fetchOpenChannelsRequest: (payload) => createAction(ChannelsActionTypes.FETCH_OPEN_CHANNELS_REQUEST, payload),
  fetchOpenChannelsSuccess: (payload) => createAction(ChannelsActionTypes.FETCH_OPEN_CHANNELS_SUCCESS, payload),
  fetchOpenChannelsFail: (payload) => createAction(ChannelsActionTypes.FETCH_OPEN_CHANNELS_FAIL, payload),

  fetchGroupChannelsRequest: (payload) => createAction(ChannelsActionTypes.FETCH_GROUP_CHANNELS_REQUEST, payload),
  fetchGroupChannelsSuccess: (payload) => createAction(ChannelsActionTypes.FETCH_GROUP_CHANNELS_SUCCESS, payload),
  fetchGroupChannelsFail: (payload) => createAction(ChannelsActionTypes.FETCH_GROUP_CHANNELS_FAIL, payload),

  searchOpenChannelsRequest: (payload) => createAction(ChannelsActionTypes.SEARCH_OPEN_CHANNELS_REQUEST, payload),
  searchOpenChannelsSuccess: (payload) => createAction(ChannelsActionTypes.SEARCH_OPEN_CHANNELS_SUCCESS, payload),
  searchOpenChannelsFail: (payload) => createAction(ChannelsActionTypes.SEARCH_OPEN_CHANNELS_FAIL, payload),

  searchGroupChannelsRequest: (payload) => createAction(ChannelsActionTypes.SEARCH_GROUP_CHANNELS_REQUEST, payload),
  searchGroupChannelsSuccess: (payload) => createAction(ChannelsActionTypes.SEARCH_GROUP_CHANNELS_SUCCESS, payload),
  searchGroupChannelsFail: (payload) => createAction(ChannelsActionTypes.SEARCH_GROUP_CHANNELS_FAIL, payload),

  fetchOpenChannelRequest: (payload) => createAction(ChannelsActionTypes.FETCH_OPEN_CHANNEL_REQUEST, payload),
  fetchOpenChannelSuccess: (payload) => createAction(ChannelsActionTypes.FETCH_OPEN_CHANNEL_SUCCESS, payload),
  fetchOpenChannelFail: (payload) => createAction(ChannelsActionTypes.FETCH_OPEN_CHANNEL_FAIL, payload),

  setCurrentOpenChannel: (payload) => createAction(ChannelsActionTypes.SET_CURRENT_OPEN_CHANNEL, payload),

  fetchGroupChannelRequest: (payload) => createAction(ChannelsActionTypes.FETCH_GROUP_CHANNEL_REQUEST, payload),
  fetchGroupChannelFail: (payload) => createAction(ChannelsActionTypes.FETCH_GROUP_CHANNEL_FAIL, payload),

  setCurrentGroupChannel: (payload) => createAction(ChannelsActionTypes.SET_CURRENT_GROUP_CHANNEL, payload),

  setOpenChannelSearchQuery: (payload) => createAction(ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_QUERY, payload),
  setOpenChannelSearchState: (payload) => createAction(ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_STATE, payload),
  setOpenChannelSearchSuccess: (payload) => createAction(ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_SUCCESS, payload),
  setOpenChannelSearchOption: (payload) => createAction(ChannelsActionTypes.SET_OPEN_CHANNEL_SEARCH_OPTION, payload),
  resetOpenChannelsSearch: () => createAction(ChannelsActionTypes.RESET_OPEN_CHANNELS_SEARCH),

  setGroupChannelSearchQuery: (payload) => createAction(ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_QUERY, payload),
  setGroupChannelSearchState: (payload) => createAction(ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_STATE, payload),
  setGroupChannelSearchSuccess: (payload) =>
    createAction(ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_SUCCESS, payload),
  setGroupChannelSearchOption: (payload) => createAction(ChannelsActionTypes.SET_GROUP_CHANNEL_SEARCH_OPTION, payload),
  resetGroupChannelsSearch: () => createAction(ChannelsActionTypes.RESET_GROUP_CHANNELS_SEARCH),

  setGroupChannelShowEmptyChannels: (payload) =>
    createAction(ChannelsActionTypes.SET_GROUP_CHANNEL_SHOW_EMPTY_CHANNELS, payload),

  updateOpenChannelInList: (payload) => createAction(ChannelsActionTypes.UPDATE_OPEN_CHANNEL_IN_LIST, payload),

  updateGroupChannelInList: (payload) => createAction(ChannelsActionTypes.UPDATE_GROUP_CHANNEL_IN_LIST, payload),

  goToModeration: (payload) => createAction(ChannelsActionTypes.GO_TO_MODERATION, payload),
};
