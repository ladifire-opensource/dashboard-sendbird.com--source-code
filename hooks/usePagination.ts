import { useReducer, useCallback } from 'react';

type State = {
  page: number;
  pageSize: PerPage;
};

type StateUpdater = (currentState: State) => State;

type SetPagination = (pageOrUpdater: number | StateUpdater, pageSize?: PerPage) => void;

type UsePaginationReturnValue = {
  page: number;
  pageSize: PerPage;
  setPagination: SetPagination;
};

function reducer(
  state: State,
  action: { type: 'updatePagination'; payload: State } | { type: 'patchPagination'; payload: StateUpdater },
) {
  switch (action.type) {
    case 'updatePagination':
      return action.payload;
    case 'patchPagination':
      return action.payload(state);
    default:
      return state;
  }
}

export function usePagination(initialPage: number, initialPageSize: PerPage): UsePaginationReturnValue {
  const [state, dispatch] = useReducer(reducer, {
    page: initialPage,
    pageSize: initialPageSize,
  });

  const setPagination: SetPagination = useCallback((...args) => {
    const [pageOrUpdater, pageSize] = args;
    if (typeof pageOrUpdater === 'number' && typeof pageSize === 'number') {
      dispatch({ type: 'updatePagination', payload: { page: pageOrUpdater, pageSize } });
      return;
    }
    if (typeof pageOrUpdater === 'function') {
      dispatch({ type: 'patchPagination', payload: pageOrUpdater });
    }
  }, []);

  return {
    page: state.page,
    pageSize: state.pageSize,
    setPagination,
  };
}
