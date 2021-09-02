import { useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import throttle from 'lodash/throttle';

import { commonActions } from '@actions';
import { ApplicationActionTypes, SettingsActionTypes } from '@actions/types';
import { fetchApplications } from '@common/api';
import { APPLICATION_LIST_LIMIT } from '@constants';
import { getErrorMessage } from '@epics';

import { reducer, initialState } from './reducers';

export enum ApplicationSearchFilterParam {
  AppName = 'app_name',
  AppNameOrAppID = 'app_name_or_app_id',
}

export const useApplicationSearch = (
  limit: number = APPLICATION_LIST_LIMIT,
  order: FetchAppliationsOrderParam = 'app_name',
  searchType: ApplicationSearchFilterParam = ApplicationSearchFilterParam.AppName,
) => {
  const [{ rawSearchQuery, searchQuery, isFetching, results: items, count, error }, dispatch] = useReducer(
    reducer,
    initialState,
  );
  const searchRequest = useRef<ReturnType<typeof fetchApplications> | null>(null);
  const isFetchingRef = useRef(isFetching);
  const dispatchReduxAction = useDispatch();

  const isSearchResultVisible = !!searchQuery;
  const hasMore = items.length < count;

  const sendRequest = useCallback(
    async (payload: { offset: number; app_name?: string; app_name_or_app_id?: string }) => {
      searchRequest.current = fetchApplications({ limit, order, ...payload });
      return searchRequest.current;
    },
    [limit, order],
  );

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const applicationUpdate = useSelector((state: RootState) => state.applicationUpdate);

  const searchApplicationsRequest = useRef<(query: string) => void>();

  useEffect(() => {
    searchApplicationsRequest.current = throttle(async (query: string) => {
      if (searchRequest.current) {
        searchRequest.current.cancel();
      }

      dispatch({ type: 'SEARCH_APPLICATIONS_REQUEST', payload: { searchQuery: query.trim() } });
      try {
        const { data } = await sendRequest({ offset: 0, [searchType]: query });
        dispatch({ type: 'SEARCH_APPLICATIONS_SUCCESS', payload: data });

        if (!query) {
          // when fetched all applications, update organization's application count
          dispatchReduxAction(commonActions.updateOrganizationSuccess({ total_applications: data.count }));
        }
      } catch (error) {
        dispatch({ type: 'SEARCH_APPLICATIONS_FAIL', payload: getErrorMessage(error) });
      } finally {
        searchRequest.current = null;
      }
    }, 200);
  }, [dispatchReduxAction, searchType, sendRequest]);

  const updateSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'UPDATE_RAW_SEARCH_QUERY', payload: query });
    searchApplicationsRequest.current?.(query);
  }, []);

  const fetchInitialResults = useRef(() => {
    if (!isFetchingRef.current) {
      updateSearchQuery(searchQuery);
    }
  });

  useEffect(() => {
    fetchInitialResults.current = () => {
      if (!isFetchingRef.current) {
        updateSearchQuery(searchQuery);
      }
    };
  }, [searchQuery, updateSearchQuery]);

  const fetchNextResults = useCallback(
    throttle(async () => {
      if (isFetching || !hasMore) {
        return;
      }

      dispatch({ type: 'FETCH_NEXT_RESULTS_REQUEST' });
      try {
        const { data } = await sendRequest({ offset: items.length, [searchType]: searchQuery });
        dispatch({ type: 'FETCH_NEXT_RESULTS_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'FETCH_NEXT_RESULTS_FAIL', payload: getErrorMessage(error) });
      } finally {
        searchRequest.current = null;
      }
    }, 100),
    [limit, order, hasMore, isFetching, isSearchResultVisible, searchQuery, sendRequest, items.length],
  );

  useEffect(() => {
    return () => {
      searchRequest.current?.cancel();
    };
  }, []);

  useEffect(() => {
    return () => {
      fetchNextResults.cancel();
    };
  }, [fetchNextResults]);

  useEffect(() => {
    if (applicationUpdate == null) {
      return;
    }

    switch (applicationUpdate.type) {
      case ApplicationActionTypes.CHANGE_APP_NAME_SUCCESS:
        dispatch({
          type: 'PATCH_RESULT_ITEM',
          payload: { appID: applicationUpdate.payload.app_id, appName: applicationUpdate.payload.app_name },
        });
        break;
      case ApplicationActionTypes.CREATE_APP_SUCCESS:
        fetchInitialResults.current();
        break;
      case SettingsActionTypes.DELETE_APPLICATION_SUCCESS:
        dispatch({
          type: 'DELETE_RESULT_ITEM',
          payload: { appID: applicationUpdate.payload.appId },
        });
        break;
      default:
        return;
    }
  }, [applicationUpdate]);

  useEffect(() => {
    fetchInitialResults.current();
  }, [limit, order]);

  const clearSearchQuery = useCallback(() => {
    updateSearchQuery('');
  }, [updateSearchQuery]);

  return useMemo(
    () => ({
      clearSearchQuery,
      count,
      error,
      fetchNextResults,
      hasMore,
      isFetching,
      isSearchResultVisible,
      items,
      rawSearchQuery,
      searchQuery,
      updateSearchQuery,
    }),
    [
      clearSearchQuery,
      count,
      error,
      fetchNextResults,
      hasMore,
      isFetching,
      isSearchResultVisible,
      items,
      rawSearchQuery,
      searchQuery,
      updateSearchQuery,
    ],
  );
};
