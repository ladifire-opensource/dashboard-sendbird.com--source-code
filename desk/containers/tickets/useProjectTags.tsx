import { FC, createContext, useCallback, useState, useEffect, useContext, useRef } from 'react';

import { toast } from 'feather';

import { getProjectTags } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useLatestValue } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

type RequestStatus = 'init' | 'loading' | 'idle';

const ProjectTagsContext = createContext<{
  status: RequestStatus;
  tags: TicketTag[];
  loadMoreTags: () => void;
  hasNext: boolean;
}>(undefined as any);

export const ProjectTagsProvider: FC = ({ children }) => {
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const [requestStatus, setRequestStatus] = useState<RequestStatus>('init');
  const latestRequestStatus = useLatestValue(requestStatus);
  const totalCount = useRef(0);
  const [tags, setTags] = useState<TicketTag[]>([]);

  const hasNext = tags.length < totalCount.current;

  const loadTags = useCallback(
    async (offset: number = 0) => {
      if (latestRequestStatus.current === 'loading') {
        return;
      }

      setRequestStatus('loading');
      try {
        const {
          data: { results, count },
        } = await getProjectTags(pid, region, { limit: 20, offset });
        totalCount.current = count;
        setTags((currentTags) => currentTags.concat(results));
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      } finally {
        setRequestStatus('idle');
      }
    },
    [getErrorMessage, latestRequestStatus, pid, region],
  );

  const loadMoreTags = useCallback(() => {
    if (hasNext) {
      loadTags(tags.length);
    }
  }, [hasNext, loadTags, tags.length]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return (
    <ProjectTagsContext.Provider value={{ status: requestStatus, tags, loadMoreTags, hasNext }}>
      {children}
    </ProjectTagsContext.Provider>
  );
};

export const useProjectTags = () => useContext(ProjectTagsContext);
