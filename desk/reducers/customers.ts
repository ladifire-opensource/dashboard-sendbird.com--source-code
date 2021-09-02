import { CustomersActionTypes, AuthenticationActionTypes } from '@actions/types';
import { TicketStatus } from '@constants';

const initialState: CustomersState = {
  isFetching: false,
  query: '',
  items: [],
  pagination: {
    limit: 10,
    offset: 0,
    count: 0,
    page: 1,
  } as LimitOffsetPagination,

  isFetchingCurrent: false,
  current: {} as Customer,

  isFetchingCustomerTickets: false,
  customerTicketsStatus: TicketStatus.ALL,
  customerTickets: [],
  customerTicketsPagination: {
    limit: 10,
    offset: 0,
    count: 0,
    page: 1,
  } as LimitOffsetPagination,
};

export const customersReducer: Reducer<CustomersState> = (state = initialState, action) => {
  switch (action.type) {
    case CustomersActionTypes.FETCH_CUSTOMERS_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case CustomersActionTypes.FETCH_CUSTOMERS_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case CustomersActionTypes.FETCH_CUSTOMERS_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        pagination: {
          limit: state.pagination.limit,
          offset: state.pagination.offset,
          count: action.payload.count,
          page: state.pagination.page,
        },
        isFetching: false,
      };
    case CustomersActionTypes.SET_CUSTOMERS_PAGINATION:
      return {
        ...state,
        pagination: {
          limit: action.payload.limit,
          offset: action.payload.offset,
          count: state.pagination.count,
          page: action.payload.offset / action.payload.limit + 1,
        },
      };
    case CustomersActionTypes.FETCH_CUSTOMER_REQUEST:
      return {
        ...state,
        isFetchingCurrent: true,
      };
    case CustomersActionTypes.FETCH_CUSTOMER_SUCCESS:
      return {
        ...state,
        isFetchingCurrent: false,
        current: action.payload,
      };
    case CustomersActionTypes.FETCH_CUSTOMER_TICKETS_REQUEST:
      return {
        ...state,
        customerTicketsStatus: action.payload.ticketStatus ?? TicketStatus.ALL,
        isFetchingCustomerTickets: true,
      };
    case CustomersActionTypes.FETCH_CUSTOMER_TICKETS_SUCCESS:
      return {
        ...state,
        isFetchingCustomerTickets: false,
        customerTickets: action.payload.items,
        customerTicketsPagination: {
          limit: state.customerTicketsPagination.limit,
          offset: state.customerTicketsPagination.offset,
          count: action.payload.count,
          page: state.customerTicketsPagination.page,
        },
      };
    case CustomersActionTypes.SET_CUSTOMER_TICKETS_PAGINATION:
      return {
        ...state,
        customerTicketsPagination: {
          limit: action.payload.limit,
          offset: action.payload.offset,
          count: state.customerTicketsPagination.count,
          page: action.payload.offset / action.payload.limit + 1,
        },
      };
    case CustomersActionTypes.SET_CUSTOMERS_SEARCH_QUERY:
      return {
        ...state,
        query: action.payload,
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
