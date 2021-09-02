import { Reducer } from 'react';

import flow from 'lodash/flow';

import { mergeApplications } from '@utils';

type State = {
  rawSearchQuery: string;
  searchQuery: string;
  results: ApplicationSummary[];
  offset: number;
  count: number;
  isFetching: boolean;
  error: string | null;
};

type Action =
  | { type: 'UPDATE_RAW_SEARCH_QUERY'; payload: string }
  | { type: 'SEARCH_APPLICATIONS_REQUEST'; payload: { searchQuery: string } }
  | { type: 'SEARCH_APPLICATIONS_SUCCESS'; payload: FetchApplicationsResponse }
  | { type: 'SEARCH_APPLICATIONS_FAIL'; payload: string }
  | { type: 'FETCH_NEXT_RESULTS_REQUEST'; payload?: undefined }
  | { type: 'FETCH_NEXT_RESULTS_SUCCESS'; payload: FetchApplicationsResponse }
  | { type: 'FETCH_NEXT_RESULTS_FAIL'; payload: string }
  | { type: 'PATCH_RESULT_ITEM'; payload: { appID: string; appName: string } }
  | { type: 'DELETE_RESULT_ITEM'; payload: { appID: string } };

type ActionReducer = (prevState: State, payload: any) => State;

type StateUpdateFunction = (prevState: State) => State;
type CurriedStateUpdateFunction = (...args: any) => StateUpdateFunction;

const resetLimitAndOffset: StateUpdateFunction = (prevState) => ({ ...prevState, offset: 0 });
const clearError: StateUpdateFunction = (prevState) => ({ ...prevState, error: null });

const setSearchQuery: CurriedStateUpdateFunction = (value: string) => (prevState) => ({
  ...prevState,
  searchQuery: value,
});

const setRawSearchQuery: CurriedStateUpdateFunction = (value: string) => (prevState) => ({
  ...prevState,
  rawSearchQuery: value,
});

const setOffset: CurriedStateUpdateFunction = (offset: number) => (prevState) => ({ ...prevState, offset });

const setIsFetching: CurriedStateUpdateFunction = (value: boolean) => (prevState) => ({
  ...prevState,
  isFetching: value,
});

const setError: CurriedStateUpdateFunction = (value: string) => (prevState) => ({ ...prevState, error: value });

const setCount: CurriedStateUpdateFunction = (value: number) => (prevState) => ({ ...prevState, count: value });

const setResults: CurriedStateUpdateFunction = (results: ApplicationSummary[]) => (prevState) => ({
  ...prevState,
  results,
});

const addNewResults: CurriedStateUpdateFunction = (newItems: ApplicationSummary[]) => (prevState) => ({
  ...prevState,
  results: mergeApplications(prevState.results, newItems),
});

const updateRawSearchQuery: ActionReducer = (prevState, payload: string) =>
  flow([setRawSearchQuery(payload), setSearchQuery(payload.trim())])(prevState);

const searchApplicationsRequest: ActionReducer = (prevState, payload: { searchQuery: string }) =>
  flow([setSearchQuery(payload.searchQuery), resetLimitAndOffset, setIsFetching(true)])(prevState);

const searchApplicationsSuccess: ActionReducer = (prevState, payload: FetchApplicationsResponse) =>
  flow([setIsFetching(false), clearError, setCount(payload.count), setResults(payload.results)])(prevState);

const searchApplicationsFail: ActionReducer = (prevState, payload: string) =>
  flow([setIsFetching(false), setError(payload)])(prevState);

const fetchNextResultsRequest: ActionReducer = (prevState) =>
  flow([setIsFetching(true), setOffset(prevState.results.length)])(prevState);

const fetchNextResultsSuccess: ActionReducer = (prevState, payload: FetchApplicationsResponse) =>
  flow([setIsFetching(false), clearError, addNewResults(payload.results)])(prevState);

const fetchNextResultsFail = searchApplicationsFail;

const patchResultItem: ActionReducer = (prevState, payload: { appID: string; appName: string }) => ({
  ...prevState,
  results: prevState.results.map((item) =>
    item.app_id === payload.appID ? { ...item, app_name: payload.appName } : item,
  ),
});

const deleteResultItem: ActionReducer = (prevState, payload: { appID: string }) => ({
  ...prevState,
  results: prevState.results.filter((item) => item.app_id !== payload.appID),
  count: prevState.count - 1,
});

const reducerMap: Record<Action['type'], ActionReducer> = {
  UPDATE_RAW_SEARCH_QUERY: updateRawSearchQuery,
  SEARCH_APPLICATIONS_REQUEST: searchApplicationsRequest,
  SEARCH_APPLICATIONS_SUCCESS: searchApplicationsSuccess,
  SEARCH_APPLICATIONS_FAIL: searchApplicationsFail,
  FETCH_NEXT_RESULTS_REQUEST: fetchNextResultsRequest,
  FETCH_NEXT_RESULTS_SUCCESS: fetchNextResultsSuccess,
  FETCH_NEXT_RESULTS_FAIL: fetchNextResultsFail,
  PATCH_RESULT_ITEM: patchResultItem,
  DELETE_RESULT_ITEM: deleteResultItem,
};
export const reducer: Reducer<State, Action> = (prevState, action) =>
  reducerMap[action.type] ? reducerMap[action.type](prevState, action.payload) : prevState;

export const initialState: State = {
  rawSearchQuery: '',
  searchQuery: '',
  results: [],
  offset: 0,
  count: 0,
  isFetching: false,
  error: null,
};
