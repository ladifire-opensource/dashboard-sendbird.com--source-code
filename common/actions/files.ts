import { createAction } from '@actions/createAction';
import { FilesActionTypes } from '@actions/types';

export const FilesActions = {
  fileSaveRequest: (payload: {
    type?: string; // ex 'text/csv;charset=utf-8',
    data: any;
    filename: string;
  }) => createAction(FilesActionTypes.FILE_SAVE_REQUEST, payload),
  fileSaveSuccess: (payload) => createAction(FilesActionTypes.FILE_SAVE_SUCCESS, payload),
};
