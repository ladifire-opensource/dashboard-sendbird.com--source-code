import { AlertStatus } from 'feather';

import { createAction } from '@actions/createAction';
import { AlertActionTypes } from '@actions/types';

export const AlertActions = {
  initAlert: (payload: { status: AlertStatus; message: AlertState['message'] }) =>
    createAction(AlertActionTypes.INIT, payload),
  showAlert: (payload: { message: AlertState['message'] }) => createAction(AlertActionTypes.SHOW_ALERT, payload),
  hideAlert: () => createAction(AlertActionTypes.HIDE_ALERT),
};
