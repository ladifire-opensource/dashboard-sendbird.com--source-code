import { FC, useCallback, useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { chatApi, coreApi } from '@api';
import { getGroupChannelMuteDetail, getOpenChannelBanDetail, getOpenChannelMuteDetail } from '@chat/api';
import { useAppId, useAsync } from '@hooks';
import { camelCaseKeys } from '@utils';

import { Actions, Error, Loading } from './ProfileCard';
import UserProfileHeader from './UserProfileHeader';
import { UserProfilePopupContext } from './UserProfilePopupContextProvider';
import { Wrapper, CloseButton, Footer } from './components';
import useDeactivateAction from './hooks/useDeactivateAction';
import usePermissions from './hooks/usePermissions';
import useUserActions from './hooks/useUserActions';

type Props = {
  user: UserProfile;
};

type BanData = {
  user?: UserProfile;
  startAt?: number;
  endAt?: number;
  description?: string;
};

type MuteData = {
  isMuted: boolean;
  remainingDuration: number;
  startAt: number;
  endAt: number;
  description: string;
};

type ApiFunctionParams = {
  appId: string;
  channelUrl: string;
  userId: string;
};

type UserStatusApiOptions = {
  userId: string;
  channelType: ChannelType;
  channelUrl: string;
};

const getGroupChannelBanDetail = async (params: ApiFunctionParams) => {
  try {
    return await chatApi.getGroupChannelBanDetail(params);
  } catch (error) {
    const RESOURCE_NOT_FOUND = 400201;
    if (error.data?.code === RESOURCE_NOT_FOUND) {
      // To validate an issue that returns 400201 error when the API does not find a user
      return { ...error, status: 200, data: {} };
    }
    throw error;
  }
};

const fetchUser = async (params: ApiFunctionParams) => {
  const userResponse = await coreApi.fetchUser(params);
  const user = camelCaseKeys(userResponse.data);

  return user;
};

const useUserStatusAPI = ({ userId, channelType, channelUrl }: UserStatusApiOptions) => {
  const appId = useAppId();

  const fetchUserStatus = useCallback(
    async (params: ApiFunctionParams) => {
      const banDetailRequest =
        channelType === 'group_channels' ? getGroupChannelBanDetail(params) : getOpenChannelBanDetail(params);
      const muteDetailRequest =
        channelType === 'group_channels' ? getGroupChannelMuteDetail(params) : getOpenChannelMuteDetail(params);
      const [banResponse, muteResponse] = await Promise.all([banDetailRequest, muteDetailRequest]);
      const banData: BanData = camelCaseKeys(banResponse.data);
      const { isMuted } = camelCaseKeys<any, MuteData>(muteResponse.data);

      return {
        isMuted,
        isBanned: !!banData.user,
      };
    },
    [channelType],
  );

  const fetchUserFullInfo = useCallback(
    async (params: ApiFunctionParams) => {
      const user = await fetchUser(params);
      const { isActive } = user;
      if (!isActive) return { user, status: undefined };

      const { isBanned, isMuted } = await fetchUserStatus(params);

      return { user, status: { isActive, isBanned, isMuted } };
    },
    [fetchUserStatus],
  );

  const [{ data: state, status }, load] = useAsync(async () => {
    if (channelUrl) {
      return fetchUserFullInfo({ appId, channelUrl, userId });
    }
  }, [appId, channelUrl, fetchUserFullInfo, userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { status, state, reload: load };
};

const useSDKUser = () => useSelector((state: RootState) => state.moderations.sdkUser);

export const useUserAndActions = (options: UserStatusApiOptions) => {
  const { closeProfilePopup, notifyChange, channelType } = useContext(UserProfilePopupContext);
  const { state, status: apiStatus, reload } = useUserStatusAPI(options);
  const sdkUser = useSDKUser();
  const { canModerate } = usePermissions(channelType);
  const { banUser, unbanUser, muteUser, unmuteUser } = useUserActions();
  const deactivateAction = useDeactivateAction(state?.user);

  const isLoading = apiStatus === 'init' || apiStatus === 'loading';
  const hasError = apiStatus === 'error';
  if (!state) return { isLoading, hasError, reload };

  const { user, status } = state;
  const isSDKUser = user.userId === sdkUser?.user_id;

  if (!status || isSDKUser) return { isLoading, hasError, user, reload, actions: undefined };

  const { isMuted, isBanned } = status;

  const getBan = () => {
    if (!canModerate || isMuted) return undefined;

    return {
      current: isBanned,
      handler: () => {
        const onSuccess = () => {
          notifyChange('ban', { userId: user.userId, isBanned: !isBanned });
          closeProfilePopup();
        };
        isBanned ? unbanUser(user, onSuccess) : banUser(user, onSuccess);
      },
    };
  };

  const getMuted = () => {
    if (!canModerate || isBanned) return undefined;

    return {
      current: isMuted,
      handler: () => {
        const onSuccess = () => {
          notifyChange('mute', { userId: user.userId, isMuted: !isMuted });
          closeProfilePopup();
        };
        isMuted ? unmuteUser(user, onSuccess) : muteUser(user, onSuccess);
      },
    };
  };

  return {
    isLoading,
    hasError,
    reload,
    user,
    actions: {
      ban: getBan(),
      mute: getMuted(),
      deactivate: deactivateAction,
    },
  };
};

const UserProfilePopup: FC<Props> = ({ user }) => {
  const { closeProfilePopup, channelType, channelUrl } = useContext(UserProfilePopupContext);
  const profileCard = useUserAndActions({ userId: user.userId, channelType, channelUrl });

  // profileCard.user will have the latest user information but does not include the user's role in the open channel.
  const { userId, nickname, profileUrl, role } = useMemo(() => ({ ...user, ...profileCard.user }), [
    profileCard.user,
    user,
  ]);

  if (profileCard.isLoading || !profileCard.user) return <Loading onClose={closeProfilePopup} />;
  if (profileCard.hasError) return <Error onRetry={profileCard.reload} onClose={closeProfilePopup} />;

  return (
    <Wrapper data-test-id="UserProfilePopup">
      <UserProfileHeader userId={userId} nickname={nickname} profileUrl={profileUrl} userRole={role} />
      {profileCard.actions && (
        <Footer>
          <Actions actions={profileCard.actions} />
        </Footer>
      )}
      <CloseButton onClick={closeProfilePopup} />
    </Wrapper>
  );
};

export default UserProfilePopup;
