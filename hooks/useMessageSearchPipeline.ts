import { useEffect } from 'react';

import { getMessageSearchPipeline } from '@core/api';

import { useAsync } from './useAsync';
import { useTypedSelector } from './useTypedSelector';

export const useMessageSearchPipeline = () => {
  const appId = useTypedSelector((state) => state.applicationState.data?.app_id);
  const [{ status, data, error }, load] = useAsync(async () => {
    return getMessageSearchPipeline(appId || '');
  }, [appId]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    status,
    load,
    data: data?.data || null,
    error,
  };
};
