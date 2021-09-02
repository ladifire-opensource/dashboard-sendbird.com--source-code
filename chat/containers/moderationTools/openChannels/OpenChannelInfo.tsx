import { useState, useEffect, useMemo, useRef, FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { LinkVariant } from 'feather';
import debounce from 'lodash/debounce';
import * as SendBird from 'sendbird';

import { fetchOpenChannel } from '@chat/api';
import UserProfilePopover from '@chat/components/UserProfilePopup/UserProfilePopover';
import UserProfilePopup from '@chat/components/UserProfilePopup/UserProfilePopup';
import {
  useCurrentDynamicPartitioningOption,
  useAvailableDynamicPartitioningOptions,
} from '@chat/containers/settings/ChannelsSettings/hooks';
import { useAppId, useCurrentSdkUser, useLatestValue, useShallowEqualSelector } from '@hooks';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { LinkWithPermissionCheck } from '@ui/components';
import { debouncePromise } from '@utils';

import { ModerationToolsChannelInfo } from '../ModerationToolsChannelInfo';
import { UserListCountBadge } from '../UserListCountBadge';
import { UserListHeader } from '../UserListHeader';
import { MTInfoSidebar, MTInfoContent, MTInfoSection, MTInfoSectionToggle } from '../components';
import UserListItem from '../components/UserListItem';
import { useBannedUsers } from '../hooks/useBannedUsers';
import { useMutedUsers } from '../hooks/useMutedUsers';
import renderBannedUserListItem from '../utils/renderBannedUserListItem';
import renderMutedUserListItem from '../utils/renderMutedUserListItem';
import { ParticipantList } from './ParticipantList';
import { useListQuery } from './useListQuery';

const Participants = styled(MTInfoSection).attrs<{ $isActive: boolean }>(({ $isActive }) => ({
  'aria-hidden': !$isActive,
  'data-test-id': 'Participants',
}))`
  display: flex;
  flex-direction: column;
`;

const userListNameMessageIds: Record<OpenChannelUserListType, string> = {
  banned: 'chat.channelDetail.sidebar.openChannels.memberList.banned',
  muted: 'chat.channelDetail.sidebar.openChannels.memberList.muted',
  participants: 'chat.channelDetail.sidebar.openChannels.memberList.participants',
};

/**
 * Page size of participant/muted/banned user list. Note that it affects the badges of muted/banned user list:
 * i.e. if pageSize=100, the badges will show 100+ if there are more than 100 users in the lists.
 */
const pageSize = 100;

export const OpenChannelInfo: FC = () => {
  const intl = useIntl();
  const appId = useAppId();
  const { sdkUserId, channel, isConnected } = useShallowEqualSelector((state) => ({
    sdkUserId: state.moderations.sdkUser?.user_id,
    channel: state.openChannels.current,
    isConnected: state.sendbird.isConnected,
  }));

  const {
    isUsingDynamicPartitioning,
    option: dynamicPartitioningOption,
    maxTotalParticipants,
  } = useCurrentDynamicPartitioningOption();
  const dynamicPartitioningOptions = useAvailableDynamicPartitioningOptions();

  const multipleSubChannelsMaxParticipants = useMemo(() => {
    const multipleSubchannelsOption = dynamicPartitioningOptions.find((item) => item.key === 'multiple_subchannels');
    return multipleSubchannelsOption?.max_channel_participants;
  }, [dynamicPartitioningOptions]);

  const closeProfilePopup = useRef<() => void>(() => {});

  const [openUserListType, setOpenUserListType] = useState<OpenChannelUserListType | null>(null);

  const channelUrl = channel?.channel_url ?? '';

  const {
    state: bannedUserState,
    loadMore: loadMoreBannedUsers,
    reload: reloadBannedUsers,
    countBadge: bannedUserCountBadge,
    handleUserBanStateChange,
  } = useBannedUsers({ channelUrl, channelType: 'open_channels', pageSize });

  const {
    state: mutedUserState,
    loadMore: loadMoreMutedUsers,
    reload: reloadMutedUsers,
    countBadge: mutedUserCountBadge,
    handleUserMuteStateChange,
  } = useMutedUsers({ channelUrl, channelType: 'open_channels', pageSize });

  const { sdkUser } = useCurrentSdkUser();

  const channelHandlerValuesRef = useLatestValue({
    reloadBannedUsers,
    handleUserBanStateChange,
    reloadMutedUsers,
    handleUserMuteStateChange,
  });

  useEffect(() => {
    if (!channelUrl || !isConnected || !sdkUser) {
      return;
    }

    const channelHandler = new window.dashboardSB.ChannelHandler();

    const isCurrentChannel = (channel: SendBird.BaseChannel) => channel.isOpenChannel() && channel.url === channelUrl;

    channelHandler.onUserMuted = (channel) => {
      if (isCurrentChannel(channel)) {
        channelHandlerValuesRef.current.reloadMutedUsers();
      }
    };

    channelHandler.onUserBanned = (channel) => {
      if (isCurrentChannel(channel)) {
        channelHandlerValuesRef.current.reloadBannedUsers();
      }
    };

    channelHandler.onUserUnmuted = (channel, user) => {
      if (isCurrentChannel(channel)) {
        channelHandlerValuesRef.current.handleUserMuteStateChange(user.userId, false);
        // FIXME: count needs to be updated.
      }
    };

    channelHandler.onUserUnbanned = (channel, user) => {
      if (isCurrentChannel(channel)) {
        channelHandlerValuesRef.current.handleUserBanStateChange(user.userId, false);
        // FIXME: also need to update the count
      }
    };

    const handlerId = `openChannelHandler_${channelUrl}_users`;
    window.dashboardSB.addChannelHandler(handlerId, channelHandler);

    return () => {
      window.dashboardSB.removeChannelHandler(handlerId);
    };
  }, [channelUrl, isConnected, sdkUser, channelHandlerValuesRef]);

  const participantListQuery = useListQuery({
    url: channelUrl,
    createListQuery: (channel) => channel.createParticipantListQuery(),
    limit: pageSize,
  });

  /**
   * participantCount is updated in real time when participants enter/exit the channel.
   * Note that operators are not counted as participants.
   */
  const [participantCount, setParticipantCount] = useState(channel?.participant_count ?? 0);

  useEffect(() => {
    closeProfilePopup.current();
    setOpenUserListType(null);
  }, [channelUrl]);

  const { reload: reloadParticipants } = participantListQuery;

  const reloadParticipantsByEnterExit = useMemo(() => debounce(reloadParticipants, 1000), [reloadParticipants]);

  const syncParticipantCountWithPlatformAPI = useMemo(
    () =>
      debouncePromise(async () => {
        if (!channelUrl) {
          return;
        }
        try {
          const { data: channel } = await fetchOpenChannel({ appId, channel_url: channelUrl });
          setParticipantCount(channel.participant_count);
        } catch (error) {
          // do nothing
        }
      }, 1000),
    [appId, channelUrl],
  );

  useEffect(() => {
    const participantHandler = new window.dashboardSB.ChannelHandler();

    const updateParticipant = (updatedChannel: SendBird.OpenChannel, userId: string) => {
      if (channelUrl === updatedChannel.url) {
        setParticipantCount(updatedChannel.participantCount);

        // We request the latest open channel from Platform API because the participant count from JavaScript SDK
        // becomes out of sync when users enter the channel too fast.
        syncParticipantCountWithPlatformAPI();

        if (userId !== sdkUserId && openUserListType === 'participants') {
          // call reload only when participant list is open
          // FIXME: temporary revert for the Customer request
          reloadParticipantsByEnterExit();
        }
      }
    };

    participantHandler.onUserEntered = (channel: SendBird.OpenChannel, user) => {
      updateParticipant(channel, user.userId);
    };
    participantHandler.onUserExited = (channel: SendBird.OpenChannel, user) => {
      updateParticipant(channel, user.userId);
    };
    window.dashboardSB.addChannelHandler(`user_enter_${channelUrl}`, participantHandler);
    return () => {
      window.dashboardSB.removeChannelHandler(`user_enter_${channelUrl}`);
    };
  }, [openUserListType, channelUrl, reloadParticipantsByEnterExit, sdkUserId, syncParticipantCountWithPlatformAPI]);

  useEffect(() => {
    closeProfilePopup.current();

    switch (openUserListType) {
      case 'participants': {
        reloadParticipants(true);
        break;
      }
      case 'banned': {
        reloadBannedUsers();
        break;
      }
      case 'muted': {
        reloadMutedUsers();
        break;
      }
      default:
        return;
    }
  }, [reloadBannedUsers, reloadMutedUsers, reloadParticipants, openUserListType]);

  const participantCountBadge = useMemo(() => {
    if (
      isUsingDynamicPartitioning &&
      typeof maxTotalParticipants === 'number' &&
      participantCount >= maxTotalParticipants * 0.9
    ) {
      const tooltipContent =
        dynamicPartitioningOption === 'single_subchannel' && typeof multipleSubChannelsMaxParticipants === 'number'
          ? intl.formatMessage(
              { id: 'chat.channelDetail.sidebar.openChannels.memberList.participants.error.full.singleSubchannel' },
              {
                a: (text) => (
                  <LinkWithPermissionCheck
                    href={`/${appId}/settings/channels`}
                    permissions={['application.settings.view', 'application.settings.all']}
                    variant={LinkVariant.Inline}
                    useReactRouter={true}
                    alertType="dialog"
                  >
                    {text}
                  </LinkWithPermissionCheck>
                ),
                b: (text) => <b css="font-weight: 600;">{text}</b>,
              },
            )
          : intl.formatMessage(
              { id: 'chat.channelDetail.sidebar.openChannels.memberList.participants.error.full.multipleSubchannels' },
              {
                a: (text) => (
                  <LinkWithPermissionCheck
                    href="/settings/contact_us?category=technical_issue"
                    permissions={CONTACT_US_ALLOWED_PERMISSIONS}
                    variant={LinkVariant.Inline}
                    useReactRouter={true}
                    alertType="dialog"
                  >
                    {text}
                  </LinkWithPermissionCheck>
                ),
              },
            );

      return (
        <UserListCountBadge
          count={participantCount}
          max={maxTotalParticipants}
          error={{ icon: 'warning', message: tooltipContent }}
        />
      );
    }
    return <UserListCountBadge count={participantCount} max={maxTotalParticipants} />;
  }, [
    appId,
    dynamicPartitioningOption,
    intl,
    isUsingDynamicPartitioning,
    maxTotalParticipants,
    multipleSubChannelsMaxParticipants,
    participantCount,
  ]);

  const onUserListHeaderBackButtonClick = () => setOpenUserListType(null);

  return (
    <MTInfoSidebar>
      <MTInfoContent>
        {channel && (
          <>
            <ModerationToolsChannelInfo channelType="open_channels" channel={channel} />
            <MTInfoSectionToggle
              onClick={() => setOpenUserListType('participants')}
              label={intl.formatMessage({ id: userListNameMessageIds.participants })}
              badge={participantCountBadge}
            />
            <MTInfoSectionToggle
              onClick={() => setOpenUserListType('banned')}
              label={intl.formatMessage({ id: userListNameMessageIds.banned })}
              badge={bannedUserCountBadge}
            />
            <MTInfoSectionToggle
              onClick={() => setOpenUserListType('muted')}
              label={intl.formatMessage({ id: userListNameMessageIds.muted })}
              badge={mutedUserCountBadge}
            />
          </>
        )}
      </MTInfoContent>

      <Participants $isActive={openUserListType === 'participants'}>
        <UserListHeader onBackButtonClick={onUserListHeaderBackButtonClick} badge={participantCountBadge}>
          {intl.formatMessage({ id: userListNameMessageIds.participants })}
        </UserListHeader>
        <ParticipantList<SendBird.User>
          type="participants"
          items={participantListQuery.state.users}
          hasError={participantListQuery.state.hasError}
          hasNext={participantListQuery.state.hasMore}
          isLoading={participantListQuery.state.isLoading}
          isLoadingMore={participantListQuery.state.isLoadingMore}
          isLoadMoreFailed={participantListQuery.state.isLoadMoreFailed}
          handleLoadMore={participantListQuery.loadMore}
          handleReload={reloadParticipants}
          filterItems={({ item, query }) => item.nickname.toLowerCase().includes(query.toLowerCase())}
        >
          {(user) => {
            const { userId, nickname } = user;
            return (
              <UserProfilePopover
                tag="li"
                key={userId}
                popupId={`participant-${userId}`}
                popup={<UserProfilePopup user={user} />}
              >
                {({ togglePopup }) => (
                  <UserListItem connectionIndicatorType="online" onClick={togglePopup}>
                    {nickname}
                  </UserListItem>
                )}
              </UserProfilePopover>
            );
          }}
        </ParticipantList>
      </Participants>

      <Participants $isActive={openUserListType === 'banned'}>
        <UserListHeader onBackButtonClick={onUserListHeaderBackButtonClick} badge={bannedUserCountBadge}>
          {intl.formatMessage({ id: userListNameMessageIds.banned })}
        </UserListHeader>
        <ParticipantList<BannedUserListItem>
          type="banned"
          items={bannedUserState.items}
          hasError={bannedUserState.hasError}
          hasNext={!!bannedUserState.next}
          isLoading={bannedUserState.isLoading}
          isLoadingMore={bannedUserState.isLoadingMore}
          isLoadMoreFailed={bannedUserState.isLoadMoreFailed}
          handleLoadMore={loadMoreBannedUsers}
          handleReload={reloadBannedUsers}
          filterItems={({ item, query }) => item.user.nickname.toLowerCase().includes(query.toLowerCase())}
        >
          {renderBannedUserListItem({ handleUserBanStateChange })}
        </ParticipantList>
      </Participants>

      <Participants $isActive={openUserListType === 'muted'}>
        <UserListHeader onBackButtonClick={onUserListHeaderBackButtonClick} badge={mutedUserCountBadge}>
          {intl.formatMessage({ id: userListNameMessageIds.muted })}
        </UserListHeader>
        <ParticipantList<MutedUserListItem>
          type="muted"
          items={mutedUserState.users}
          hasError={mutedUserState.hasError}
          hasNext={!!mutedUserState.next}
          isLoading={mutedUserState.isLoading}
          isLoadingMore={mutedUserState.isLoadingMore}
          isLoadMoreFailed={mutedUserState.isLoadMoreFailed}
          handleLoadMore={loadMoreMutedUsers}
          handleReload={reloadMutedUsers}
          filterItems={({ item, query }) => item.nickname.toLowerCase().includes(query.toLowerCase())}
        >
          {renderMutedUserListItem({ handleUserMuteStateChange })}
        </ParticipantList>
      </Participants>
    </MTInfoSidebar>
  );
};
