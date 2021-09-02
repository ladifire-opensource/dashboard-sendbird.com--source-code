import { useContext } from 'react';

import { AuthorizationContext } from '@authorization/authorizationContext';

/**
 * Hook for handle authorization context
 */
export const useAuthorization = () => useContext(AuthorizationContext);
