import { saveAs } from 'file-saver';
import { ofType } from 'redux-observable';
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { commonActions } from '@actions';
import { FilesActionTypes } from '@actions/types';

export const fileSaveEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType<ReturnType<typeof commonActions.fileSaveRequest>>(FilesActionTypes.FILE_SAVE_REQUEST),
    mergeMap((action) => {
      const { data, filename, type } = action.payload;
      const csvBlob = new Blob([data], {
        type: type || 'text/csv;charset=utf-8',
      });
      saveAs(csvBlob, filename);
      return from([commonActions.fileSaveSuccess({})]);
    }),
  );
};
