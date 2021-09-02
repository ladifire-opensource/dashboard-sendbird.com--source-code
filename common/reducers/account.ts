import { Actions } from '@actions';
import { AccountActionTypes } from '@actions/types';

const initialState: AccountState = {
  isFetching: false,
  isFetchingUnregister: false,
};

export const accountReducer = (state: AccountState = initialState, action: Actions): AccountState => {
  switch (action.type) {
    case AccountActionTypes.CHANGE_PASSWORD_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case AccountActionTypes.CHANGE_PASSWORD_SUCCESS:
    case AccountActionTypes.CHANGE_PASSWORD_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case AccountActionTypes.UNREGISTER_REQUEST:
      return {
        ...state,
        isFetchingUnregister: true,
      };
    case AccountActionTypes.UNREGISTER_SUCCESS:
    case AccountActionTypes.UNREGISTER_FAIL:
      return {
        ...state,
        isFetchingUnregister: false,
      };
    default:
      return state;
  }
};
