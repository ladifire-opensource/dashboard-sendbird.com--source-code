import { createAction } from '@actions/createAction';
import { CustomersActionTypes } from '@actions/types';
import { TicketStatus, TicketType } from '@constants';

export const CustomersActions = {
  fetchCustomersRequest: (payload: { offset: number; limit: number; query: string }) =>
    createAction(CustomersActionTypes.FETCH_CUSTOMERS_REQUEST, payload),
  fetchCustomersSuccess: (payload) => createAction(CustomersActionTypes.FETCH_CUSTOMERS_SUCCESS, payload),
  fetchCustomersFail: (payload) => createAction(CustomersActionTypes.FETCH_CUSTOMERS_FAIL, payload),
  fetchCustomersCancel: () => createAction(CustomersActionTypes.FETCH_CUSTOMERS_CANCEL),
  fetchCustomerRequest: (customerId: number) => createAction(CustomersActionTypes.FETCH_CUSTOMER_REQUEST, customerId),
  fetchCustomerSuccess: (payload) => createAction(CustomersActionTypes.FETCH_CUSTOMER_SUCCESS, payload),
  fetchCustomerFail: (payload) => createAction(CustomersActionTypes.FETCH_CUSTOMER_FAIL, payload),
  fetchCustomerCancel: () => createAction(CustomersActionTypes.FETCH_CUSTOMER_CANCEL),
  fetchCustomerTicketsRequest: (payload: {
    offset: number;
    limit: number;
    customerId: number;
    ticketStatus?: TicketStatus;
    ticketType?: TicketType;
  }) => createAction(CustomersActionTypes.FETCH_CUSTOMER_TICKETS_REQUEST, payload),
  fetchCustomerTicketsSuccess: (payload) => createAction(CustomersActionTypes.FETCH_CUSTOMER_TICKETS_SUCCESS, payload),
  fetchCustomerTicketsFail: (payload) => createAction(CustomersActionTypes.FETCH_CUSTOMER_TICKETS_FAIL, payload),
  fetchCustomerTicketsCancel: () => createAction(CustomersActionTypes.FETCH_CUSTOMER_TICKETS_CANCEL),
  setCustomersSearchQuery: (payload: string) => createAction(CustomersActionTypes.SET_CUSTOMERS_SEARCH_QUERY, payload),
  setCustomersPagination: (payload) => createAction(CustomersActionTypes.SET_CUSTOMERS_PAGINATION, payload),
  setCustomerTicketsPagination: (payload) =>
    createAction(CustomersActionTypes.SET_CUSTOMER_TICKETS_PAGINATION, payload),
};
