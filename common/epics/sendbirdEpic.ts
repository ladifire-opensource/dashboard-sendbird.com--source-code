import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions } from '@actions';
import { SendBirdActionTypes } from '@actions/types';
import { generateBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { logException } from '@utils/logException';
import { ALERT_BAD_REQUEST } from '@utils/text';

export const sbConnectEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SendBirdActionTypes.SB_CONNECT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action]) => {
      const responses: any[] = [];

      const { userInformation } = action.payload;

      const promise = new Promise<void>((resolve, reject) => {
        const { NODE_ENV, BUILD_MODE } = process.env;
        let apiHost = '';
        let wsHost = '';
        if (NODE_ENV && NODE_ENV === 'development') {
          apiHost = 'http://api.localtest.me:9800';
          wsHost = 'ws://localtest.me:9700';
        }
        if (BUILD_MODE && BUILD_MODE === 'staging') {
          apiHost = 'https://api-staging.sendbird.com';
          wsHost = 'wss://ws-staging.sendbird.com';
        }
        if (userInformation.userId) {
          window.dashboardSB.connect(
            userInformation.userId,
            userInformation.accessToken,
            apiHost,
            wsHost,
            (_, error) => {
              if (error) {
                logException({ error });
                toast.warning({ message: getErrorMessage(error, ALERT_BAD_REQUEST) });
                reject(error);
                action.payload.onFail?.();
                return;
              }
              resolve();
              action.payload.onSuccess?.();
            },
          );
        } else {
          // isConnected on reducer has to be falsy
          reject({});
        }
      });
      return from(promise).pipe(
        mergeMap(() => {
          return from(responses.concat([commonActions.sbConnectSuccess()]));
        }),
        catchError((error) => {
          if (error && Object.prototype.hasOwnProperty.call(error, 'code')) {
            logException({ error });
          }
          return from([commonActions.sbConnectFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.sbConnectFail(error));
    }),
  );
};

export const sbDisconnectEpic: SBEpic = (action$) => {
  return action$.pipe(
    ofType(SendBirdActionTypes.SB_DISCONNECT_REQUEST),
    mergeMap(() => {
      const promise = new Promise<void>((resolve) => {
        if (window.dashboardSB) {
          window.dashboardSB.disconnect(() => {
            resolve();
          });
          return;
        }
      });
      return from(promise).pipe(
        mergeMap(() => {
          return from([commonActions.sbDisconnectSuccess({})]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), commonActions.sbDisconnectFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(commonActions.sbDisconnectFail(error));
    }),
  );
};
