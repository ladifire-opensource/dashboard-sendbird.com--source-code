import { createAction } from '@actions/createAction';
import { ConfigurationsActionTypes } from '@actions/types';

export const ConfigurationsActions = {
  setDesktopNotificationGranted: (payload) =>
    createAction(ConfigurationsActionTypes.SET_DESKTOP_NOTIFICATION_GRANTED, payload),
};
