import { ofType } from 'redux-observable';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { commonActions } from '@actions';
import { DialogsActionTypes } from '@actions/types';

export const showDialogsEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(DialogsActionTypes.SHOW_DIALOGS_REQUEST),
    mergeMap((action) => of(commonActions.showDialogsSuccess(action.payload))),
  );
};

export const hideDialogsEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(DialogsActionTypes.HIDE_DIALOGS_REQUEST),
    mergeMap(() => of(commonActions.hideDialogsSuccess())),
  );
};
