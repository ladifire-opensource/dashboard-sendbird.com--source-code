import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { deskActions } from '@actions';
import { ConversationActionTypes, TicketsActionTypes } from '@actions/types';
import { deskApi } from '@api';
import {
  convertTwitterStatusTicketToMergedTwitterStatus,
  parseTwitterDirectMessageEventAttachments,
} from '@desk/utils/twitterUtils';
import { generateBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { withCurrentApplication } from '@epics/withCurrentApplication';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchConversationEpic: SBEpicWithState<FetchConversationActions> = (action$, state$) => {
  return action$.pipe(
    ofType<FetchConversationRequestAction>(ConversationActionTypes.FETCH_CONVERSATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const { pid } = state.desk.project;
        const { region } = application;
        const { ticketId, onSuccess, onFail } = action.payload;

        const request = deskApi.fetchTicket(pid, region, {
          ticketId,
        });
        return from(request).pipe(
          map((response) => response.data),
          mergeMap((conversation) => {
            onSuccess && onSuccess(conversation);
            return from([deskActions.fetchConversationSuccess(conversation)]);
          }),
          takeUntil(
            action$.pipe(
              ofType<fetchConversationCancelAction>(ConversationActionTypes.FETCH_CONVERSATION_CANCEL),
              mergeMap(() => {
                request.cancel();
                return of({});
              }),
            ),
          ),
          catchError((error) => {
            onFail && onFail();
            return from([generateBadRequest(error), deskActions.fetchConversationFail(error || '')]);
          }),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchConversationFail(error));
    }),
  );
};

export const moveTicketToWIPEpic: SBEpicWithState<MoveTicketToWIPRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.MOVE_TICKET_TO_WIP_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const { pid } = state.desk.project;
        const { region } = application;

        const request = deskApi.addToWIP(pid, region, {
          ticketId: action.payload.id,
        });
        return from(request).pipe(
          map((response) => response.data),
          mergeMap(() => {
            return from([deskActions.moveTicketToWIPSuccess()]);
          }),
          catchError((error) => {
            return from([generateBadRequest(error), deskActions.moveTicketToWIPFail(error || '')]);
          }),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return of(deskActions.moveTicketToWIPFail(error));
    }),
  );
};

export const assignTicketToMyselfEpic: SBEpicWithState<AssignTicketToMyselfRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.ASSIGN_TICKET_TO_MYSELF_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.assignTicket(pid, region, {
        ticketId: action.payload.id,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          return from([
            deskActions.assignTicketToMyselfSuccess({}),
            deskActions.fetchConversationRequest({ ticketId: action.payload.id }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.assignTicketToMyselfFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.assignTicketToMyselfFail(error));
    }),
  );
};

export const updateConversationTicketAssignmentEpic: SBEpicWithState<UpdateConversationTicketAssignmentRequestAction> = (
  action$,
  state$,
) => {
  return action$.pipe(
    ofType(ConversationActionTypes.UPDATE_CONVERSATION_TICKET_ASSIGNMENT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.updateTicketAssignment(pid, region, {
        assignmentId: action.payload.assignmentId,
        payload: action.payload.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((assignment) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess(assignment);
          }
          return from([deskActions.setConversationAssignment(assignment)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of();
    }),
  );
};

export const fetchConversationMessagesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType<FetchConversationMessagesRequestAction>(ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { app_id } = selectApplication_DEPRECATED(state);

      const { messageTs, prevLimit, nextLimit, presignedFileUrl } = action.payload;

      const makeResponse = (messages: SendBirdAPIMessage[]) => {
        /**
         * `FetchConversationMessagesRequestAction` is dispatched only in in-app chat tickets that fetch messages
         * using Platform API. That's why we can assert the type of `state.conversation.messages` as
         * `SendBirdAPIMessage[]`. View `ChatPlatformAPI` component to see where this action is dispatched.
         */
        if (action.payload.types === 'prev') {
          return [
            deskActions.fetchConversationMessagesSuccess({
              types: action.payload.types,
              messages: messages.concat(state.conversation.messages as SendBirdAPIMessage[]),
            }),
          ];
        }
        if (action.payload.types === 'next') {
          if (messages.length > 0) {
            return [
              deskActions.fetchConversationMessagesSuccess({
                types: action.payload.types,
                messages: (state.conversation.messages as SendBirdAPIMessage[]).concat(messages),
                initialOrNextFetchedTimestamp: Date.now(),
              }),
            ];
          }
          /**
           * Updating `initialOrNextFetchedTimestamp` will scroll the messages to the bottom.
           * That's why we don't include `initialOrNextFetchedTimestamp` if we get no message from the server.
           */
          return [
            deskActions.fetchConversationMessagesSuccess({
              types: action.payload.types,
              messages: state.conversation.messages as SendBirdAPIMessage[],
            }),
          ];
        }
        return [
          deskActions.fetchConversationMessagesSuccess({
            types: action.payload.types,
            messages,
            initialOrNextFetchedTimestamp: Date.now(),
          }),
        ];
      };

      const request = deskApi.fetchTicketMessages({
        appId: app_id,
        channelUrl: action.payload.channelUrl,
        params: {
          messageTs,
          prevLimit,
          nextLimit,
          presignedFileUrl,
        },
      });
      return from(request).pipe(
        map((response) => response.data.messages),
        mergeMap((messages) => {
          return from(makeResponse(messages));
        }),
        takeUntil(
          action$.pipe(
            ofType(ConversationActionTypes.FETCH_CONVERSATION_MESSAGES_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchConversationMessagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchConversationMessagesFail(error));
    }),
  );
};

export const fetchFacebookMessagesEpic: SBEpicWithState<FetchFacebookMessagesRequest> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.FETCH_FACEBOOK_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      let params = '';
      const { ts, prevLimit = 0, nextLimit = 0 } = action.payload;
      params = `prevLimit=${prevLimit}&nextLimit=${nextLimit}&ts=${ts}`;

      const request = deskApi.fetchFacebookMessages(pid, region, {
        ticketId: action.payload.ticketId,
        params,
      });
      const makeResponse = (facebookMessages) => {
        if (action.payload.types === 'prev') {
          return [
            deskActions.fetchFacebookMessagesSuccess({
              types: action.payload.types,
              facebookMessages: facebookMessages.concat(state.conversation.facebookMessages),
            }),
          ];
        }
        return [
          deskActions.fetchFacebookMessagesSuccess({
            types: action.payload.types,
            facebookMessages,
            initialOrNextFetchedTimestamp: Date.now(),
          }),
        ];
      };
      return from(request).pipe(
        map((response) => response.data.results),
        mergeMap((facebookMessages) => from(makeResponse(facebookMessages))),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchFacebookMessagesFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchFacebookMessagesFail(error));
    }),
  );
};

export const sendFacebookMessageEpic: SBEpicWithState<SendFacebookMessageRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.SEND_FACEBOOK_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { ticketId, facebookPageId, ...requestPayload } = action.payload;

      const request = deskApi.sendFacebookMessage({
        pid,
        region,
        ticketId,
        payload: requestPayload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((message) => {
          const tempMessage = {
            ...message,
            senderId: facebookPageId,
            timestamp: new Date().valueOf(),
            text: requestPayload.messageText,
            ticket: ticketId,
            isEcho: true,
            isTemp: true,
          };
          return from([
            deskActions.updateFacebookMessageRequest({
              facebookMessage: tempMessage,
            }),
            deskActions.sendFacebookMessageSuccess(message),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.sendFacebookMessageFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.sendFacebookMessageFail(error));
    }),
  );
};

export const fetchURLPreviewEpic: SBEpicWithState<FetchURLPreviewRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.FETCH_URL_PREVIEW_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.fetchURLPreview({
        pid,
        region,
        url: action.payload.url,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((result) => {
          action.payload.onSuccess && action.payload.onSuccess(result);
          return from([deskActions.fetchURLPreviewSuccess(result)]);
        }),
        catchError((error) => {
          action.payload.onFail && action.payload.onFail(error);
          return from([generateBadRequest(error), deskActions.fetchURLPreviewFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchURLPreviewFail(error));
    }),
  );
};

export const fetchFacebookFeedsEpic: SBEpicWithState<FetchFacebookFeedsRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.FETCH_FACEBOOK_FEEDS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      let params = '';
      const { ts, prevLimit = 0, nextLimit = 0 } = action.payload;
      params = `prevLimit=${prevLimit}&nextLimit=${nextLimit}&ts=${ts}`;

      const request = deskApi.fetchFacebookFeeds(pid, region, {
        ticketId: action.payload.ticketId,
        params,
      });

      const makeResponse = (facebookFeeds) => {
        if (action.payload.types === 'prev') {
          return [
            deskActions.fetchFacebookFeedsSuccess({
              types: action.payload.types,
              facebookFeeds: facebookFeeds.concat(state.conversation.facebookFeeds),
            }),
          ];
        }
        return [
          deskActions.fetchFacebookFeedsSuccess({
            types: action.payload.types,
            facebookFeeds,
            initialOrNextFetchedTimestamp: Date.now(),
          }),
        ];
      };
      return from(request).pipe(
        map((response) => response.data.results),
        mergeMap((facebookFeeds) => from(makeResponse(facebookFeeds))),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchFacebookFeedsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchFacebookFeedsFail(error));
    }),
  );
};

export const createFacebookFeedEpic: SBEpicWithState<CreateFacebookFeedRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.CREATE_FACEBOOK_FEED_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.createFacebookFeed({
        pid,
        region,
        ticketId: action.payload.ticketId,
        payload: action.payload.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((feed) => {
          const tempFeed = {
            id: 0,
            attachments: '',
            feedId: feed.feedId,
            fromId: action.payload.fromId,
            parentId: action.payload.payload.parentFeedId,
            feedType: 'comment',
            timestamp: new Date().valueOf(),
            message: action.payload.payload.messageText || '',
            ticket: action.payload.ticketId,
            isTemp: true,
            reactions: '{"reactionCounts": {}, "pageReactions": []}',
            createdAt: '',
            status: 'default' as const,
            messageType: 'social',
          };
          return from([deskActions.updateFacebookFeedsRequest(tempFeed)]);
        }),
        catchError((error) => {
          toast.warning({ message: getErrorMessage(error) });
          return from([]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([]);
    }),
  );
};

export const editFacebookFeedEpic: SBEpicWithState<EditFacebookFeedRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.EDIT_FACEBOOK_FEED_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.editFacebookFeed({
        pid,
        region,
        payload: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((feed) => {
          return from([deskActions.updateFacebookFeedsRequest(feed), deskActions.editFacebookFeedSuccess({ feed })]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.editFacebookFeedFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.editFacebookFeedFail(error));
    }),
  );
};

export const deleteFacebookFeedEpic: SBEpicWithState<DeleteFacebookFeedRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.DELETE_FACEBOOK_FEED_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.deleteFacebookFeed({
        pid,
        region,
        ticketId: action.payload.ticketId,
        feedId: action.payload.feed.feedId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((feed) => {
          return from([deskActions.deleteFacebookFeedSuccess({ feed })]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.deleteFacebookFeedFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.deleteFacebookFeedFail(error));
    }),
  );
};

export const facebookFeedLikeEpic: SBEpicWithState<FacebookFeedLikeRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.FACEBOOK_FEED_LIKE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.facebookFeedLike({
        pid,
        region,
        ticketId: action.payload.ticketId,
        feedId: action.payload.feed.feedId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((feed) => {
          return from([deskActions.facebookFeedLikeSuccess(feed)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.facebookFeedLikeFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.facebookFeedLikeFail(error));
    }),
  );
};

export const facebookFeedUnlikeEpic: SBEpicWithState<FacebookFeedUnlikeRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.FACEBOOK_FEED_UNLIKE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.facebookFeedUnlike({
        pid,
        region,
        ticketId: action.payload.ticketId,
        feedId: action.payload.feed.feedId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((feed) => {
          return from([deskActions.facebookFeedUnlikeSuccess(feed)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.facebookFeedUnlikeFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.facebookFeedUnlikeFail(error));
    }),
  );
};

export const fetchTwitterDirectMessagesEpic: SBEpicWithState<FetchTwitterDirectMessagesRequestAction> = (
  action$,
  state$,
) => {
  return action$.pipe(
    ofType(ConversationActionTypes.FETCH_TWITTER_DIRECT_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const { ts, prevLimit = 0, nextLimit = 0 } = action.payload;
      const params = { prevLimit, nextLimit, ts };

      const request = deskApi.fetchTwitterDirectMessageEvents(pid, region, {
        ticketId: action.payload.ticketId,
        params,
      });

      return from(request).pipe(
        mergeMap(({ data: { results: messages } }) => {
          const attachmentParsedMessages = messages.map(parseTwitterDirectMessageEventAttachments);

          if (action.payload.types === 'prev') {
            return from([
              deskActions.fetchTwitterDirectMessagesSuccess({
                types: action.payload.types,
                messages: attachmentParsedMessages.concat(state.conversation.twitterDirectMessages),
              }),
            ]);
          }

          return from([
            deskActions.fetchTwitterDirectMessagesSuccess({
              types: action.payload.types,
              messages: attachmentParsedMessages,
              initialOrNextFetchedTimestamp: Date.now(),
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchTwitterDirectMessagesFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTwitterDirectMessagesFail(error));
    }),
  );
};

export const createTwitterDirectMessageEventEpic: SBEpicWithState<CreateTwitterDirectMessageRequestAction> = (
  action$,
  state$,
) => {
  return action$.pipe(
    ofType(ConversationActionTypes.CREATE_TWITTER_DIRECT_MESSAGE_EVENT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { ticket, recipientId, messageText, mediaId } = action.payload;

      const request = deskApi.createTwitterDirectMessageEvent(pid, region, {
        ticketId: ticket.id,
        recipientId,
        messageText,
        mediaId,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((message) => {
          const tempMessage = parseTwitterDirectMessageEventAttachments({
            ...message,
            ticket,
            isTemp: true,
          });
          return from([deskActions.createTwitterDirectMessageSuccess(tempMessage)]);
        }),
        catchError((error) => {
          if (error && error.data && error.data.code === 'desk400104') {
            return from([
              generateBadRequest(window.intl.formatMessage({ id: 'desk.conversation.twitter.message.noti.tooLong' })),
              deskActions.createTwitterDirectMessageFail(),
            ]);
          }
          return from([generateBadRequest(error), deskActions.createTwitterDirectMessageFail()]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createTwitterDirectMessageFail());
    }),
  );
};

export const deleteTwitterDirectMessageEventEpic: SBEpicWithState<DeleteTwitterDirectMessageEventRequestAction> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType(ConversationActionTypes.DELETE_TWITTER_DIRECT_MESSAGE_EVENT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const request = deskApi.patchTwitterDirectMessageEvent(pid, region, {
        ...action.payload,
        status: 'remove',
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((message) => from([deskActions.deleteTwitterDirectMessageEventSuccess(message)])),
        catchError((error) =>
          from([generateBadRequest(error), deskActions.deleteTwitterDirectMessageEventFail(error)]),
        ),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.deleteTwitterDirectMessageEventFail(error));
    }),
  );

export const fetchTwitterStatusesEpic: SBEpicWithState<FetchTwitterStatusesRequestAction> = (action$, state$) =>
  action$.pipe(
    ofType(ConversationActionTypes.FETCH_TWITTER_STATUSES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const { ts, prevLimit = 0, nextLimit = 0 } = action.payload;
      const params = { prevLimit, nextLimit, ts };
      const request = deskApi.fetchTwitterStatuses(pid, region, {
        ticketId: action.payload.ticketId,
        params,
      });

      return from(request).pipe(
        mergeMap(({ data: { results: messages } }) => {
          const mergedTwitterStatuses = messages.map(convertTwitterStatusTicketToMergedTwitterStatus);

          if (action.payload.types === 'prev') {
            return from([
              deskActions.fetchTwitterStatusesSuccess({
                types: action.payload.types,
                messages: mergedTwitterStatuses.concat(state.conversation.twitterStatuses),
              }),
            ]);
          }
          return from([
            deskActions.fetchTwitterStatusesSuccess({
              types: action.payload.types,
              messages: mergedTwitterStatuses,
              initialOrNextFetchedTimestamp: Date.now(),
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.fetchTwitterStatusesFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTwitterStatusesFail(error));
    }),
  );

export const fetchInstagramCommentsEpic: SBEpicWithState<FetchInstagramCommentsRequestAction> = (action$, state$) =>
  action$.pipe(
    ofType(ConversationActionTypes.FETCH_INSTAGRAM_COMMENTS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const { pid } = state.desk.project;
        const { region } = application;

        const { ts, prevLimit = 0, nextLimit = 0 } = action.payload;
        const params = { prevLimit, nextLimit, ts };
        const request = deskApi.fetchInstagramComments(pid, region, {
          ticketId: action.payload.ticketId,
          params,
        });

        return from(request).pipe(
          mergeMap(({ data: { results: comments } }) => {
            if (action.payload.types === 'prev') {
              return from([
                deskActions.fetchInstagramCommentsSuccess({
                  types: action.payload.types,
                  instagramComments: comments.concat(state.conversation.instagramComments),
                }),
              ]);
            }
            return from([
              deskActions.fetchInstagramCommentsSuccess({
                types: action.payload.types,
                instagramComments: comments,
                initialOrNextFetchedTimestamp: Date.now(),
              }),
            ]);
          }),
          catchError((error) => {
            toast.error({ message: getErrorMessage(error) });
            return from([deskActions.fetchInstagramCommentsFail(error)]);
          }),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchInstagramCommentsFail(error));
    }),
  );

export const createInstagramCommentsEpic: SBEpicWithState<CreateInstagramCommentsRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.CREATE_INSTAGRAM_COMMENT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const { pid } = state.desk.project;
        const { region } = application;
        const { ticket, text, parentIgCommentId, igMediaId, instagramUsername } = action.payload;

        const request = deskApi.createInstagramComment(pid, region, {
          ticketId: ticket.id,
          text,
          parentIgCommentId,
          igMediaId,
        });
        return from(request).pipe(
          map((response) => response.data),
          mergeMap((instagramCommentTicket) => {
            const tempMessage = {
              ...instagramCommentTicket,
              instagramComment: {
                ...instagramCommentTicket.instagramComment,
                senderId: instagramUsername || '',
                isTemp: true,
              },
            };
            return from([deskActions.updateInstagramCommentSuccess(tempMessage)]);
          }),
          catchError((error) => {
            return from([generateBadRequest(error), deskActions.createInstagramCommentFail()]);
          }),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createInstagramCommentFail());
    }),
  );
};

export const deleteInstagramCommentsEpic: SBEpicWithState<DeleteInstagramCommentsRequestAction> = (
  actions$,
  state$,
) => {
  return actions$.pipe(
    ofType(ConversationActionTypes.DELETE_INSTAGRAM_COMMENT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const { pid } = state.desk.project;
        const { region } = application;
        const { instagramCommentId, ticketId } = action.payload;

        const request = deskApi.deleteInstagramComment(pid, region, { ticketId, instagramCommentId });

        return from(request).pipe(
          map((response) => response.data),
          mergeMap((instagramComment) => {
            return from([deskActions.deleteInstagramCommentSuccess(instagramComment)]);
          }),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return of(deskActions.deleteInstagramCommentFail());
    }),
  );
};

export const markAsReadEpic: SBEpicWithState<MarkAsReadRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ConversationActionTypes.MARK_AS_READ_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { ticketId, onSuccess } = action.payload;

      const request = deskApi.markAsRead({
        pid,
        region,
        ticketId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((ticket) => {
          onSuccess({ ticket });
          return from([deskActions.markAsReadSuccess(ticket)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.markAsReadFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.markAsReadFail(error));
    }),
  );
};

export const createTwitterStatusEpic: SBEpicWithState<CreateTwitterStatusRequestAction> = (action$, state$) =>
  action$.pipe(
    ofType(ConversationActionTypes.CREATE_TWITTER_STATUS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { ticket, recipientId, messageText, inReplyToStatusId, mediaIds } = action.payload;

      const request = deskApi.createTwitterStatus(pid, region, {
        ticketId: ticket.id,
        recipientId,
        messageText,
        inReplyToStatusId,
        mediaIds: mediaIds && mediaIds.length > 0 ? mediaIds : undefined,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((twitterStatusTicket) => {
          const tempMessage = convertTwitterStatusTicketToMergedTwitterStatus(twitterStatusTicket);
          tempMessage.isTemp = true;
          return from([deskActions.createTwitterStatusSuccess(tempMessage)]);
        }),
        catchError((error) => {
          if (error && error.data && ['desk400102', 'desk400103'].includes(error.data.code)) {
            const errorMessages = {
              desk400102: window.intl.formatMessage({ id: 'desk.conversation.twitter.tweet.noti.tooLong' }),
              desk400103: window.intl.formatMessage({ id: 'desk.conversation.twitter.tweet.noti.duplicated' }),
            };
            return from([generateBadRequest(errorMessages[error.data.code]), deskActions.createTwitterStatusFail()]);
          }
          return from([generateBadRequest(error), deskActions.createTwitterStatusFail()]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createTwitterStatusFail());
    }),
  );

export const patchTwitterStatusEpic: SBEpicWithState<PatchTwitterStatusRequestAction> = (action$, state$) =>
  action$.pipe(
    ofType(ConversationActionTypes.PATCH_TWITTER_STATUS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id, status } = action.payload;

      return from(deskApi.patchTwitterStatusStatus(pid, region, { id, status })).pipe(
        map((response) => response.data),
        mergeMap((message) => from([deskActions.patchTwitterStatusSuccess(message)])),
        catchError((error) =>
          from([generateBadRequest(error), deskActions.patchTwitterStatusFail(getErrorMessage(error))]),
        ),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.patchTwitterStatusFail(getErrorMessage(error)));
    }),
  );

export const patchTwitterStatusTwitterUserEpic: SBEpicWithState<PatchTwitterStatusTwitterUserRequestAction> = (
  action$,
  state$,
) =>
  action$.pipe(
    ofType(ConversationActionTypes.PATCH_TWITTER_STATUS_TWITTER_USER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { id, update, twitterStatusId } = action.payload;
      const updatedKeys = Object.keys(update);

      if (updatedKeys.includes('retweeted')) {
        return from(
          deskApi.patchTwitterStatusRetweeted(pid, region, {
            id,
            retweeted: update['retweeted'],
          }),
        ).pipe(
          map((response) => response.data),
          withLatestFrom(state$),
          mergeMap(([{ retweeted }, state]) => {
            const twitterStatus = state.conversation.twitterStatuses.find((item) => item.id === twitterStatusId);
            if (twitterStatus) {
              return of(
                deskActions.patchTwitterStatusTwitterUserSuccess({
                  twitterStatusId,
                  retweeted,
                  retweetCount: twitterStatus.retweetCount + (retweeted ? 1 : -1),
                }),
              );
            }
            return of();
          }),
          catchError((error) =>
            from([generateBadRequest(error), deskActions.patchTwitterStatusTwitterUserFail(getErrorMessage(error))]),
          ),
        );
      }
      if (updatedKeys.includes('favorited')) {
        return from(
          deskApi.patchTwitterStatusFavorited(pid, region, {
            id,
            favorited: update['favorited'],
          }),
        ).pipe(
          map((response) => response.data),
          withLatestFrom(state$),
          mergeMap(([{ favorited }, state]) => {
            const twitterStatus = state.conversation.twitterStatuses.find((item) => item.id === twitterStatusId);
            if (twitterStatus) {
              return of(
                deskActions.patchTwitterStatusTwitterUserSuccess({
                  twitterStatusId,
                  favorited,
                  favoriteCount: twitterStatus.favoriteCount + (favorited ? 1 : -1),
                }),
              );
            }
            return of();
          }),
          catchError((error) =>
            from([generateBadRequest(error), deskActions.patchTwitterStatusTwitterUserFail(getErrorMessage(error))]),
          ),
        );
      }
      return from([deskActions.patchTwitterStatusTwitterUserFail('')]);
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.patchTwitterStatusTwitterUserFail(getErrorMessage(error)));
    }),
  );

export const fetchWhatsAppMessagesEpic: SBEpicWithState<FetchWhatsAppMessagesRequestAction> = (action$, state$) =>
  action$.pipe(
    ofType(ConversationActionTypes.FETCH_WHATSAPP_MESSAGES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) =>
      withCurrentApplication(state)((application) => {
        const { pid } = state.desk.project;
        const { region } = application;

        const { prevLimit = 0, nextLimit = 0, ts, types } = action.payload;
        const request = deskApi.fetchWhatsAppMessages(pid, region, {
          ticketId: action.payload.ticketId,
          params: { prevLimit, nextLimit, ts },
        });

        return from(request).pipe(
          map((response) => response.data),
          mergeMap(({ results }) => {
            const makeResponse = (whatsAppMessages: WhatsAppMessageType[]) => {
              if (types === 'prev') {
                return [
                  deskActions.fetchWhatsAppMessagesSuccess({
                    types: action.payload.types,
                    whatsAppMessages: whatsAppMessages.concat(state.conversation.whatsAppMessages),
                  }),
                ];
              }
              return [
                deskActions.fetchWhatsAppMessagesSuccess({
                  types: action.payload.types,
                  whatsAppMessages,
                  initialOrNextFetchedTimestamp: Date.now(),
                }),
              ];
            };
            return from(makeResponse(results));
          }),
          catchError((error) => from([generateBadRequest(error), deskActions.fetchWhatsAppMessagesFail()])),
        );
      }),
    ),
    catchError((error) => {
      logException({ error });
      return from([generateBadRequest(error), deskActions.fetchWhatsAppMessagesFail()]);
    }),
  );

export const createWhatsAppMessageEpic: SBEpicWithState<CreateWhatsAppMessageRequestAction> = (action$, state$) =>
  action$.pipe(
    ofType(ConversationActionTypes.CREATE_WHATSAPP_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const region = state.applicationState.data?.region ?? '';

      const { ticketId, toNumber, messageText, filedata } = action.payload;
      const request = deskApi.createWhatsAppMessage(pid, region, {
        ticketId,
        toNumber,
        messageText,
        filedata,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((whatsAppMessage) => from([deskActions.createWhatsAppMessageSuccess(whatsAppMessage)])),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.createWhatsAppMessageFail());
    }),
  );
