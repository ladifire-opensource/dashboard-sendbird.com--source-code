import { groupChannelsReducer } from './groupChannels';
import { messagesReducer } from './messages';
import { openChannelsReducer } from './openChannels';

export const chatReducers = {
  openChannels: openChannelsReducer,
  groupChannels: groupChannelsReducer,
  messages: messagesReducer,
};
