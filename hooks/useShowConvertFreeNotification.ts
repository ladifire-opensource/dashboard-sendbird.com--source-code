import { useSelector } from 'react-redux';

import isEmpty from 'lodash/isEmpty';

import { useAuthorization } from './useAuthorization';

/**
 * @description
 * This will be removed when all migrations are complete.
 */
export const useShowConvertFreeNotification = () => {
  const { isSelfService } = useAuthorization();
  const organization = useSelector((state: RootState) => state.organizations.current);
  const { free_applications, total_applications } = organization;
  return !isSelfService && !isEmpty(organization) && free_applications === total_applications;
};
