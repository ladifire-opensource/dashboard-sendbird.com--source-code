import { useEffect, useState, useRef } from 'react';

import { fetchOrganizationMembers } from '@common/api/organizations';

import { useAsync } from './useAsync';
import { useErrorToast } from './useErrorToast';
import { useOrganization } from './useOrganization';

export const useOrganizationMembers = ({
  limit,
  offset,
  order = 'id',
}: Omit<FetchOrganizationMembersPayload['params'], 'query'>) => {
  const { uid } = useOrganization();
  const [total, setTotal] = useState(0);
  const searchQuery = useRef('');
  const [searching, setSearching] = useState(false);
  const [{ status, data, error }, load] = useAsync(
    (query) => {
      searchQuery.current = query;
      return fetchOrganizationMembers({ uid, params: { limit, offset, order, query } });
    },
    [uid, limit, offset, order],
  );

  useEffect(() => {
    load(searchQuery.current);
  }, [load]);

  useEffect(() => {
    if (searchQuery.current === '' && data?.data.results) {
      setTotal(data?.data.count);
    }
  }, [data]);

  useEffect(() => {
    if (status === 'success') {
      setSearching(searchQuery.current !== '');
    }
  }, [status]);

  useErrorToast(error);
  return {
    loading: status === 'init' || status === 'loading',
    members: data?.data.results || [],
    total,
    count: data?.data.count || 0,
    load,
    searching,
    searchQuery: searchQuery.current,
  };
};
