import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import { chatReducers } from './chat/reducers';
import { commonReducers } from './common/reducers';
import { coreReducers } from './core/reducers';
import { deskReducers } from './desk/reducers';

export const createRootReducer = (history) =>
  combineReducers({
    ...commonReducers,
    ...coreReducers,
    ...chatReducers,
    ...deskReducers,
    router: connectRouter(history),
  });
