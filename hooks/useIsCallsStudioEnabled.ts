import { Page } from '@constants';

import { useAuthorization } from './useAuthorization';

export const useIsCallsStudioEnabled = () => {
  const { isAccessiblePage } = useAuthorization();
  return isAccessiblePage(Page.callsStudio);
};
