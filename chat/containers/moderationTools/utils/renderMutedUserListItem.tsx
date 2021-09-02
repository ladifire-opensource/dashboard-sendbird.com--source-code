import ProhibitedUserProfilePopup from '@chat/components/UserProfilePopup/ProhibitedUserProfilePopup';
import UserProfilePopover from '@chat/components/UserProfilePopup/UserProfilePopover';
import { camelCaseKeys } from '@utils';

import ProhibitedUserListButton from '../components/ProhibitedUserListButton';
import { useMutedUsers } from '../hooks/useMutedUsers';

const renderMutedUserListItem = ({
  handleUserMuteStateChange,
}: Pick<ReturnType<typeof useMutedUsers>, 'handleUserMuteStateChange'>) => (item: MutedUserListItem) => {
  const { user_id, nickname, end_at, description, remaining_duration } = item;
  return (
    <UserProfilePopover
      tag="li"
      key={`${user_id}-${end_at}`}
      popupId={`muted-${user_id}-${end_at}`}
      popup={
        <ProhibitedUserProfilePopup
          type="mute"
          user={camelCaseKeys(item)}
          startAt={end_at - remaining_duration}
          endAt={end_at}
          description={description}
        />
      }
    >
      {({ togglePopup }) => (
        <ProhibitedUserListButton type="button" onClick={togglePopup}>
          <ProhibitedUserListButton.Nickname>{nickname}</ProhibitedUserListButton.Nickname>
          <ProhibitedUserListButton.DetailRow>
            <ProhibitedUserListButton.Icon icon="mute-filled" />
            <ProhibitedUserListButton.EndAtText
              endAt={end_at}
              onEnd={() => {
                handleUserMuteStateChange(user_id, false);
              }}
            />
          </ProhibitedUserListButton.DetailRow>
        </ProhibitedUserListButton>
      )}
    </UserProfilePopover>
  );
};

export default renderMutedUserListItem;
