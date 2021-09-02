import { Dispatch, useCallback } from 'react';

import { getProjectTags } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

import { TabState, Action } from './useTicketTagsReducer';

export const useFetchTags = (dispatch: Dispatch<Action>) => {
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const fetchTags = useCallback(
    async (options: Pick<TabState, 'page' | 'pageSize' | 'order'> & { status: TabState['key']; query: string }) => {
      if (!region) {
        return;
      }
      const { page, pageSize, order, status, query } = options;
      dispatch({ type: 'FETCH_TAGS_START', payload: { tab: status } });
      try {
        const { data } = await getProjectTags(pid, region, {
          limit: pageSize,
          offset: (page - 1) * pageSize,
          order,
          status,
          q: query,
        });
        dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: { tab: status, data } });
      } catch (error) {
        dispatch({ type: 'FETCH_TAGS_FAIL', payload: { tab: status, error: getErrorMessage(error) } });
      }
    },
    [dispatch, getErrorMessage, pid, region],
  );

  return fetchTags;
};
