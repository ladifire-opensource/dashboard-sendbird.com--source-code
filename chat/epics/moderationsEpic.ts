import { ofType } from 'redux-observable';
import { from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions, chatActions } from '@actions';
import { ModerationsActionTypes } from '@actions/types';
import {
  sendAdminMessage,
  editMessage,
  banOpenChannelUser,
  banGroupChannelUser,
  unbanOpenChannelUser,
  unbanGroupChannelUser,
  muteGroupChannelUser,
  unmuteGroupChannelUser,
} from '@chat/api';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';
import { ALERT_ADMIN_MESSAGE_SENT, ALERT_MESSAGE_UPDATED } from '@utils/text';

export const sendAdminMessageEpic: SBEpicWithState<SendAdminMessageRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ModerationsActionTypes.SEND_ADMIN_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = sendAdminMessage({
        appId,
        ...action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          action.payload.onSuccess?.();

          const responses: any[] = [chatActions.sendAdminMessageSuccess(response)];
          if (action.payload.origin && action.payload.origin === 'channels') {
            responses.push(
              commonActions.addNotificationsRequest({
                status: 'success',
                message: ALERT_ADMIN_MESSAGE_SENT,
              }),
              commonActions.hideDialogsRequest(),
            );
          }
          return from(responses);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.sendAdminMessageFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.sendAdminMessageFail(error)]);
    }),
  );
};

export const editMessageEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(ModerationsActionTypes.EDIT_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = editMessage({
        appId,
        ...action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess();
          }
          return from([
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_MESSAGE_UPDATED,
            }),
            chatActions.editMessageSuccess(response),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.editMessageFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.editMessageFail(error)]);
    }),
  );
};

// ban
export const banUserEpic: SBEpicWithState<BanUserRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ModerationsActionTypes.BAN_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      let request;
      if (action.payload.origin === 'open_channels') {
        request = banOpenChannelUser({
          appId,
          channelUrl: action.payload.channelUrl,
          payload: {
            user_id: action.payload.userId,
            seconds: action.payload.seconds,
            description: action.payload.description,
          },
        });
      } else if (action.payload.origin === 'group_channels') {
        request = banGroupChannelUser({
          appId,
          channelUrl: action.payload.channelUrl,
          payload: {
            user_id: action.payload.userId,
            seconds: action.payload.seconds,
            description: action.payload.description,
          },
        });
      }
      return from(request).pipe(
        mergeMap(() => {
          action.payload.onSuccess?.();
          return from([
            chatActions.banUserSuccess({}),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'chat.channelDetail.banMuteUserDialog.noti.banned' }),
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          const response: any[] = [];
          if (
            (error.status && error.status === 400 && error.data.code === 400202) ||
            (error.code && error.code === 800220)
          ) {
            response.push(generateBadRequest('User already banned.'));
          } else {
            response.push(generateBadRequest(error));
          }
          response.push(chatActions.banUserFail(error || ''));
          return from(response);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.banUserFail(error)]);
    }),
  );
};

export const unbanUserEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(ModerationsActionTypes.UNBAN_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      let request;
      if (action.payload.origin === 'open_channels') {
        request = unbanOpenChannelUser({
          appId,
          ...action.payload,
        });
      } else if (action.payload.origin === 'group_channels') {
        request = unbanGroupChannelUser({
          appId,
          ...action.payload,
        });
      }
      return from(request).pipe(
        // map(response => response.data),
        mergeMap(() => {
          action.payload.onSuccess?.();
          return from([
            chatActions.unbanUserSuccess({}),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'chat.channelDetail.banMuteUserDialog.noti.unbanned' }),
            }),
          ]);
        }),
        catchError((error) => {
          const response: any[] = [];
          if (
            (error.status && error.status === 400 && error.data.code === 400202) ||
            (error.code && error.code === 800220)
          ) {
            response.push(generateBadRequest('User already unbanned.'));
          } else {
            response.push(generateBadRequest(error));
          }
          return from(response);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.unbanUserFail(error)]);
    }),
  );
};

// mute
export const muteUserEpic: SBEpicWithState<MuteUserRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ModerationsActionTypes.MUTE_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { origin, channelUrl, userId, seconds, description, onSuccess } = action.payload;
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request =
        origin === 'open_channels'
          ? window.dashboardSB.OpenChannel.getChannel(channelUrl).then((channel) =>
              channel.muteUserWithUserId(userId, seconds, description),
            )
          : muteGroupChannelUser({ appId, channelUrl, userId, seconds, description });

      return from(request).pipe(
        mergeMap(() => {
          onSuccess?.();

          return from([
            chatActions.muteUserSuccess({}),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'chat.channelDetail.banMuteUserDialog.noti.muted' }),
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          const response: any[] = [];
          if (
            (error.status && error.status === 400 && error.data.code === 400202) ||
            (error.code && error.code === 800220)
          ) {
            response.push(generateBadRequest('User already muted.'));
          } else {
            response.push(generateBadRequest(error));
          }
          response.push(chatActions.muteUserFail(error || ''));
          return from(response);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.muteUserFail(error)]);
    }),
  );
};

export const unmuteUserEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(ModerationsActionTypes.UNMUTE_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      let request;
      if (action.payload.origin === 'open_channels') {
        request = new Promise((resolve, reject) => {
          window.dashboardSB.OpenChannel.getChannel(action.payload.channelUrl, (channel) => {
            channel.unmuteUserWithUserId(action.payload.userId, (user, error) => {
              if (error) {
                reject(error);
              } else {
                resolve(user);
              }
            });
          });
        });
      } else if (action.payload.origin === 'group_channels') {
        request = unmuteGroupChannelUser({
          appId,
          channelUrl: action.payload.channelUrl,
          userId: action.payload.userId,
        });
      }
      return from(request).pipe(
        mergeMap(() => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess();
          }
          return from([
            commonActions.addNotificationsRequest({
              status: 'success',
              message: window.intl.formatMessage({ id: 'chat.channelDetail.banMuteUserDialog.noti.unmuted' }),
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          const response: any[] = [];
          if (
            (error.status && error.status === 400 && error.data.code === 400202) ||
            (error.code && error.code === 800220)
          ) {
            response.push(generateBadRequest('User already unmuted.'));
          } else {
            response.push(generateBadRequest(error));
          }
          return from(response);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([generateBadRequest(error)]);
    }),
  );
};
