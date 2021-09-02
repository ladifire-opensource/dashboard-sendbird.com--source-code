import { useEffect, useRef, Dispatch } from 'react';

import { useFetchTags } from './useFetchTags';
import { Action, TabState } from './useTicketTagsReducer';

export const useTabStateChangeEffect = (tabState: TabState, query: string, dispatch: Dispatch<Action>) => {
  const { key, page, pageSize, order } = tabState;
  const latestTabStateRef = useRef(tabState);
  const fetchTags = useFetchTags(dispatch);

  useEffect(() => {
    latestTabStateRef.current = tabState;
  });

  useEffect(() => {
    if (latestTabStateRef.current.status === 'fetching') {
      return;
    }
    fetchTags({ status: key, page, pageSize, order, query });
  }, [fetchTags, key, order, page, pageSize, query]);
};
