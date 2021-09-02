import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, tap, catchError, ignoreElements } from 'rxjs/operators';

import { NotificationsActionTypes } from '@actions/types';
import { CLOUD_FRONT_URL } from '@constants';
import { logException } from '@utils/logException';

export const addNotificationsEpic: SBEpic<AddNotificationsAction> = (action$) => {
  return action$.pipe(
    ofType(NotificationsActionTypes.ADD_NOTIFICATIONS_REQUEST),
    mergeMap((action) => {
      const { status, message } = action.payload;
      toast.open({ status, message });
      return of();
    }),
  );
};

export const addDesktopNotificationsEpic: SBEpic<AddDesktopNotificationsAction> = (action$) => {
  return action$.pipe(
    ofType(NotificationsActionTypes.ADD_DESKTOP_NOTIFICATIONS_REQUEST),
    tap((action) => {
      const title = action.payload.title ? action.payload.title : '';
      const body = action.payload.body ? action.payload.body : '';
      const icon = action.payload.icon ? action.payload.icon : `${CLOUD_FRONT_URL}/favicon/apple-icon-180x180.png`;

      const notification = new Notification(title, {
        body,
        icon,
      });
      setTimeout(() => {
        if (notification && typeof notification.close === 'function') {
          notification.close();
        }
      }, 5000);
      notification.onclick = () => {
        try {
          window.parent.focus();
          if (action.payload.callback) {
            action.payload.callback();
          }
        } catch (error) {
          logException({ error });
        }
      };
    }),
    ignoreElements(),
    catchError((error) => {
      logException({ error });
      return from([]);
    }),
  );
};
