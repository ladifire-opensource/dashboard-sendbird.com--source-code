import { AuthenticationActionTypes, DeskActionTypes } from '@actions/types';

const initialState = {
  isFetching: false,
  isUpdating: false,
  authenticated: false,
  connected: false,
  id: 0,
  project: {} as Project,
  agent: {} as AgentDetail,
  apiTokens: {
    items: [],
    isFetching: false,
    pagination: {
      limit: 25,
      offset: 0,
      count: 0,
      page: 1,
    },
  },
};

export const deskReducer = (state: DeskStoreState = initialState, action) => {
  switch (action.type) {
    case DeskActionTypes.DESK_AUTHENTICATION_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case DeskActionTypes.DESK_AUTHENTICATION_SUCCESS:
      return {
        ...state,
        isFetching: false,
        authenticated: true,
        id: action.payload.id,
        agent: action.payload.agent,
        project: action.payload.agent.project,
      };

    case DeskActionTypes.UPDATE_PROJECT_REQUEST:
    case DeskActionTypes.UPDATE_OPERATION_HOURS_REQUEST:
      return {
        ...state,
        isUpdating: true,
      };
    case DeskActionTypes.UPDATE_PROJECT_SUCCESS:
    case DeskActionTypes.UPDATE_PROJECT_FAIL:
    case DeskActionTypes.UPDATE_OPERATION_HOURS_SUCCESS:
    case DeskActionTypes.UPDATE_OPERATION_HOURS_FAIL:
      return {
        ...state,
        isUpdating: false,
      };

    case DeskActionTypes.SET_DESK_CONNECTED:
      return {
        ...state,
        connected: action.payload,
      };
    case DeskActionTypes.SET_DESK_PROJECT:
      return {
        ...state,
        project: {
          ...state.project,
          ...action.payload,
        },
      };
    case DeskActionTypes.SET_DESK_AGENT:
      return {
        ...state,
        agent: {
          ...state.agent,
          ...action.payload,
        },
      };
    case DeskActionTypes.SET_AGENT_CONNECTION:
      return {
        ...state,
        agent: {
          ...state.agent,
          connection: action.payload,
        },
      };
    case DeskActionTypes.FETCH_API_TOKENS_REQUEST:
      return {
        ...state,
        apiTokens: {
          ...state.apiTokens,
          isFetching: true,
        },
      };
    case DeskActionTypes.FETCH_API_TOKENS_SUCCESS:
      return {
        ...state,
        apiTokens: {
          items: action.payload.results,
          pagination: {
            ...state.apiTokens.pagination,
            count: action.payload.count,
          },
          isFetching: false,
        },
      };
    case DeskActionTypes.FETCH_API_TOKENS_FAIL:
      return {
        ...state,
        apiTokens: {
          ...state.apiTokens,
          isFetching: false,
        },
      };
    case DeskActionTypes.SET_API_TOKEN_PAGINATION:
      return {
        ...state,
        apiTokens: {
          ...state.apiTokens,
          pagination: {
            ...state.apiTokens.pagination,
            limit: action.payload.limit,
            offset: action.payload.offset,
            page: action.payload.offset / action.payload.limit + 1,
          },
        },
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
    case DeskActionTypes.RESET_DESK:
      return initialState;
    default:
      return state;
  }
};
