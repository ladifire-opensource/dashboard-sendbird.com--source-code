import { createContext, useReducer, FC, useContext, useRef, useEffect } from 'react';

import { QueryParams } from './useQueryParams';

export type Tab = TicketTag['status'];

export type TabState = {
  key: Tab;
  page: number;
  pageSize: number;
  order: TicketTagSortOrder;
  data: { results: TicketTag[]; count: number };
  status: 'idle' | 'fetching' | 'success' | 'failed';
  error: string | null;
};

export type State = {
  query: string;
  selectedTab: Tab;
  tabs: TabState[];
  isAddMode: boolean;
  createTagRequest: {
    status: 'idle' | 'pending' | 'reloading';
    newTag: TicketTag | null;
    error: unknown | null;
  };
};

export type Action =
  | {
      type: 'UPDATE_STATE_BY_QUERY_PARAMS';
      payload: { queryParams: QueryParams; resetTheOtherTabToFirstPage?: boolean };
    }
  | { type: 'FETCH_TAGS_START'; payload: { tab: Tab } }
  | { type: 'FETCH_TAGS_SUCCESS'; payload: { tab: Tab; data: TabState['data'] } }
  | { type: 'FETCH_TAGS_FAIL'; payload: { tab: Tab; error: string } }
  | { type: 'SET_ADD_MODE'; payload: { isAddMode: boolean } }
  | { type: 'CREATE_TAG_START' }
  | { type: 'CREATE_TAG_SUCCESS'; payload: { newTag: TicketTag | null; status: State['createTagRequest']['status'] } }
  | { type: 'CREATE_TAG_FAIL'; payload: { error: unknown } }
  | { type: 'CREATE_TAG_CLEAR_ERROR' }
  | { type: 'UPDATE_TAG'; payload: { tag: TicketTag } };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_STATE_BY_QUERY_PARAMS': {
      const { queryParams, resetTheOtherTabToFirstPage } = action.payload;
      return {
        ...state,
        query: queryParams.q,
        selectedTab: queryParams.status,
        tabs: state.tabs.map((tab) => {
          if (tab.key === queryParams.status) {
            return { ...tab, page: queryParams.page, pageSize: queryParams.pageSize, order: queryParams.order };
          }
          return resetTheOtherTabToFirstPage ? { ...tab, page: 1 } : tab;
        }),
      };
    }

    case 'FETCH_TAGS_START':
      return {
        ...state,
        tabs: state.tabs.map((tab) => (tab.key === action.payload.tab ? { ...tab, status: 'fetching' } : tab)),
      };

    case 'FETCH_TAGS_SUCCESS':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.key === action.payload.tab ? { ...tab, status: 'success', data: action.payload.data, error: null } : tab,
        ),
        createTagRequest: { ...state.createTagRequest, status: 'idle' },
      };

    case 'FETCH_TAGS_FAIL':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.key === action.payload.tab ? { ...tab, status: 'failed', error: action.payload.error } : tab,
        ),
      };

    case 'SET_ADD_MODE':
      return { ...state, isAddMode: action.payload.isAddMode };

    case 'CREATE_TAG_START':
      return { ...state, createTagRequest: { ...state.createTagRequest, status: 'pending' } };

    case 'CREATE_TAG_SUCCESS':
      return {
        ...state,
        createTagRequest: {
          status: action.payload.status,
          newTag: action.payload.newTag,
          error: null,
        },
      };

    case 'CREATE_TAG_FAIL':
      return {
        ...state,
        createTagRequest: {
          ...state.createTagRequest,
          status: 'idle',
          error: action.payload.error,
        },
      };

    case 'CREATE_TAG_CLEAR_ERROR':
      return { ...state, createTagRequest: { ...state.createTagRequest, error: null } };

    case 'UPDATE_TAG':
      return {
        ...state,
        tabs: state.tabs.map((tab) =>
          tab.key === action.payload.tag.status
            ? {
                ...tab,
                data: {
                  ...tab.data,
                  results: tab.data.results.map((item) =>
                    item.id === action.payload.tag.id ? action.payload.tag : item,
                  ),
                },
              }
            : tab,
        ),
      };

    default:
      return state;
  }
};

export const useTicketTagsReducer = (initialState: State) => useReducer(reducer, initialState);

const TicketTagsDispatchActionContext = createContext<ReturnType<typeof useTicketTagsReducer>[1]>(undefined as any);

const TicketTagsStateContext = createContext<ReturnType<typeof useTicketTagsReducer>[0]>(undefined as any);

export const TicketTagsReducerContextProvider: FC<{ value: ReturnType<typeof useTicketTagsReducer> }> = ({
  value,
  children,
}) => (
  <TicketTagsStateContext.Provider value={value[0]}>
    <TicketTagsDispatchActionContext.Provider value={value[1]}>{children}</TicketTagsDispatchActionContext.Provider>
  </TicketTagsStateContext.Provider>
);

export const useTicketTagsDispatchAction = () => useContext(TicketTagsDispatchActionContext);

export const useTicketTagsState = () => useContext(TicketTagsStateContext);

export const useTicketTagsStateRef = () => {
  const value = useTicketTagsState();
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
};
