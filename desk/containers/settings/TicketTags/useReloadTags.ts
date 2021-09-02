import { useCallback } from 'react';

import { useFetchTags } from './useFetchTags';
import { useTicketTagsDispatchAction, useTicketTagsStateRef } from './useTicketTagsReducer';

export const useReloadTags = (reloadBothTabs: boolean = false) => {
  const latestStateRef = useTicketTagsStateRef();
  const dispatch = useTicketTagsDispatchAction();
  const fetchTags = useFetchTags(dispatch);

  return useCallback(() => {
    const { selectedTab, tabs, query } = latestStateRef.current;
    if (reloadBothTabs) {
      return Promise.all(tabs.map((tabState) => fetchTags({ ...tabState, status: tabState.key, query })));
    }
    const activeTabState = tabs.find(({ key }) => key === selectedTab);
    if (activeTabState) {
      return fetchTags({ ...activeTabState, status: selectedTab, query });
    }
  }, [fetchTags, latestStateRef, reloadBothTabs]);
};
