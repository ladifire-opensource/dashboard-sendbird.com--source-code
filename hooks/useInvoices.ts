import { useEffect } from 'react';

import { fetchInvoices } from '@common/api';

import { useAsync } from './useAsync';

type Params = {
  limit: number;
  offset: number;
  status?: Invoice['status'];
};

export const useInvoices = (params: Params) => {
  const [{ status, data }, load] = useAsync(() => fetchInvoices(params), [params.limit, params.offset]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    isLoading: status === 'loading' || status === 'init',
    data: data?.data,
  };
};
