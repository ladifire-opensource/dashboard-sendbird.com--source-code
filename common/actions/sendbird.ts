import { createAction } from '@actions/createAction';
import { SendBirdActionTypes } from '@actions/types';

export const SendBirdActions = {
  sbConnectRequest: (payload: {
    userInformation: {
      userId: string;
      accessToken?: string;
      nickname?: string;
    };
    onSuccess?: any;
    onFail?: any;
  }) => createAction(SendBirdActionTypes.SB_CONNECT_REQUEST, payload),
  sbConnectSuccess: () => createAction(SendBirdActionTypes.SB_CONNECT_SUCCESS),
  sbConnectFail: (error: unknown) => createAction(SendBirdActionTypes.SB_CONNECT_FAIL, error),

  sbReconnectRequest: () => createAction(SendBirdActionTypes.SB_RECONNECT_REQUEST),
  sbReconnectSuccess: () => createAction(SendBirdActionTypes.SB_RECONNECT_SUCCESS),
  sbReconnectFail: () => createAction(SendBirdActionTypes.SB_RECONNECT_FAIL),

  sbDisconnectRequest: () => createAction(SendBirdActionTypes.SB_DISCONNECT_REQUEST),
  sbDisconnectSuccess: (payload) => createAction(SendBirdActionTypes.SB_DISCONNECT_SUCCESS, payload),
  sbDisconnectFail: (payload) => createAction(SendBirdActionTypes.SB_DISCONNECT_FAIL, payload),
};
