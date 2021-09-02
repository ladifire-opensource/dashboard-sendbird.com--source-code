import { applicationStateReducer } from './applicationState';
import { moderationsReducer } from './moderations';
import { overviewReducer } from './overview';
import { settingsReducer } from './settings';

export const coreReducers = {
  overview: overviewReducer,
  applicationState: applicationStateReducer,
  moderations: moderationsReducer,
  settings: settingsReducer,
};
