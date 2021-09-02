import { NOTIFICATION_PERMISSION } from '@constants';

export const isDesktopNotificationSupported = () => 'Notification' in window && Notification;

export const checkIfDesktopNotificationGranted = () => {
  if (isDesktopNotificationSupported()) {
    const notificationPermission = Notification.permission || Notification.prototype['permission'];
    return notificationPermission === NOTIFICATION_PERMISSION.GRANTED;
  }
  return false;
};
