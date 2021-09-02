import { combineEpics } from 'redux-observable';

import * as analyticsEpic from './analyticsEpic';
import * as channelsEpic from './channelsEpic';
import * as messagesEpic from './messagesEpic';
import * as moderationsEpic from './moderationsEpic';

export const chatEpics = combineEpics(
  ...Object.values(channelsEpic).filter((epic) => typeof epic === 'function'),
  ...Object.values(moderationsEpic).filter((epic) => typeof epic === 'function'),
  ...Object.values(messagesEpic).filter((epic) => typeof epic === 'function'),
  ...Object.values(analyticsEpic).filter((epic) => typeof epic === 'function'),
);
