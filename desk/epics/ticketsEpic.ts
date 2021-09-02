import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { commonActions, deskActions } from '@actions';
import { TicketsActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { ISO_DATE_FORMAT, TicketStatus } from '@constants';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { fixedEncodeURIComponent } from '@utils';
import { logException } from '@utils/logException';

type TicketFilterChannelType = '' | 'SENDBIRD' | 'FACEBOOK_PAGE' | 'TWITTER' | 'INSTAGRAM_COMMENT';

const sendbirdChannelTicketTypes: SendBirdTicketChannelType[] = [
  'SENDBIRD',
  'SENDBIRD_ANDROID',
  'SENDBIRD_IOS',
  'SENDBIRD_JAVASCRIPT',
];
const twitterTicketChannelTypes: TwitterTicketChannelType[] = ['TWITTER_DIRECT_MESSAGE_EVENT', 'TWITTER_STATUS'];
const facebookTicketChannelTypes: FacebookTicketChannelType[] = ['FACEBOOK_FEED', 'FACEBOOK_CONVERSATION'];

// FIXME: legacy function
const convertTicketFilterChannelTypeToTicketChannelTypes = (
  channelType: TicketFilterChannelType,
): TicketChannelType[] => {
  if (!channelType) {
    return [];
  }
  switch (channelType) {
    case 'FACEBOOK_PAGE':
      return facebookTicketChannelTypes;
    case 'TWITTER':
      return twitterTicketChannelTypes;
    case 'SENDBIRD':
      return sendbirdChannelTicketTypes;
    default:
      return [channelType] as TicketChannelType[];
  }
};

export const fetchTicketsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.FETCH_TICKETS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const {
        query = '',
        order = '-created_at',
        offset = state.tickets.pagination.offset,
        limit = state.tickets.pagination.limit,
        filter,
      } = action.payload;
      const ticketFilter = {
        ...state.tickets.filter,
        ...filter,
      };

      const parameters = {
        limit,
        offset,
        order,
        status2:
          ticketFilter.status.value === TicketStatus.ALL
            ? [TicketStatus.ACTIVE, TicketStatus.IDLE, TicketStatus.PENDING, TicketStatus.WIP, TicketStatus.CLOSED]
            : ticketFilter.status.value,
        start_date: ticketFilter.date?.startDate.format(ISO_DATE_FORMAT),
        end_date: ticketFilter.date?.endDate.format(ISO_DATE_FORMAT),
        q: fixedEncodeURIComponent(query),
        agent: ticketFilter.assignee.id,
        ticket_type: ticketFilter.ticketType,
        channel_type: convertTicketFilterChannelTypeToTicketChannelTypes(ticketFilter.channelType),
      };

      const pagination = {
        limit,
        offset,
      };
      const request = deskApi.fetchTickets(pid, region, parameters);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((tickets) => {
          return from([
            deskActions.fetchTicketsSuccess({
              count: tickets.count,
              items: tickets.results,
              filter: ticketFilter,
              ...pagination,
            }),
          ]);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketsActionTypes.FETCH_TICKETS_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchTicketsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchTicketsFail(error));
    }),
  );
};

export const forceAssignEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.FORCE_ASSIGN_TICKET_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { ticketId, agentId, options, onSuccess } = action.payload;

      const request = deskApi.forceAssignTicket(pid, region, {
        ticketId,
        agentId,
      });

      const actions: any[] = [deskActions.forceAssignTicketSuccess(), commonActions.hideDialogsRequest()];

      if (options && options.origin === 'tickets') {
        actions.push(
          commonActions.addNotificationsRequest({
            status: 'success',
            message: options.alert,
          }),
        );
        const { parameters } = state.tickets;
        const { offset, limit } = state.tickets.pagination;
        actions.push(
          deskActions.fetchTicketsRequest({
            order: '-created_at',
            parameters,
            offset,
            limit,
          }),
        );
      } else {
        actions.push(deskActions.fetchTicketDetailTicketRequest(ticketId));
      }

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((ticket) => {
          onSuccess && onSuccess(ticket);
          return from(actions);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketsActionTypes.FORCE_ASSIGN_TICKET_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.forceAssignTicketFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.forceAssignTicketFail(error));
    }),
  );
};

export const transferTicketEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.TRANSFER_TICKET_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region, app_id } = selectApplication_DEPRECATED(state);
      const { assignment, agentId, memo, options, onSuccess } = action.payload;

      const request = deskApi.transferTicket(pid, region, {
        payload: {
          assignment,
          agent: agentId,
          memo,
        },
      });

      const actions: any[] = [deskActions.transferTicketSuccess(), commonActions.hideDialogsRequest()];
      if (options.origin === 'tickets') {
        actions.push(
          commonActions.addNotificationsRequest({
            status: 'success',
            message: options.alert,
          }),
        );
      }

      if (options.origin === 'conversation') {
        // property list doesn't have func take a action to other ticket so current ticket will be affected
        actions.push(commonActions.pushHistory(`/${app_id}/desk/conversation`));
      }

      if (options.origin !== 'conversation') {
        const { parameters } = state.tickets;
        const { offset, limit } = state.tickets.pagination;
        actions.push(
          deskActions.fetchTicketsRequest({
            order: '-created_at',
            parameters,
            offset,
            limit,
          }),
        );
        actions.push(deskActions.fetchTicketDetailTicketRequest(action.payload.ticket.id));
      }

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((assignments) => {
          onSuccess && onSuccess(assignments.toAssignment);
          return from(actions);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketsActionTypes.TRANSFER_TICKET_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.transferTicketFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.transferTicketFail(error));
    }),
  );
};

export const closeTicketEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.CLOSE_TICKET_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region, app_id } = selectApplication_DEPRECATED(state);
      const { ticketId, closeComment, options, onSuccess } = action.payload;

      const request = deskApi.closeTicket(pid, region, {
        ticketId,
        closeComment,
      });

      const actions: any[] = [deskActions.closeTicketSuccess(), commonActions.hideDialogsRequest()];
      if (options.origin === 'tickets') {
        actions.push(
          commonActions.addNotificationsRequest({
            status: 'success',
            message: action.payload.options.alert,
          }),
        );
      } else if (options.origin === 'conversation') {
        actions.push(commonActions.pushHistory(`/${app_id}/desk/conversation`));
      } else {
        actions.push(deskActions.fetchTicketDetailTicketRequest(ticketId));
      }

      if (options.origin !== 'conversation') {
        const { parameters } = state.tickets;
        const { offset, limit } = state.tickets.pagination;
        actions.push(
          deskActions.fetchTicketsRequest({
            order: '-created_at',
            parameters,
            offset,
            limit,
          }),
        );
      }

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((value) => {
          onSuccess && onSuccess(value);
          return from(actions);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketsActionTypes.CLOSE_TICKET_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.closeTicketFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.closeTicketFail(error));
    }),
  );
};

export const reopenTicketEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.REOPEN_TICKET_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { ticketId, options, onSuccess } = action.payload;

      const request = deskApi.reopenTicket(pid, region, {
        ticketId,
      });

      const { parameters } = state.tickets;
      const { offset, limit } = state.tickets.pagination;
      const actions: any[] = [
        deskActions.reopenTicketSuccess(),
        commonActions.hideDialogsRequest(),
        commonActions.addNotificationsRequest({
          status: 'success',
          message: options.alert,
        }),
        deskActions.fetchTicketsRequest({
          order: '-created_at',
          parameters,
          offset,
          limit,
        }),
        deskActions.fetchTicketDetailTicketRequest(ticketId),
      ];
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((ticket) => {
          onSuccess && onSuccess(ticket);
          return from(actions);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketsActionTypes.REOPEN_TICKET_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.reopenTicketFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.reopenTicketFail(error));
    }),
  );
};

export const assignTicketToAgentGroupEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.ASSIGN_TICKET_TO_AGENT_GROUP_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region, app_id } = selectApplication_DEPRECATED(state);
      const { ticket, group, options, onSuccess } = action.payload;

      const request = deskApi.assignTicketToAgentGroup(pid, region, {
        ticketId: ticket.id,
        groupId: group.id,
      });

      const actions: any[] = [
        deskActions.assignTicketToAgentGroupSuccess(),
        commonActions.hideDialogsRequest(),
        commonActions.addNotificationsRequest({
          status: 'success',
          message: options.alert,
        }),
      ];

      if (options.origin === 'conversation') {
        actions.push(commonActions.pushHistory(`/${app_id}/desk/conversation`));
      }

      if (options.origin !== 'conversation') {
        const { parameters } = state.tickets;
        const { offset, limit } = state.tickets.pagination;
        actions.push(deskActions.fetchTicketDetailTicketRequest(ticket.id));
        actions.push(
          deskActions.fetchTicketsRequest({
            order: '-created_at',
            parameters,
            offset,
            limit,
          }),
        );
      }

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((value) => {
          onSuccess && onSuccess(value);
          return from(actions);
        }),
        takeUntil(
          action$.pipe(
            ofType(TicketsActionTypes.ASSIGN_TICKET_TO_AGENT_GROUP_CANCEL),
            mergeMap(() => {
              request.cancel();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.assignTicketToAgentGroupFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.assignTicketToAgentGroupFail(error));
    }),
  );
};

export const moveTicketToIdleEpic: SBEpicWithState<MoveTicketToIdleRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(TicketsActionTypes.MOVE_TICKET_TO_IDLE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const { ticket, origin, onSuccess } = action.payload;

      const { recentAssignment } = ticket;

      if (!recentAssignment) {
        throw new Error(`Undefined RecentAssignment: ${ticket.channelName}`);
      }

      const request = deskApi.updateTicketAssignment(pid, region, {
        assignmentId: recentAssignment.id,
        payload: {
          status: 'IDLE',
        },
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((value) => {
          onSuccess && onSuccess(value);
          const emittedActions: any[] = [deskActions.moveTicketToIdleSuccess()];
          if (origin !== 'conversation') {
            const { parameters } = state.tickets;
            const { offset, limit } = state.tickets.pagination;
            emittedActions.push(
              deskActions.fetchTicketsRequest({
                order: '-created_at',
                parameters,
                offset,
                limit,
              }),
            );
          }
          return from(emittedActions);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), deskActions.moveTicketToIdleFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.moveTicketToIdleFail(error));
    }),
  );
};
