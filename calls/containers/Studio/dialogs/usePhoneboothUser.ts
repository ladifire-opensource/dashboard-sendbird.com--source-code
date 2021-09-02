import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { coreActions } from '@actions';
import { unregisterSDKUser } from '@core/api';
import { getErrorMessage } from '@epics';
import { useTypedSelector, useAppId, useAsync, useShallowEqualSelector } from '@hooks';
import { camelCaseKeys } from '@utils';

export type PhoneboothUser = User;

export const usePhoneboothUser = () => {
  const { status, error, deletedUserId, user } = useShallowEqualSelector((state) => {
    const { isFetched, fetchRequestError: error, sdkUser } = state.moderations;
    const user = sdkUser && camelCaseKeys<SDKUser, PhoneboothUser>(sdkUser);

    if (!isFetched) {
      return { status: 'loading', error, user, deletedUserId: null };
    }
    if (error && error.status === 400 && error.data?.sdk_user_id) {
      // SdkUser has been deleted.
      return { status: 'success', error, user, deletedUserId: String(error.data.sdk_user_id) };
    }
    if (error) {
      return { status: 'error', error, user, deletedUserId: null };
    }
    return { status: 'success', error, user, deletedUserId: null };
  });
  const dispatch = useDispatch();

  const errorMessage = useMemo(
    () => (status === 'error' ? getErrorMessage(error, 'Couldn’t connect to Sendbird server.') : undefined),
    [error, status],
  );

  const loadUser = useCallback(() => dispatch(coreActions.fetchSDKUserRequest()), [dispatch]);

  return { status, user, loadUser, errorMessage, deletedUserId };
};

export const usePhoneboothUserCreation = () => {
  const dispatch = useDispatch();
  const loading = useTypedSelector((state) => state.moderations.createRequest.isPending);
  const error = useTypedSelector((state) => state.moderations.createRequest.error);

  const createUser = useCallback(
    (params: {
      userId: string;
      nickname: string;
      profileUrl?: string;
      profileFile?: File;
      issueAccessToken?: boolean;
    }) =>
      dispatch(
        coreActions.createSDKUserRequest({
          data: {
            sdk_user_id: params.userId,
            nickname: params.nickname,
            profile_url: params.profileUrl,
            profile_file: params.profileFile,
            issue_access_token: params.issueAccessToken ?? true,
          },
        }),
      ),
    [dispatch],
  );
  return { loading, error, createUser };
};

export const usePhoneboothUserUnregister = () => {
  const appId = useAppId();
  const dispatch = useDispatch();
  const [{ status, error }, requestUnregister] = useAsync((userId: string) => unregisterSDKUser({ appId, userId }), [
    appId,
  ]);

  const loading = status === 'loading';
  const done = status === 'success';

  const unregister = (userId: string) => {
    dispatch(coreActions.removeSDKUserRequest());
    requestUnregister(userId);
  };

  useEffect(() => {
    error && dispatch(coreActions.removeSDKUserFail(getErrorMessage(error)));
  }, [error, dispatch]);

  useEffect(() => {
    done && dispatch(coreActions.removeSDKUserSuccess());
  }, [done, dispatch]);

  return { loading, done, error, unregister };
};
