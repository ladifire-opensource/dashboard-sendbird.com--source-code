import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

import { useAppId } from '@hooks';

export const useExitFromCurrentTicket = () => {
  const history = useHistory();
  const appId = useAppId();

  return useCallback(() => {
    history.push(`/${appId}/desk/conversation`);
  }, [appId, history]);
};
