import { SendBirdActionTypes } from '@actions/types';

const initialState = {
  isConnected: false,
  isReconnectFailed: false,
};

export const sendbirdReducer = (state: SendBirdState = initialState, action) => {
  switch (action.type) {
    case SendBirdActionTypes.SB_CONNECT_SUCCESS:
      return {
        ...state,
        isConnected: true,
      };
    case SendBirdActionTypes.SB_CONNECT_FAIL:
    case SendBirdActionTypes.SB_DISCONNECT_FAIL:
    case SendBirdActionTypes.SB_DISCONNECT_SUCCESS:
    case SendBirdActionTypes.SB_RECONNECT_REQUEST:
      return {
        ...state,
        isConnected: false,
      };
    case SendBirdActionTypes.SB_RECONNECT_SUCCESS:
      return {
        ...state,
        isConnected: true,
        isReconnectFailed: false,
      };
    case SendBirdActionTypes.SB_RECONNECT_FAIL:
      return {
        ...state,
        isConnected: false,
        isReconnectFailed: true,
      };
    default:
      return state;
  }
};
