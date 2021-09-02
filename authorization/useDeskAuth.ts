import { useEffect, useRef } from 'react';
import { useSelector, useDispatch, TypedUseSelectorHook } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import { sanitize } from 'dompurify';
import { toast } from 'feather';

import { deskActions } from '@actions';
import { getSBAuthToken } from '@api/tokens';
import { useAppSettingMenus } from '@hooks/useAppSettingMenus';
import { useAuthorization } from '@hooks/useAuthorization';
import { useIsDeskEnabled } from '@hooks/useIsDeskEnabled';
import { ALERT_NOT_ALLOWED_FEATURE } from '@utils/text';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useDeskAuth = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const isFetchingDesk = useTypedSelector((state) => state.desk.isFetching);
  const authenticated = useTypedSelector((state) => state.desk.authenticated);
  const appId = useTypedSelector((state) => state.applicationState.data?.app_id);
  const { fallbackMenuPath: fallbackSettingMenuPath } = useAppSettingMenus();
  const { preparingFeatures } = useAuthorization();
  const isDeskEnabled = useIsDeskEnabled();

  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (preparingFeatures || !appId || isDeskEnabled) {
      return;
    }

    // redirect users without access to Desk
    if (pathname.startsWith(`/${appId}/desk/settings`)) {
      history.replace(fallbackSettingMenuPath || '/');
      return;
    }
    toast.warning({ message: ALERT_NOT_ALLOWED_FEATURE });
    history.replace('/');
  }, [appId, fallbackSettingMenuPath, history, isDeskEnabled, pathname, preparingFeatures]);

  useEffect(() => {
    const token = getSBAuthToken();
    if (!token) {
      if (pathname !== '/auth/signin') {
        history.push(pathname === '/' ? '/auth/signin' : `/auth/signin?next=${sanitize(location.pathname)}`);
      }
      return;
    }

    if (isFirstRenderRef.current && !authenticated && !isFetchingDesk) {
      dispatch(deskActions.deskAuthenticationRequest({ match: sanitize(`${pathname}${search}`) }));
    }
  });

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    }
  }, []);

  return authenticated;
};
