import { createAction } from '@actions/createAction';
import { NotificationsActionTypes } from '@actions/types';

export const NotificationsActions: NotificationsActionCreators = {
  addNotificationsRequest: (payload) => createAction(NotificationsActionTypes.ADD_NOTIFICATIONS_REQUEST, payload),
  addDesktopNotificationsRequest: (payload) =>
    createAction(NotificationsActionTypes.ADD_DESKTOP_NOTIFICATIONS_REQUEST, payload),
};
