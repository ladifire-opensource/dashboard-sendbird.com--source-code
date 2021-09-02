import { AgentGroupActionTypes, AuthenticationActionTypes } from '@actions/types';
import { AGENT_GROUP_LIST_LIMIT } from '@constants';

export const initialState: AgentGroupsState = {
  isFetching: false,
  items: [],
  query: '',
  formItem: {
    id: 0,
    name: '',
    key: '',
    description: '',
    project: 0,
    createdAt: '',
    createdBy: 0,
    members: [],
  },
  current: {
    agentSearchQuery: '',
    agents: [],
  },
  pagination: {
    offset: 0,
    limit: AGENT_GROUP_LIST_LIMIT,
    count: 0,
    page: 1,
  } as LimitOffsetPagination,
};

export const agentGroupsReducer = (state = initialState, action): AgentGroupsState => {
  switch (action.type) {
    case AgentGroupActionTypes.FETCH_AGENT_GROUPS_REQUEST:
    case AgentGroupActionTypes.FETCH_AGENT_GROUP_REQUEST:

    case AgentGroupActionTypes.FETCH_CURRENT_AGENTS_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case AgentGroupActionTypes.FETCH_AGENT_GROUPS_FAIL:
    case AgentGroupActionTypes.FETCH_AGENT_GROUP_FAIL:

    case AgentGroupActionTypes.FETCH_CURRENT_AGENTS_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case AgentGroupActionTypes.FETCH_AGENT_GROUPS_SUCCESS:
      return {
        ...state,
        items: action.payload.items,
        pagination: action.payload.pagination,
        isFetching: false,
      };

    case AgentGroupActionTypes.FETCH_AGENT_GROUP_SUCCESS:
      return {
        ...state,
        formItem: action.payload.formItem,
        isFetching: false,
      };

    case AgentGroupActionTypes.FETCH_CURRENT_AGENTS_SUCCESS:
      return {
        ...state,
        current: {
          ...state.current,
          agents: action.payload.agents.map(({ id, photoThumbnailUrl, email, displayName }) => ({
            id,
            photoThumbnailUrl,
            email,
            displayName,
          })),
        },
        isFetching: false,
      };

    case AgentGroupActionTypes.UPDATE_AGENT_GROUP_MEMBERS:
      return {
        ...state,
        formItem: {
          ...state.formItem,
          members: action.payload.members,
        },
      };

    case AgentGroupActionTypes.UPDATE_AGENT_GROUP_QUERY:
      return {
        ...state,
        query: action.payload.query,
      };

    case AgentGroupActionTypes.UPDATE_CURRENT_AGENT_SEARCH_QUERY:
      return {
        ...state,
        current: {
          ...state.current,
          agentSearchQuery: action.payload.query,
        },
      };

    case AgentGroupActionTypes.RESET_AGENT_GROUP_FORM_ITEM:
      return {
        ...state,
        formItem: initialState.formItem,
        current: {
          ...state.current,
          agentSearchQuery: '',
        },
      };

    case AgentGroupActionTypes.DELETE_AGENT_GROUP_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case AgentGroupActionTypes.DELETE_AGENT_GROUP_SUCCESS:
      return {
        ...state,
        isFetching: false,
      };
    case AgentGroupActionTypes.DELETE_AGENT_GROUP_FAIL:
      return {
        ...state,
        isFetching: false,
      };

    case AgentGroupActionTypes.RESET_AGENT_GROUPS:
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
