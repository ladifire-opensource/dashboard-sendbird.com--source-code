import { Page } from '@constants';

import { useAuthorization } from './useAuthorization';

export const useCanEnterApplication = () => {
  const { isAccessiblePage } = useAuthorization();
  return [Page.application, Page.desk, Page.calls].some((page) => isAccessiblePage(page));
};
