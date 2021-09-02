import { useEffect } from 'react';

import { fetchSDKUserByID } from '@core/api';

import { useAppId } from './useAppId';
import { useAsync } from './useAsync';

export const useNCSoftSDKUserByID = (userId, isNCSoft = false) => {
  const appId = useAppId();
  const [{ status, data }, load] = useAsync(() => fetchSDKUserByID({ appId, userId }), [appId, userId]);

  useEffect(() => {
    if (isNCSoft) {
      load();
    }
  }, [load, isNCSoft]);
  return { loading: status === 'loading', userDetail: data?.data };
};
