import { createContext } from 'react';

import { LIST_LIMIT } from '@constants';

export const CustomersPaginationContext = createContext<{
  page: number;
  pageSize: PerPage;
  setPagination: (page: number, pageSize: PerPage) => void;
}>({
  page: 1,
  pageSize: LIST_LIMIT,
  setPagination: () => {},
});
