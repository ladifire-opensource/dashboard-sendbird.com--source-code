import { createContext, useReducer, useCallback, useMemo, useEffect, useContext, useState } from 'react';
import { useIntl } from 'react-intl';
import { useRouteMatch } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

import { toast } from 'feather';

import { fetchDataExports, fetchDataExport, requestDataExport } from '@chat/api';
import { getErrorMessage } from '@epics';
import { useAppId } from '@hooks';

import { reducer, initialState } from './reducer';

type Actions = {
  fetchList: (newToken?: any) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (options: {
    dataType: DataExportDataType;
    payload: DataExportPayload;
    onSuccess?: (newItem: DataExport) => void;
  }) => Promise<void>;
  setDataType: (dataType: DataExport['data_type']) => void;
  updateItem: (item: DataExport) => void;
};

const useCurrentRequestId = () => {
  const match = useRouteMatch<{ requestId: string }>(`/:appId/data_exports/:requestId`);
  return match?.params?.requestId;
};

type HistoryState = ({ historyType: string } & DataExport) | undefined;

export const useDataExportReducer = () => {
  const intl = useIntl();
  const history = useHistory<HistoryState>();
  const app_id = useAppId();
  const currentRequestId = useCurrentRequestId();

  const [duplicatedFilters, setDuplicatedFilters] = useState<Partial<DataExport> | null>(null);

  const [
    { isFetching, isFetchingLoadMore, isFetchingCurrent, items, limit, token, current, dataType },
    dispatch,
  ] = useReducer(reducer, initialState);

  const fetchDataExportsRequest = useCallback(async (payload) => {
    dispatch({ type: 'FETCH_DATA_EXPORTS_REQUEST', payload });
    try {
      const { data } = await fetchDataExports(payload);
      dispatch({
        type: 'FETCH_DATA_EXPORTS_SUCCESS',
        payload: {
          ...data,
          isLoadMore: !!payload.token,
        },
      });
    } catch (error) {
      dispatch({ type: 'FETCH_DATA_EXPORTS_FAIL', payload: '' });
    }
  }, []);

  const fetchList = useCallback(
    async (newToken = '') => {
      await fetchDataExportsRequest({ app_id, data_type: dataType, limit, token: newToken });
    },
    [app_id, fetchDataExportsRequest, dataType, limit],
  );

  const loadMore = useCallback(async () => {
    fetchList(token);
  }, [fetchList, token]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const create: Actions['create'] = useCallback(
    async ({ dataType, payload, onSuccess }) => {
      dispatch({ type: 'REQUEST_DATA_EXPORT_REQUEST' });
      try {
        const { data } = await requestDataExport({ app_id, data_type: dataType, payload });
        toast.success({
          message: intl.formatMessage({ id: 'chat.dataExport.toast.create' }),
        });
        dispatch({ type: 'REQUEST_DATA_EXPORT_SUCCESS' });
        onSuccess?.(data);
        await fetchList();
      } catch (error) {
        dispatch({ type: 'REQUEST_DATA_EXPORT_FAIL', payload: '' });
        toast.error({
          message: getErrorMessage(error),
        });
      }
    },
    [app_id, intl, fetchList],
  );

  const fetchDetail = useCallback(
    async (request_id) => {
      if (app_id == null) {
        return;
      }

      const payload = { app_id, data_type: dataType, request_id };
      dispatch({ type: 'FETCH_CURRENT_DATA_EXPORT_REQUEST', payload });
      try {
        const { data } = await fetchDataExport(payload);
        dispatch({
          type: 'FETCH_CURRENT_DATA_EXPORT_SUCCESS',
          payload: data,
        });
      } catch (error) {
        dispatch({ type: 'FETCH_CURRENT_DATA_EXPORT_FAIL', payload: '' });
      }
    },
    [app_id, dataType],
  );

  const setDataType = (dataType) => dispatch({ type: 'SET_DATA_TYPE', payload: dataType });

  const updateItem = useCallback((item: DataExport) => {
    dispatch({ type: 'UPDATE_DATA_EXPORT', payload: item });
  }, []);

  /**
   * FIXME: Platform API still has a weird interface for the resource presentation
   * It should handle data_type as a get parameter not the path
   * current: /v3/data_export/messages(whatever in data_type)/{request_id} all works fine.
   * Single data export resource present same data model
   */
  useEffect(() => {
    const { state } = history.location;
    if (currentRequestId !== current?.request_id) {
      fetchDetail(currentRequestId);
      return;
    }
    if (state?.historyType === 'duplicate') {
      setDuplicatedFilters(state);
    }
  }, [current, currentRequestId, fetchDetail, history.location]);

  return useMemo(
    () => ({
      isFetching,
      isFetchingLoadMore,
      isFetchingCurrent,
      items,
      limit,
      token,
      current,
      dataType,
      duplicatedFilters,
      actions: {
        fetchList,
        loadMore,
        create,
        setDataType,
        updateItem,
      },
    }),
    [
      isFetching,
      isFetchingLoadMore,
      isFetchingCurrent,
      items,
      limit,
      token,
      current,
      dataType,
      duplicatedFilters,
      fetchList,
      loadMore,
      create,
      updateItem,
    ],
  );
};

export const DataExportContext = createContext<
  typeof initialState & {
    actions: Actions;
  } & {
    duplicatedFilters: Partial<DataExport> | null;
  }
>({
  ...initialState,
  duplicatedFilters: null,
  actions: {} as Actions,
});

export const useDataExport = () => useContext(DataExportContext);
