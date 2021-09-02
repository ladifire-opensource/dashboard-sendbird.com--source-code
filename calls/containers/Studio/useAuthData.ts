import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import * as CoreAPI from '@core/api';
import { useAppId } from '@hooks/useAppId';

const useIsTokenRequired = () => {
  const DENY_LOGIN_POLICY = 2;
  const policy = useSelector((state: RootState) => state.applicationState.data?.guest_user_policy);
  return policy === DENY_LOGIN_POLICY;
};

const useAuthData = () => {
  const appId = useAppId();
  const isTokenRequired = useIsTokenRequired();

  const encode = useCallback(
    ({ user_id, access_token }: SDKUser, roomId?: string) => {
      return btoa(
        JSON.stringify({
          user_id,
          app_id: appId,
          access_token: access_token || undefined,
          room_id: roomId,
        }),
      );
    },
    [appId],
  );

  const generate = useCallback(
    async (user: SDKUser, roomId?: string) => {
      if (!isTokenRequired || user.access_token) {
        return encode(user, roomId);
      }
      const { data } = await CoreAPI.editUser({
        appId,
        userId: user.user_id,
        issueAccessToken: true,
      });
      return encode(data, roomId);
    },
    [appId, encode, isTokenRequired],
  );

  return generate;
};

export default useAuthData;
