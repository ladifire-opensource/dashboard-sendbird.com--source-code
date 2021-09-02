import { createAction } from '@actions/createAction';
import { DialogsActionTypes } from '@actions/types';

export const DialogsActions: DialogsActionCreators = {
  showDialogsRequest: (payload) => createAction(DialogsActionTypes.SHOW_DIALOGS_REQUEST, payload),
  showDialogsSuccess: (payload) => createAction(DialogsActionTypes.SHOW_DIALOGS_SUCCESS, payload),
  hideDialogsRequest: () => createAction(DialogsActionTypes.HIDE_DIALOGS_REQUEST),
  hideDialogsSuccess: () => createAction(DialogsActionTypes.HIDE_DIALOGS_SUCCESS),
};
