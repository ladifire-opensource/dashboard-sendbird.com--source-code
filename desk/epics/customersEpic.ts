import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom, takeUntil } from 'rxjs/operators';

import { deskActions } from '@actions';
import { CustomersActionTypes } from '@actions/types';
import { deskApi } from '@api';
import { TicketStatus, TicketType } from '@constants';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';

export const fetchCustomersEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(CustomersActionTypes.FETCH_CUSTOMERS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const pagination = {
        offset: action.payload.offset,
        limit: action.payload.limit,
      };
      const parameters = `?limit=${pagination.limit}&offset=${pagination.offset}${
        action.payload.query ? `&query=${action.payload.query}` : ''
      }`;
      const request = deskApi.fetchCustomers({
        pid,
        region,
        ...pagination,
        parameters,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((customers) => {
          return from([
            deskActions.fetchCustomersSuccess({
              count: customers.count,
              items: customers.results,
            }),
            deskActions.setCustomersPagination(pagination),
          ]);
        }),
        takeUntil(
          action$.pipe(
            ofType(CustomersActionTypes.FETCH_CUSTOMERS_CANCEL),
            mergeMap(() => {
              request['cancel']();
              return of({});
            }),
          ),
        ),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchCustomersFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchCustomersFail(error));
    }),
  );
};

export const fetchCustomerEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(CustomersActionTypes.FETCH_CUSTOMER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);

      const request = deskApi.fetchCustomer({
        pid,
        region,
        customerId: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((customer) => {
          return from([deskActions.fetchCustomerSuccess(customer)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchCustomerFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchCustomerFail(error));
    }),
  );
};

export const fetchCustomerTicketsEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(CustomersActionTypes.FETCH_CUSTOMER_TICKETS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { pid } = state.desk.project;
      const { region } = selectApplication_DEPRECATED(state);
      const { limit, offset, customerId, ticketStatus = TicketStatus.ALL, ticketType } = action.payload;

      const getTicketStatus = () => {
        const allTickets = [
          TicketStatus.ACTIVE,
          TicketStatus.IDLE,
          TicketStatus.PENDING,
          TicketStatus.WIP,
          TicketStatus.CLOSED,
        ];
        if (ticketStatus === TicketStatus.ALL) {
          if (ticketType !== TicketType.CUSTOMER_CHAT) {
            return [...allTickets, TicketStatus.PROACTIVE];
          }

          return allTickets;
        }

        return ticketStatus;
      };

      const parameters = {
        limit,
        offset,
        customer: customerId,
        order: '-created_at',
        status2: getTicketStatus(),
        ticket_type: ticketType,
        has_proactive_message_count: true,
      };

      const request = deskApi.fetchTickets(pid, region, parameters);
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((tickets) => {
          return from([
            deskActions.fetchCustomerTicketsSuccess({
              count: tickets.count,
              items: tickets.results,
            }),
            deskActions.setCustomerTicketsPagination({
              limit: action.payload.limit,
              offset: action.payload.offset,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), deskActions.fetchCustomerTicketsFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(deskActions.fetchCustomerTicketsFail(error));
    }),
  );
};
