import { createContext, useRef, useEffect, useCallback, useMemo } from 'react';

import { useQueryString } from '@hooks/useQueryString';

export type QueryParams = {
  order: TicketTagSortOrder;
  page: number;
  pageSize: number;
  status: TicketTag['status'];
  q: string;
};

export type UpdateQueryParams = (updates: Partial<QueryParams>) => void;

export const useQueryParams = (): [QueryParams, UpdateQueryParams] => {
  const { page, pageSize, order, status, q, updateParams } = useQueryString<QueryParams>({
    page: 1,
    pageSize: 10,
    order: '-created_at',
    status: 'ACTIVE',
    q: '',
  });
  const updateParamsRef = useRef(updateParams);

  useEffect(() => {
    updateParamsRef.current = updateParams;
  });

  // prevent the reference of returned updateParams from being updated.
  const stableUpdateParams = useCallback<typeof updateParams>((updates) => updateParamsRef.current(updates), []);

  return [
    useMemo(() => ({ page, pageSize, order, status, q }), [order, page, pageSize, q, status]),
    stableUpdateParams,
  ];
};

export const QueryParamsContext = createContext<ReturnType<typeof useQueryParams>>(undefined as any);
