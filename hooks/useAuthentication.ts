import isEmpty from 'lodash/isEmpty';

import { OrganizationStatus } from '@constants';
import { useShallowEqualSelector } from '@hooks';

const useAuthentication = () =>
  useShallowEqualSelector((state) => {
    const { authenticated } = state.auth;
    const organization = state.organizations.current;

    const isOrganizationDeactivated = !isEmpty(organization) && organization?.status !== OrganizationStatus.Active;

    return { authenticated, isOrganizationDeactivated };
  });

export default useAuthentication;
