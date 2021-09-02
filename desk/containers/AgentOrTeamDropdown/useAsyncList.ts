import { useRef, useEffect, useCallback, useLayoutEffect, useReducer, useDebugValue } from 'react';

import { axios } from '@api';
import { CancellableAxiosPromise } from '@api/cancellableAxios';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDebounce, useLatestValue, useInfiniteScroll } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { ClientStorage } from '@utils';

type RequestStatus = 'init' | 'loading' | 'success' | 'fail' | 'loadmore-pending' | 'loadmore-fail';

type ListResponseWithNext<T> = { results: T[]; next: string | null };

type State<T> = {
  status: RequestStatus;
  items: T[];
  next: string | null;
  error: string | null;
  loadMoreError: string | null;
  isSearchResultsVisible: boolean;
};

type Action<T> =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: { response: T; isSearchResultsVisible: boolean } }
  | { type: 'FETCH_FAIL'; payload: { error: string } }
  | { type: 'RESET_STATUS' }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: { response: T } }
  | { type: 'LOAD_MORE_FAIL'; payload: { error: string } };

export const useAsyncList = <P>(
  fetch: (query?: string) => CancellableAxiosPromise<ListResponseWithNext<P>>,
  query?: string,
) => {
  type Response = ListResponseWithNext<P>;
  type TypedState = State<P>;

  const [{ status, items, next, error, isSearchResultsVisible, loadMoreError }, dispatch] = useReducer(
    (state: TypedState, action: Action<Response>): TypedState => {
      switch (action.type) {
        case 'FETCH_START':
          return { ...state, status: 'loading' };
        case 'FETCH_SUCCESS':
          return {
            ...state,
            items: action.payload.response.results,
            next: action.payload.response.next,
            isSearchResultsVisible: action.payload.isSearchResultsVisible,
            error: null,
            status: 'success',
          };
        case 'FETCH_FAIL':
          return { ...state, error: action.payload.error, status: 'fail' };
        case 'RESET_STATUS':
          return { ...state, status: 'init' };
        case 'LOAD_MORE_START':
          return { ...state, status: 'loadmore-pending' };
        case 'LOAD_MORE_SUCCESS':
          return {
            ...state,
            status: 'success',
            items: state.items.concat(action.payload.response.results),
            next: action.payload.response.next,
            loadMoreError: null,
          };
        case 'LOAD_MORE_FAIL':
          return { ...state, status: 'loadmore-fail', loadMoreError: action.payload.error };
        default:
          return state;
      }
    },
    {
      status: 'init',
      items: [],
      next: null,
      error: null,
      loadMoreError: null,
      isSearchResultsVisible: false,
    },
  );

  const ongoingRequestRef = useRef<ReturnType<typeof fetch>>();
  const ongoingLoadMoreRequestRef = useRef<ReturnType<typeof fetch>>();
  const debouncedQuery = useDebounce(query, 100);
  const latestFetch = useLatestValue(fetch);
  const { pid } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const handleLoadMore = useCallback(async () => {
    if (!next || status === 'loadmore-pending') {
      return;
    }

    dispatch({ type: 'LOAD_MORE_START' });
    try {
      const request = axios.get(next, {
        headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
      });
      ongoingLoadMoreRequestRef.current = request;
      const loadMoreResponse = await request;

      if (loadMoreResponse == null) {
        // ignore canceled requests
        return;
      }

      dispatch({ type: 'LOAD_MORE_SUCCESS', payload: { response: loadMoreResponse.data } });
    } catch (error) {
      dispatch({ type: 'LOAD_MORE_FAIL', payload: { error: getErrorMessage(error) } });
    } finally {
      ongoingLoadMoreRequestRef.current = undefined;
    }
  }, [getErrorMessage, next, pid, status]);

  const { scrollBarRef, spinnerWrapperRef } = useInfiniteScroll({
    hasMore: !!next,
    handleLoadMore,
    isLoadMoreFailed: !!loadMoreError,
  });

  const requestFetch = useCallback(async () => {
    dispatch({ type: 'FETCH_START' });
    ongoingRequestRef.current?.cancel();
    try {
      const request = latestFetch.current(debouncedQuery);
      ongoingRequestRef.current = request;
      const response = await request;

      if (response == null) {
        // ignore canceled requests
        return;
      }

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: { response: response.data, isSearchResultsVisible: !!debouncedQuery },
      });
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: { error: getErrorMessage(error) } });
    } finally {
      ongoingRequestRef.current = undefined;
    }
  }, [latestFetch, debouncedQuery, getErrorMessage]);

  useLayoutEffect(() => {
    // update state before the browser paints to avoid rendering transitional state
    dispatch({ type: 'RESET_STATUS' });
  }, [query]);

  useEffect(() => {
    requestFetch();
  }, [requestFetch]);

  useEffect(() => {
    return () => {
      // Cancel ongoing request on unmount
      /**TODO
       * Investigate why ongoingRequestRef.current?.cancel?.() is not ongoingRequestRef.current?.cancel()
       * On AgentGroupMemberDropdown.tsx, if you leave cancel without type escape(?), it throws error.
       */
      ongoingRequestRef.current?.cancel?.();
      ongoingLoadMoreRequestRef.current?.cancel?.();
    };
  }, []);

  const result = {
    status,
    items,
    hasNext: !!next,
    error,
    loadMoreError,
    isSearchResultsVisible,
    reload: requestFetch,
    loadMore: handleLoadMore,
    scrollBarRef,
    spinnerWrapperRef,
  };

  useDebugValue(result);
  return result;
};
