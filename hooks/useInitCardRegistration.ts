import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { toast } from 'feather';

import { initCardRegistration } from '@common/api';
import { getErrorMessage } from '@epics';
import { useAsync } from '@hooks';

export const useInitCardRegistration = () => {
  const organization_uid = useSelector((state: RootState) => state.organizations.current.uid);

  const [{ status, data, error }, load] = useAsync(async () => {
    return initCardRegistration(organization_uid);
  }, [organization_uid]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (error) {
      toast.error({ message: getErrorMessage(error) });
    }
  }, [error]);
  return {
    isLoading: status === 'loading',
    intent_client_secret: data?.data.intent_client_secret || '',
  };
};
