import { FC, useState } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, IconButton, Subtitles, toast } from 'feather';

import { useAppId } from '@hooks';
import { CancelButton, ConfirmButton, DialogFormAction, SDKUserAvatar, UserSearchDropdown } from '@ui/components';

import { MAX_CONTACTS } from '../../constants';
import { loadUserIdsFromLocalStorage } from '../localStorageUtils';

const Remove = styled(IconButton).attrs({
  size: 'small',
  buttonType: 'tertiary',
  icon: 'remove',
  type: 'button',
})``;

const useUsersSelector = () => {
  const [users, setUsers] = useState<SDKUser[]>([]);
  const intl = useIntl();
  const appId = useAppId();
  const localStorageIds = loadUserIdsFromLocalStorage(appId);

  const addUser = (user: SDKUser) => {
    const isDuplicatedWithLocalStorage = localStorageIds.includes(user.user_id);
    if (isDuplicatedWithLocalStorage) {
      toast.warning({
        message: intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.addExistingUser_error.alreadyExists' }),
      });
      return;
    }

    const isDuplicatedWithLocalState = users.some((item) => item.user_id === user.user_id);
    if (!isDuplicatedWithLocalState) {
      setUsers((users) => users.concat(user));
    }
  };

  const removeUser = ({ user_id }: SDKUser) => {
    setUsers((users) => users.filter((item) => item.user_id !== user_id));
  };

  const isLimitReached = localStorageIds.length + users.length >= MAX_CONTACTS;

  return { users, isLimitReached, addUser, removeUser };
};

const UserItem = styled.li`
  justify-content: space-between;
  display: flex;

  padding: 16px;
  border: 1px solid ${cssVariables('neutral-3')};
`;

const UserListContainer = styled.ul`
  li:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  li:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  li + li {
    margin-top: -1px;
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 316px;

  span,
  small {
    display: block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span {
    ${Subtitles['subtitle-01']};
    color: ${cssVariables('neutral-10')};
  }

  small {
    font-size: 12px;
    line-height: 16px;
    font-weight: 400;
    color: ${cssVariables('neutral-7')};
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;

  ${SDKUserAvatar} + ${TextContainer} {
    margin-left: 12px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;

  ${UserListContainer} {
    margin-top: 16px;
  }
`;

const UserList: FC<{ users: SDKUser[]; onClickRemove?: (user: SDKUser) => void }> = ({ users, onClickRemove }) => {
  const intl = useIntl();
  return (
    <UserListContainer>
      {users.map((user) => (
        <UserItem key={user.user_id}>
          <ProfileContainer>
            <SDKUserAvatar size="medium" userID={user.user_id} imageUrl={user.profile_url} />
            <TextContainer>
              <span>{user.user_id}</span>
              <small>{user.nickname}</small>
            </TextContainer>
          </ProfileContainer>
          <Remove
            onClick={() => onClickRemove?.(user)}
            title={intl.formatMessage({
              id: 'common.settings.billing.billingContacts.additionalContacts.button.remove',
            })}
          />
        </UserItem>
      ))}
    </UserListContainer>
  );
};

export const FindExistingUserForm: FC<{
  onClose: () => void;
  onSuccess: (user: SDKUser[]) => void;
}> = ({ onClose, onSuccess }) => {
  const intl = useIntl();

  const { users, addUser, removeUser, isLimitReached } = useUsersSelector();

  const handleSubmit = () => {
    onSuccess(users);
    onClose();
  };

  return (
    <Form onSubmit={handleSubmit} data-test-id="FindExistingUserForm">
      <UserSearchDropdown
        placeholder="Nickname or user ID"
        menuMaxHeight={280}
        disabled={isLimitReached}
        onItemSelected={addUser}
      />
      {users.length > 0 && <UserList users={users} onClickRemove={removeUser} />}
      <DialogFormAction>
        <CancelButton type="button" onClick={onClose}>
          {intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog_btn.cancel' })}
        </CancelButton>
        <ConfirmButton type="submit" data-test-id="SubmitButton">
          {intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.addExistingUser_btn.submit' })}
        </ConfirmButton>
      </DialogFormAction>
    </Form>
  );
};
