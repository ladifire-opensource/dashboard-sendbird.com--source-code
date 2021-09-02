import { Reducer } from 'react';

import flow from 'lodash/flow';

type State = {
  isFetching: boolean;
  isFetchingLoadMore: boolean;

  isFetchingCurrent: boolean;

  items: DataExport[];

  limit: PerPage;
  token: string;

  current: DataExport | null;
  dataType: DataExport['data_type'];
};

type Action =
  | { type: 'FETCH_DATA_EXPORTS_REQUEST'; payload: any }
  | {
      type: 'FETCH_DATA_EXPORTS_SUCCESS';
      payload: { exported_data: DataExport[]; isLoadMore: boolean; next: string | null };
    }
  | { type: 'FETCH_DATA_EXPORTS_FAIL'; payload: any }
  | { type: 'REQUEST_DATA_EXPORT_REQUEST'; payload?: any }
  | { type: 'REQUEST_DATA_EXPORT_SUCCESS'; payload?: any }
  | { type: 'REQUEST_DATA_EXPORT_FAIL'; payload: any }
  | { type: 'FETCH_CURRENT_DATA_EXPORT_REQUEST'; payload: any }
  | { type: 'FETCH_CURRENT_DATA_EXPORT_SUCCESS'; payload: DataExport }
  | { type: 'FETCH_CURRENT_DATA_EXPORT_FAIL'; payload: any }
  | { type: 'UPDATE_DATA_EXPORT'; payload: DataExport }
  | { type: 'SET_DATA_TYPE'; payload: DataExport['data_type'] };

type UpdateFunction = CurriedStateUpdateFunction<State>;
type ReducerItem<T> = ActionReducer<State, T>;

const setIsFetching: UpdateFunction = (isFetching: boolean, nextToken) => (prevState) => {
  if (nextToken) {
    return {
      ...prevState,
      isFetchingLoadMore: isFetching,
    };
  }
  return {
    ...prevState,
    isFetching,
    isFetchingLoadMore: isFetching,
  };
};

const setIsFetchingCurrent: UpdateFunction = (isFetchingCurrent: boolean) => (prevState) => ({
  ...prevState,
  isFetchingCurrent,
});

const updateDataExports: UpdateFunction = (items: DataExport[], isLoadMore) => (prevState) => {
  if (isLoadMore) {
    return {
      ...prevState,
      items: prevState.items.concat(items),
    };
  }
  return {
    ...prevState,
    items,
  };
};

const updateToken: UpdateFunction = (token = '') => (prevState) => ({
  ...prevState,
  token,
});

const fetchDataExportsRequest: ReducerItem<{
  app_id: Application['app_id'];
  data_type: DataExport['data_type'];
  limit: number;
  token: string;
}> = (prevState, payload) => flow([setIsFetching(true, payload.token)])(prevState);

const fetchDataExportsSuccess: ReducerItem<{ exported_data: DataExport[]; isLoadMore: boolean; next: string }> = (
  prevState,
  payload,
) =>
  flow([setIsFetching(false), updateDataExports(payload.exported_data, payload.isLoadMore), updateToken(payload.next)])(
    prevState,
  );

const fetchDataExportsFail: ReducerItem<string> = (prevState) => flow([setIsFetching(false)])(prevState);

const requestDataExportRequest: ReducerItem<null> = (prevState) => flow([setIsFetching(true)])(prevState);

const requestDataExportSuccess: ReducerItem<DataExport> = (prevState) => flow([setIsFetching(false)])(prevState);

const requestDataExportFail: ReducerItem<string> = (prevState) => flow([setIsFetching(false)])(prevState);

const fetchCurrentDataExportRequest: ReducerItem<{
  app_id: Application['app_id'];
  data_type: DataExport['data_type'];
  request_id: DataExport['request_id'];
}> = (prevState) => setIsFetchingCurrent(true)(prevState);

const setCurrentDataExport = (payload: DataExport) => (prevState) => ({
  ...prevState,
  current: payload,
});

const fetchCurrentDataExportSuccess: ReducerItem<DataExport> = (prevState, payload) =>
  flow([setIsFetchingCurrent(false), setCurrentDataExport(payload)])(prevState);

const fetchCurrentDataExportFail: ReducerItem<string> = (prevState) => setIsFetchingCurrent(false)(prevState);

const updateDataExport: ReducerItem<DataExport> = (prevState, payload) => ({
  ...prevState,
  items: prevState.items.map((item) => (item.request_id === payload.request_id ? payload : item)),
  current: prevState.current?.request_id === payload.request_id ? payload : prevState.current,
});

const setDataType: ReducerItem<DataExport['data_type']> = (prevState, payload) => ({
  ...prevState,
  dataType: payload,
});

const reducerMap: Record<Action['type'], ReducerItem<any>> = {
  FETCH_DATA_EXPORTS_REQUEST: fetchDataExportsRequest,
  FETCH_DATA_EXPORTS_SUCCESS: fetchDataExportsSuccess,
  FETCH_DATA_EXPORTS_FAIL: fetchDataExportsFail,
  REQUEST_DATA_EXPORT_REQUEST: requestDataExportRequest,
  REQUEST_DATA_EXPORT_SUCCESS: requestDataExportSuccess,
  REQUEST_DATA_EXPORT_FAIL: requestDataExportFail,
  FETCH_CURRENT_DATA_EXPORT_REQUEST: fetchCurrentDataExportRequest,
  FETCH_CURRENT_DATA_EXPORT_SUCCESS: fetchCurrentDataExportSuccess,
  FETCH_CURRENT_DATA_EXPORT_FAIL: fetchCurrentDataExportFail,
  UPDATE_DATA_EXPORT: updateDataExport,
  SET_DATA_TYPE: setDataType,
};

export const reducer: Reducer<State, Action> = (prevState, action) =>
  reducerMap[action.type] ? reducerMap[action.type](prevState, action.payload) : prevState;

export const initialState: State = {
  isFetching: false,
  isFetchingLoadMore: false,
  isFetchingCurrent: false,

  items: [],

  limit: 20,
  token: '',

  current: null,
  dataType: 'messages',
};
