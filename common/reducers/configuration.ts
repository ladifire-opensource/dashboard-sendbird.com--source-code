import { ConfigurationsActionTypes } from '@actions/types';

const initialState = {
  isDesktopNotificationGranted: 'default',
};

export const configurationReducer: Reducer<ConfigurationState> = (state = initialState, action) => {
  switch (action.type) {
    case ConfigurationsActionTypes.SET_DESKTOP_NOTIFICATION_GRANTED:
      return { ...state, isDesktopNotificationGranted: action.payload };

    default:
      return state;
  }
};
