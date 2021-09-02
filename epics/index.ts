import { combineEpics } from 'redux-observable';

import { chatEpics } from '@chat/epics';
import { commonEpics } from '@common/epics';
import { coreEpics } from '@core/epics';
import { deskEpics } from '@desk/epics';

export * from './generateBadRequest';
export * from './withCurrentApplication';

export const rootEpic = combineEpics(chatEpics, commonEpics, coreEpics, deskEpics);
