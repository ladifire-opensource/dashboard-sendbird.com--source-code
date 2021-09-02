import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { deskActions } from '@actions';
import { TicketDetailActionTypes } from '@actions/types';
import { deskApi } from '@api';
import {
  convertTwitterStatusTicketToMergedTwitterStatus,
  parseTwitterDirectMessageEventAttachments,
} from '@desk/utils/twitterUtils';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { getTicketSocialType } from '@utils';
import { logException } from '@utils/logException';

export const fetchTicketDetailTicketEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.fetchTicket(pid, region, {
        ticketId: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((ticket) => {
          return from([deskActions.fetchTicketDetailTicketSuccess(ticket)]);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketDetailActionTypes.FETCH_TICKET_DETAIL_TICKET_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchTicketDetailTicketFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTicketDetailTicketFail(error));
    }),
  );
};

export const fetchTicketDetailHeaderEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.fetchTicket(pid, region, {
        ticketId: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((ticket) => {
          return from([deskActions.fetchTicketDetailHeaderSuccess(ticket), deskActions.updateTicketsItem(ticket)]);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketDetailActionTypes.FETCH_TICKET_DETAIL_HEADER_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchTicketDetailTicketFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTicketDetailTicketFail(error));
    }),
  );
};

export const fetchTicketDetailMessagesEpic: SBEpicWithState<
  FetchTicketDetailMessagesRequestAction | FetchTicketDetailMessagesCancelAction
> = (action$, state$) => {
  return action$.pipe(
    ofType<FetchTicketDetailMessagesRequestAction>(TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const app_id = state.applicationState.data?.app_id ?? '';
      const region = state.applicationState.data?.region ?? '';
      const { pid } = state.desk.project;

      const makeResponse = (messages: PlatformAPITicketMessage[], initialOrNextFetchedTimestamp?: number) => {
        const actions: any[] = [];
        if (action.payload.types === 'prev') {
          actions.push(
            deskActions.fetchTicketDetailMessagesSuccess({
              types: action.payload.types,
              messages: messages.concat(state.ticketDetail.messages),
            }),
          );
        } else if (action.payload.types === 'next') {
          actions.push(
            deskActions.fetchTicketDetailMessagesSuccess({
              types: action.payload.types,
              messages:
                messages.length > 0 ? state.ticketDetail.messages.concat(messages) : state.ticketDetail.messages,
              /**
               * Updating `initialOrNextFetchedTimestamp` will scroll the messages to the bottom.
               * That's why we pass undefined to `initialOrNextFetchedTimestamp` below for empty messages.
               */
              initialOrNextFetchedTimestamp: messages.length > 0 ? initialOrNextFetchedTimestamp : undefined,
            }),
          );
        } else {
          actions.push(
            deskActions.fetchTicketDetailMessagesSuccess({
              types: action.payload.types,
              messages,
              initialOrNextFetchedTimestamp,
            }),
          );
        }

        return actions;
      };

      const {
        channelType,
        ticketId,
        channelUrl,
        messageTs,
        prevLimit = 0,
        nextLimit = 0,
        presignedFileUrl,
      } = action.payload;

      const createRequestPipe = (
        request:
          | ReturnType<typeof deskApi.fetchTicketMessages>
          | ReturnType<typeof deskApi.fetchFacebookMessages>
          | ReturnType<typeof deskApi.fetchFacebookFeeds>
          | ReturnType<typeof deskApi.fetchTwitterDirectMessageEvents>
          | ReturnType<typeof deskApi.fetchTwitterStatuses>
          | ReturnType<typeof deskApi.fetchInstagramComments>
          | ReturnType<typeof deskApi.fetchWhatsAppMessages>,
      ) =>
        from(request).pipe(
          map((response) => {
            switch (channelType) {
              case 'SENDBIRD_JAVASCRIPT':
              case 'SENDBIRD_IOS':
              case 'SENDBIRD_ANDROID':
              case 'SENDBIRD':
                return (response.data as FetchTicketMessagesResponse).messages;
              case 'FACEBOOK_FEED':
                return (response.data as FetchSocialTicketMessagesResponse<FacebookFeedType>).results;
              case 'FACEBOOK_CONVERSATION':
                return (response.data as FetchSocialTicketMessagesResponse<FacebookPageMessage>).results;
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
                throw new Error(`Undefined TicketChannelType: ${channelType}`);
            }
          }),
          withLatestFrom(state$),
          mergeMap(([messages, state]) => {
            const currentTicketID = state.ticketDetail.ticket && state.ticketDetail.ticket.id;
            if (currentTicketID !== ticketId) {
              return of(deskActions.fetchTicketDetailMessagesCancel());
            }
            if (['initial', 'next'].includes(action.payload.types)) {
              return from(makeResponse(messages, Date.now()));
            }
            return from(makeResponse(messages));
          }),
          takeUntil(
            action$.pipe(
              ofType(TicketDetailActionTypes.FETCH_TICKET_DETAIL_MESSAGES_CANCEL),
              mergeMap(() => {
                request.cancel();
                return of({});
              }),
            ),
          ),
          catchError((error) => {
            return from([generateBadRequest(error), deskActions.fetchTicketDetailMessagesFail(error)]);
          }),
        );

      if (getTicketSocialType(channelType) === 'sendbird') {
        if (!channelUrl) {
          return of(deskActions.fetchTicketDetailMessagesCancel());
        }
        return createRequestPipe(
          deskApi.fetchTicketMessages({
            appId: app_id,
            channelUrl,
            params: {
              messageTs,
              prevLimit,
              nextLimit,
              presignedFileUrl,
            },
          }),
        );
      }
      if (ticketId == null) {
        return of(deskActions.fetchTicketDetailMessagesCancel());
      }
      switch (channelType) {
        case 'FACEBOOK_CONVERSATION': {
          const params = `prevLimit=${prevLimit}&nextLimit=${nextLimit}&ts=${messageTs}`;
          return createRequestPipe(deskApi.fetchFacebookMessages(pid, region, { ticketId, params }));
        }
        case 'FACEBOOK_FEED': {
          const params = `prevLimit=${prevLimit}&nextLimit=${nextLimit}&ts=${messageTs}`;
          return createRequestPipe(deskApi.fetchFacebookFeeds(pid, region, { ticketId, params }));
        }
        case 'TWITTER_DIRECT_MESSAGE_EVENT': {
          const params = { prevLimit, nextLimit, ts: messageTs };
          return createRequestPipe(deskApi.fetchTwitterDirectMessageEvents(pid, region, { ticketId, params }));
        }
        case 'TWITTER_STATUS': {
          const params = { prevLimit, nextLimit, ts: messageTs };
          return createRequestPipe(deskApi.fetchTwitterStatuses(pid, region, { ticketId, params }));
        }
        case 'INSTAGRAM_COMMENT': {
          const params = { prevLimit, nextLimit, ts: messageTs };
          return createRequestPipe(deskApi.fetchInstagramComments(pid, region, { ticketId, params }));
        }
        case 'WHATSAPP_MESSAGE': {
          const params = { prevLimit, nextLimit, ts: messageTs };
          return createRequestPipe(deskApi.fetchWhatsAppMessages(pid, region, { ticketId, params }));
        }
        default:
          throw new Error(`Undefined TicketChannelType: ${channelType}`);
      }
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTicketDetailMessagesFail(error));
    }),
  );
};
