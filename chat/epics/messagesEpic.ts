import { ofType } from 'redux-observable';
import { from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions, chatActions } from '@actions';
import { MessagesActionTypes } from '@actions/types';
import { searchMessages, recoverMessage, deleteMessages, deleteMessage, deleteAllChannelMessages } from '@chat/api';
import { LIST_LIMIT } from '@constants';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { generatePagination } from '@utils';
import { logException } from '@utils/logException';
import {
  ALERT_MESSAGE_RECOVERED,
  ALERT_MESSAGES_DELETED_ALONE,
  ALERT_MESSAGES_DELETED_MULTIPLE,
  ALERT_ALL_CHANNEL_MESSAGES_DELETED,
} from '@utils/text';

export const searchMessagesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(MessagesActionTypes.SEARCH_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const request = searchMessages({
        appId: application.app_id,
        payload: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          return from([
            chatActions.searchMessagesSuccess({
              messages: response.messages,
              pagination: generatePagination(response, LIST_LIMIT),
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.searchMessagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.searchMessagesFail(error)]);
    }),
  );
};

export const recoverMessageEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(MessagesActionTypes.RECOVER_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const request = recoverMessage({
        appId: application.app_id,
        messageId: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          return from([
            chatActions.recoverMessageSuccess(response),
            chatActions.updateMessageRequest(response),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_MESSAGE_RECOVERED,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.recoverMessageFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.recoverMessageFail(error)]);
    }),
  );
};

export const deleteMessagesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(MessagesActionTypes.DELETE_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const messages = action.payload;
      const message_ids = messages
        .map((message) => {
          return message.message_id;
        })
        .join(',');

      const request = deleteMessages({
        appId: application.app_id,
        message_ids,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          const responses: any[] = [chatActions.deleteMessagesSuccess(response)];
          messages.forEach((message) => {
            responses.push(
              chatActions.updateMessageRequest({
                ...message,
                removed: true,
              }),
            );
          });
          responses.push(
            commonActions.addNotificationsRequest({
              status: 'success',
              message: messages.length === 1 ? ALERT_MESSAGES_DELETED_ALONE : ALERT_MESSAGES_DELETED_MULTIPLE,
            }),
          );
          responses.push(commonActions.hideDialogsRequest());
          return from(responses);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.deleteMessagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.deleteMessagesFail(error)]);
    }),
  );
};

export const deleteMessageEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(MessagesActionTypes.DELETE_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const request = deleteMessage({
        appId: application.app_id,
        ...action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess();
          }
          return from([
            chatActions.deleteMessageSuccess(response),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_MESSAGES_DELETED_ALONE,
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.deleteMessageFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.deleteMessageFail(error)]);
    }),
  );
};

export const deleteAllChannelMessagesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(MessagesActionTypes.DELETE_ALL_CHANNEL_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const request = deleteAllChannelMessages({
        appId: application.app_id,
        ...action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess();
          }
          return from([
            chatActions.deleteAllChannelMessagesSuccess(response),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_ALL_CHANNEL_MESSAGES_DELETED,
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.deleteAllChannelMessagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.deleteAllChannelMessagesFail(error)]);
    }),
  );
};
