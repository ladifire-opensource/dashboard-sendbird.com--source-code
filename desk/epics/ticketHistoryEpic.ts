import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { deskActions } from '@actions';
import { TicketHistoryActionTypes } from '@actions/types';
import { deskApi } from '@api';
import {
  parseTwitterDirectMessageEventAttachments,
  convertTwitterStatusTicketToMergedTwitterStatus,
} from '@desk/utils/twitterUtils';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchTicketHistoryMessagesEpic: SBEpicWithState<
  FetchTicketHistoryMessagesRequestAction | FetchTicketHistoryMessagesCancelAction
> = (action$, state$) => {
  return action$.pipe(
    ofType<FetchTicketHistoryMessagesRequestAction>(TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { app_id, region } = selectApplication_DEPRECATED(state);
      const { pid } = state.desk.project;

      const makeResponse = (messages: PlatformAPITicketMessage[]) => {
        if (action.payload.types === 'prev') {
          return [
            deskActions.fetchTicketHistoryMessagesSuccess({
              types: action.payload.types,
              messages: messages.concat(state.ticketHistory.messages),
            }),
          ];
        }
        if (action.payload.types === 'next') {
          return [
            deskActions.fetchTicketHistoryMessagesSuccess({
              types: action.payload.types,
              messages: state.ticketHistory.messages.concat(messages),
            }),
          ];
        }
        return [
          deskActions.fetchTicketHistoryMessagesSuccess({
            types: action.payload.types,
            messages,
          }),
        ];
      };

      const { channelType, channelUrl, messageTs, prevLimit = 0, nextLimit = 0, presignedFileUrl } = action.payload;

      const request = (() => {
        switch (channelType) {
          case 'SENDBIRD_JAVASCRIPT':
          case 'SENDBIRD_IOS':
          case 'SENDBIRD_ANDROID':
          case 'SENDBIRD': {
            if (!channelUrl) {
              return null;
            }
            return deskApi.fetchTicketMessages({
              appId: app_id,
              channelUrl,
              params: {
                messageTs,
                prevLimit,
                nextLimit,
                presignedFileUrl,
              },
            });
          }
          case 'FACEBOOK_CONVERSATION': {
            const params = `prevLimit=${prevLimit}&nextLimit=${nextLimit}&ts=${messageTs}`;
            return deskApi.fetchFacebookMessages(pid, region, {
              ticketId: action.payload.ticketId,
              params,
            });
          }
          case 'FACEBOOK_FEED': {
            const params = `prevLimit=${prevLimit}&nextLimit=${nextLimit}&ts=${messageTs}`;
            return deskApi.fetchFacebookFeeds(pid, region, {
              ticketId: action.payload.ticketId,
              params,
            });
          }
          case 'TWITTER_DIRECT_MESSAGE_EVENT': {
            const params = { prevLimit, nextLimit, ts: messageTs };
            return deskApi.fetchTwitterDirectMessageEvents(pid, region, { ticketId: action.payload.ticketId, params });
          }
          case 'TWITTER_STATUS': {
            const params = { prevLimit, nextLimit, ts: messageTs };
            return deskApi.fetchTwitterStatuses(pid, region, { ticketId: action.payload.ticketId, params });
          }
          case 'INSTAGRAM_COMMENT': {
            const params = { prevLimit, nextLimit, ts: messageTs };
            return deskApi.fetchInstagramComments(pid, region, { ticketId: action.payload.ticketId, params });
          }
          case 'WHATSAPP_MESSAGE': {
            const params = { prevLimit, nextLimit, ts: messageTs };
            return deskApi.fetchWhatsAppMessages(pid, region, { ticketId: action.payload.ticketId, params });
          }
          default:
            return null;
        }
      })();

      if (!request) {
        return from([deskActions.fetchTicketHistoryMessagesCancel()]);
      }

      return from(request).pipe(
        map((response) => {
          switch (channelType) {
            case 'SENDBIRD_JAVASCRIPT':
            case 'SENDBIRD_IOS':
            case 'SENDBIRD_ANDROID':
            case 'SENDBIRD':
              return (response.data as FetchTicketMessagesResponse).messages;
            case 'FACEBOOK_CONVERSATION':
              return (response.data as FetchSocialTicketMessagesResponse<FacebookPageMessage>).results;
            case 'FACEBOOK_FEED':
              return (response.data as FetchSocialTicketMessagesResponse<FacebookFeedType>).results;
            case 'TWITTER_DIRECT_MESSAGE_EVENT':
              return (response.data as FetchSocialTicketMessagesResponse<TwitterDirectMessageEvent>).results.map(
                parseTwitterDirectMessageEventAttachments,
              );
            case 'TWITTER_STATUS':
              return (response.data as FetchSocialTicketMessagesResponse<TwitterStatusTicket>).results.map(
                convertTwitterStatusTicketToMergedTwitterStatus,
              );
            case 'INSTAGRAM_COMMENT':
              return (response.data as FetchSocialTicketMessagesResponse<InstagramCommentTicket>).results;
            case 'WHATSAPP_MESSAGE':
              return (response.data as FetchSocialTicketMessagesResponse<WhatsAppMessageType>).results;
            default:
              return [];
          }
        }),
        mergeMap((messages) => from(makeResponse(messages))),
        takeUntil(
          action$.pipe(
            ofType(TicketHistoryActionTypes.FETCH_TICKET_HISTORY_MESSAGES_CANCEL),
            mergeMap(() => {
              request['cancel']();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchTicketHistoryMessagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTicketHistoryMessagesFail(error));
    }),
  );
};
