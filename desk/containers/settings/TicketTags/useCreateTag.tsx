import { useCallback } from 'react';

import { createTag } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';

import { useTicketTagsDispatchAction } from './useTicketTagsReducer';

export const useCreateTag = () => {
  const { pid, region } = useProjectIdAndRegion();
  const dispatch = useTicketTagsDispatchAction();

  const sendCreateTagRequest = useCallback(
    async (name: string) => {
      dispatch({ type: 'CREATE_TAG_START' });
      try {
        const { data } = await createTag(pid, region, { name });
        dispatch({ type: 'CREATE_TAG_SUCCESS', payload: { newTag: data, status: 'reloading' } });
      } catch (error) {
        dispatch({ type: 'CREATE_TAG_FAIL', payload: { error } });
      }
    },
    [dispatch, pid, region],
  );

  return sendCreateTagRequest;
};
