import { ApplicationActionTypes, SettingsActionTypes } from '@actions/types';

const initialState: CommonState['applicationUpdate'] = null;

export const applicationUpdateReducer: Reducer<CommonState['applicationUpdate']> = (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.CREATE_APP_SUCCESS:
    case ApplicationActionTypes.CHANGE_APP_NAME_SUCCESS:
    case SettingsActionTypes.DELETE_APPLICATION_SUCCESS:
      return action;

    default:
      return state;
  }
};
