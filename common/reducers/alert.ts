import { AlertStatus } from 'feather';

import { Actions } from '@actions';
import { AlertActionTypes } from '@actions/types';

const initialState: AlertState = {
  show: false,
  status: AlertStatus.PRIMARY,
  message: '',
};

export const alertReducer = (state: AlertState = initialState, action: Actions): AlertState => {
  switch (action.type) {
    case AlertActionTypes.INIT:
      return {
        show: false,
        status: action.payload.status,
        message: action.payload.message,
      };

    case AlertActionTypes.SHOW_ALERT:
      return {
        ...state,
        show: true,
        message: action.payload && action.payload.message ? action.payload.message : state.message,
      };

    case AlertActionTypes.HIDE_ALERT:
      return {
        ...state,
        show: false,
      };

    default:
      return state;
  }
};
