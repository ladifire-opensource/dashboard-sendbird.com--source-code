import { AuthenticationActionTypes, DeskActionTypes } from '@actions/types';

const initialState = {
  isGeneralFetching: false,
  isAutoTriggeredFetching: false,
  isOperatingHoursFetching: false,
  isMacrosFetching: false,
};

export const deskSettingsReducer = (state: DeskSettingsState = initialState, action) => {
  switch (action.type) {
    case DeskActionTypes.UPDATE_PROJECT_REQUEST: {
      return {
        ...state,
        isGeneralFetching: true,
        isAutoTriggeredFetching: true,
      };
    }
    case DeskActionTypes.UPDATE_OPERATION_HOURS_REQUEST: {
      return {
        ...state,
        isOperatingHoursFetching: true,
      };
    }
    case DeskActionTypes.UPDATE_PROJECT_SUCCESS: {
      return {
        ...state,
        isGeneralFetching: false,
        isAutoTriggeredFetching: false,
      };
    }
    case DeskActionTypes.UPDATE_OPERATION_HOURS_SUCCESS: {
      return {
        ...state,
        isOperatingHoursFetching: false,
      };
    }
    case 'EPIC_END':
    case DeskActionTypes.UPDATE_PROJECT_FAIL: {
      return {
        ...state,
        isGeneralFetching: false,
        isAutoTriggeredFetching: false,
      };
    }
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
