import { useEffect, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { sanitize } from 'dompurify';
import isEmpty from 'lodash/isEmpty';

import { commonActions } from '@actions';
import { getSBAuthToken } from '@api';
import { OrganizationStatus } from '@constants';
import { useTypedSelector } from '@hooks';
import { SpinnerFull } from '@ui/components/spinner';

const AuthenticationContext = createContext({
  authenticated: false,
  isOrganizationDeactivated: false,
});

export const AuthenticationProvider = ({ children }) => {
  const { authenticated } = useTypedSelector((state) => state.auth);
  const organization = useTypedSelector((state) => state.organizations.current);
  const history = useHistory();
  const dispatch = useDispatch();

  const isOrganizationDeactivated = !isEmpty(organization) && organization?.status !== OrganizationStatus.Active;

  const token = getSBAuthToken();
  useEffect(() => {
    if (
      history.location.pathname === '/deactivated' ||
      history.location.pathname.startsWith('/settings') ||
      history.location.pathname.startsWith('/account')
    ) {
      return;
    }
    if (isOrganizationDeactivated && history.location.pathname !== '/settings/ff') {
      history.push('/deactivated');
    }
  }, [isOrganizationDeactivated, history.location.pathname, history]);

  useEffect(() => {
    if (!authenticated) {
      if (token) {
        dispatch(commonActions.verifyAuthenticationRequest());
        return;
      }
      if (window.location.pathname !== '/auth/signin') {
        history.push(
          window.location.pathname === '/' ? '/auth/signin' : `/auth/signin?next=${sanitize(window.location.pathname)}`,
        );
      }
    }
  }, [authenticated, dispatch, history, isOrganizationDeactivated, token]);

  if (authenticated) {
    return (
      <AuthenticationContext.Provider value={{ authenticated, isOrganizationDeactivated }}>
        {children}
      </AuthenticationContext.Provider>
    );
  }
  return <SpinnerFull />;
};

export const useAuthentication = () => useContext(AuthenticationContext);
