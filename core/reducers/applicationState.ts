import { AuthenticationActionTypes, ApplicationActionTypes } from '@actions/types';

const initialState: ApplicationState = {
  isFetching: false,
  applicationSummary: null,
  data: null,
};

const patchApplicationName = <T extends Application | ApplicationSummary>(
  application: T | null,
  params: { app_id: string; app_name: string },
) => {
  if (application?.app_id === params.app_id) {
    return { ...application, app_name: params.app_name };
  }
  return application;
};

export const applicationStateReducer: Reducer<ApplicationState> = (state = initialState, action) => {
  switch (action.type) {
    case ApplicationActionTypes.FETCH_APPLICATION_REQUEST:
      return {
        ...state,
        isFetching: true,
        applicationSummary: action.payload.applicationSummary || state.applicationSummary,
      };

    case ApplicationActionTypes.FETCH_APPLICATION_SUCCESS:
      return { ...state, isFetching: false, data: action.payload };

    case ApplicationActionTypes.FETCH_APPLICATION_FAIL:
    case ApplicationActionTypes.FETCH_APPLICATION_CANCEL:
      return { ...state, isFetching: false, applicationSummary: null };

    case ApplicationActionTypes.SET_APPLICATION_REQUEST:
      return { ...state, data: action.payload };

    case ApplicationActionTypes.UPDATE_APPLICATION_ATTRIBUTES:
      return {
        ...state,
        data: state.data && { ...state.data, attrs: { ...state.data.attrs, ...action.payload } },
      };

    case ApplicationActionTypes.CHANGE_APP_NAME_SUCCESS: {
      const updates = {
        applicationSummary: patchApplicationName(state.applicationSummary, action.payload),
        data: patchApplicationName(state.data, action.payload),
      };

      if (updates.applicationSummary === state.applicationSummary && updates.data === state.data) {
        return state;
      }
      return {
        ...state,
        applicationSummary: patchApplicationName(state.applicationSummary, action.payload),
        data: patchApplicationName(state.data, action.payload),
      };
    }

    case ApplicationActionTypes.RESET_APPLICATION_SUCCESS:
      return initialState;

    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;

    case ApplicationActionTypes.REGISTER_CALLS_APPLICATION:
      return {
        ...state,
        applicationSummary: state.applicationSummary ? { ...state.applicationSummary, is_calls_enabled: true } : null,
        data: state.data
          ? {
              ...state.data,
              attrs: {
                ...state.data.attrs,
                sendbird_calls: {
                  ...state.data.attrs.sendbird_calls,
                  enabled: true,
                },
              },
            }
          : null,
      };

    default:
      return state;
  }
};
