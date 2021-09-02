import { combineEpics } from 'redux-observable';

import * as applicationEpic from './applicationEpic';
import * as overviewEpic from './overviewEpic';
import * as sdkUserEpic from './sdkUserEpic';
import * as settingsEpic from './settingsEpic';

export const coreEpics = combineEpics(
  ...Object.values(overviewEpic).filter((epic) => typeof epic === 'function'),
  ...Object.values(applicationEpic).filter((epic) => typeof epic === 'function'),
  ...Object.values(settingsEpic).filter((epic) => typeof epic === 'function'),
  ...Object.values(sdkUserEpic).filter((epic) => typeof epic === 'function'),
);
