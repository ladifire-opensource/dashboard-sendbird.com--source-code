import { useEffect, useState } from 'react';

import { fetchOrganizationInvitations } from '@common/api/organizations';

import { useAsync } from './useAsync';
import { useErrorToast } from './useErrorToast';
import { useOrganization } from './useOrganization';
import { usePagination } from './usePagination';

export const useOrganizationInvitations = () => {
  const { uid } = useOrganization();
  const { page, pageSize, setPagination } = usePagination(1, 10);
  const [order, setOrder] = useState<FetchOrganizationInvitationsPayload['params']['order']>('email');
  const [{ status, data, error }, load] = useAsync(
    () =>
      fetchOrganizationInvitations({
        uid,
        params: { limit: pageSize, offset: (page - 1) * pageSize, order },
      }),
    [uid, page, pageSize, order],
  );

  useEffect(() => {
    load();
  }, [load]);

  useErrorToast(error);
  return {
    loading: status === 'loading',
    invitations: data?.data.results || [],
    count: data?.data.count || 0,
    load,
    page,
    pageSize,
    setPagination,
    setOrder,
  };
};
