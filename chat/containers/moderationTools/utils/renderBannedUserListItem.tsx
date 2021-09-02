import ProhibitedUserProfilePopup from '@chat/components/UserProfilePopup/ProhibitedUserProfilePopup';
import UserProfilePopover from '@chat/components/UserProfilePopup/UserProfilePopover';
import { camelCaseKeys } from '@utils';

import ProhibitedUserListButton from '../components/ProhibitedUserListButton';
import { useBannedUsers } from '../hooks/useBannedUsers';

const renderBannedUserListItem = ({
  handleUserBanStateChange,
}: Pick<ReturnType<typeof useBannedUsers>, 'handleUserBanStateChange'>) => ({
  user,
  start_at,
  end_at,
  description,
}: BannedUserListItem) => {
  const { user_id, nickname } = user;
  return (
    <UserProfilePopover
      tag="li"
      key={user_id}
      popupId={`banned-${user_id}`}
      popup={
        <ProhibitedUserProfilePopup
          type="ban"
          user={camelCaseKeys(user)}
          startAt={start_at}
          endAt={end_at}
          description={description}
        />
      }
    >
      {({ togglePopup }) => (
        <ProhibitedUserListButton type="button" onClick={togglePopup}>
          <ProhibitedUserListButton.Nickname>{nickname}</ProhibitedUserListButton.Nickname>
          <ProhibitedUserListButton.DetailRow>
            <ProhibitedUserListButton.Icon icon="ban-filled" />
            <ProhibitedUserListButton.EndAtText
              endAt={end_at}
              onEnd={() => {
                handleUserBanStateChange(user_id, false);
              }}
            />
          </ProhibitedUserListButton.DetailRow>
        </ProhibitedUserListButton>
      )}
    </UserProfilePopover>
  );
};

export default renderBannedUserListItem;
