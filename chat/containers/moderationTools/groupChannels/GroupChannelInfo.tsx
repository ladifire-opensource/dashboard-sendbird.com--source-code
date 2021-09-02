import React, { useState, useCallback, useMemo, useContext } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Link, LinkVariant } from 'feather';

import UserProfilePopover from '@chat/components/UserProfilePopup/UserProfilePopover';
import UserProfilePopup from '@chat/components/UserProfilePopup/UserProfilePopup';
import { UserProfilePopupContext } from '@chat/components/UserProfilePopup/UserProfilePopupContextProvider';
import { useGroupChannelMaxMemberCount } from '@chat/hooks/useGroupChannelMaxMemberCount';
import { useTypedSelector } from '@hooks';
import { camelCaseKeys, PropOf } from '@utils';

import { ModerationToolsChannelInfo } from '../ModerationToolsChannelInfo';
import { UserListCountBadge } from '../UserListCountBadge';
import { UserListHeader } from '../UserListHeader';
import { MTInfoSidebar, MTInfoContent, MTInfoSection, MTInfoSectionToggle } from '../components';
import UserListItem from '../components/UserListItem';
import { InjectedBannedUsersProps } from '../hooks/useBannedUsers';
import { InjectedMutedMembersProps } from '../hooks/useMutedUsers';
import renderBannedUserListItem from '../utils/renderBannedUserListItem';
import renderMutedUserListItem from '../utils/renderMutedUserListItem';
import { MemberList } from './MemberList';
import { InjectedMembersProps } from './hooks/useMembers';

type Props = {
  channel: GroupChannel;
} & InjectedBannedUsersProps &
  InjectedMutedMembersProps &
  InjectedMembersProps;

type ActiveSection = 'none' | 'members' | 'banned' | 'muted';

const Members = styled(MTInfoSection)`
  display: flex;
  flex-direction: column;
`;

export const GroupChannelInfo: React.FC<Props> = React.memo(({ channel, bannedUsers, mutedMembers, members }) => {
  const {
    state: bannedUsersState,
    loadMore: loadMoreBannedUsers,
    reload: reloadBannedUsers,
    countBadge: bannedUserCountBadge,
    handleUserBanStateChange,
  } = bannedUsers;

  const {
    state: mutedMembersState,
    loadMore: loadMoreMutedMembers,
    reload: reloadMutedMembers,
    countBadge: mutedMemberCountBadge,
    handleUserMuteStateChange,
  } = mutedMembers;

  const { state: membersState, loadMore: loadMoreMembers, reload: reloadMembers } = members;

  const [activeSection, setActiveSection] = useState<ActiveSection>('none');
  const intl = useIntl();
  const { closeProfilePopup } = useContext(UserProfilePopupContext);

  const handleSectionChange = useCallback(
    (section: ActiveSection) => () => {
      setActiveSection(section);
      closeProfilePopup();

      switch (section) {
        case 'members':
          reloadMembers();
          break;
        case 'banned':
          reloadBannedUsers();
          break;
        case 'muted':
          reloadMutedMembers();
          break;
        default:
          break;
      }
    },
    [closeProfilePopup, reloadBannedUsers, reloadMembers, reloadMutedMembers],
  );

  const getMaxMemberCount = useGroupChannelMaxMemberCount();
  const maxMemberCount = getMaxMemberCount(channel);

  const isFetchingChannel = useTypedSelector((state) => state.groupChannels.isFetchingChannel);

  const memberCountBadge = useMemo(() => {
    const renderBadgeWithError = (error: PropOf<typeof UserListCountBadge, 'error'>) => (
      <UserListCountBadge
        count={channel.member_count}
        max={maxMemberCount}
        isLoading={isFetchingChannel}
        error={error}
      />
    );

    if (channel.member_count < maxMemberCount) {
      return renderBadgeWithError(undefined);
    }

    if (channel.member_count === maxMemberCount) {
      return renderBadgeWithError({
        icon: 'warning',
        message: intl.formatMessage(
          { id: 'chat.groupChannels.info.members.error.full' },
          {
            a: (text) => (
              <Link
                variant={LinkVariant.Inline}
                href="/settings/contact_us?category=sales_inquiry"
                useReactRouter={true}
              >
                {text}
              </Link>
            ),
          },
        ),
      });
    }

    return renderBadgeWithError(true);
  }, [channel.member_count, intl, isFetchingChannel, maxMemberCount]);

  return (
    <MTInfoSidebar>
      <MTInfoContent>
        <>
          <ModerationToolsChannelInfo channelType="group_channels" channel={channel} />
          <MTInfoSectionToggle
            label={intl.formatMessage({ id: 'chat.groupChannels.info.members.title' })}
            badge={memberCountBadge}
            onClick={handleSectionChange('members')}
          />
          <MTInfoSectionToggle
            label={intl.formatMessage({ id: 'chat.groupChannels.info.banned.title' })}
            badge={bannedUserCountBadge}
            onClick={handleSectionChange('banned')}
          />
          <MTInfoSectionToggle
            label={intl.formatMessage({ id: 'chat.groupChannels.info.muted.title' })}
            badge={mutedMemberCountBadge}
            onClick={handleSectionChange('muted')}
          />
        </>
      </MTInfoContent>
      <Members $isActive={activeSection === 'members'} data-test-id="MemberList">
        <UserListHeader badge={memberCountBadge} onBackButtonClick={handleSectionChange('none')}>
          {intl.formatMessage({ id: 'chat.groupChannels.info.members.title' })}
        </UserListHeader>
        <MemberList<GroupChannelMember>
          items={membersState.users}
          type="members"
          handleLoadMore={loadMoreMembers}
          handleReload={reloadMembers}
          hasError={membersState.hasError}
          hasMore={!!membersState.next}
          isLoadingMore={membersState.isLoadingMore}
          isLoadMoreFailed={membersState.isLoadMoreFailed}
        >
          {(user) => (
            <UserProfilePopover
              tag="li"
              key={user.user_id}
              popupId={`members-${user.user_id}`}
              popup={<UserProfilePopup user={camelCaseKeys(user)} />}
            >
              {({ togglePopup }) => (
                <UserListItem
                  onClick={togglePopup}
                  connectionIndicatorType={user.is_online ? 'online' : 'offline'}
                  isOperator={user.role === 'operator'}
                >
                  {user.nickname}
                </UserListItem>
              )}
            </UserProfilePopover>
          )}
        </MemberList>
      </Members>
      <Members $isActive={activeSection === 'banned'}>
        <UserListHeader badge={bannedUserCountBadge} onBackButtonClick={handleSectionChange('none')}>
          {intl.formatMessage({ id: 'chat.groupChannels.info.banned.title' })}
        </UserListHeader>
        <MemberList<BannedUserListItem>
          items={bannedUsersState.items}
          type="banned"
          handleLoadMore={loadMoreBannedUsers}
          handleReload={reloadBannedUsers}
          hasError={bannedUsersState.hasError}
          hasMore={!!bannedUsersState.next}
          isLoadingMore={bannedUsersState.isLoadingMore}
          isLoadMoreFailed={bannedUsersState.isLoadMoreFailed}
        >
          {renderBannedUserListItem({ handleUserBanStateChange })}
        </MemberList>
      </Members>
      <Members $isActive={activeSection === 'muted'}>
        <UserListHeader badge={mutedMemberCountBadge} onBackButtonClick={handleSectionChange('none')}>
          {intl.formatMessage({ id: 'chat.groupChannels.info.muted.title' })}
        </UserListHeader>
        <MemberList<MutedUserListItem>
          items={mutedMembersState.users}
          type="muted"
          handleLoadMore={loadMoreMutedMembers}
          handleReload={reloadMutedMembers}
          hasError={mutedMembersState.hasError}
          hasMore={!!mutedMembersState.next}
          isLoadingMore={mutedMembersState.isLoadingMore}
          isLoadMoreFailed={mutedMembersState.isLoadMoreFailed}
        >
          {renderMutedUserListItem({ handleUserMuteStateChange })}
        </MemberList>
      </Members>
    </MTInfoSidebar>
  );
});
