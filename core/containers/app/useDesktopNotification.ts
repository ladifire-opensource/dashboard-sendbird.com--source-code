import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { commonActions } from '@actions';
import { NOTIFICATION_PERMISSION } from '@constants';
import { isDesktopNotificationSupported, checkIfDesktopNotificationGranted } from '@utils';

export const useDesktopNotification = () => {
  const dispatch = useDispatch();
  const isDesktopNotificationGranted = useSelector(
    (state: RootState) => state.configuration.isDesktopNotificationGranted,
  );

  useEffect(() => {
    if (!isDesktopNotificationSupported()) {
      return;
    }

    if (checkIfDesktopNotificationGranted()) {
      if (isDesktopNotificationGranted !== NOTIFICATION_PERMISSION.GRANTED) {
        dispatch(commonActions.setDesktopNotificationGranted(NOTIFICATION_PERMISSION.GRANTED));
      }
    } else {
      Notification.requestPermission((permission) => {
        dispatch(commonActions.setDesktopNotificationGranted(permission));
      });
    }
  }, [dispatch, isDesktopNotificationGranted]);
};
