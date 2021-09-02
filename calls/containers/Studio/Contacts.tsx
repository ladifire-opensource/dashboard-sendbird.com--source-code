import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import {
  cssVariables,
  EmptyState,
  EmptyStateSize,
  Headings,
  InlineNotification,
  OverflowMenu,
  OverflowMenuItem,
} from 'feather';

import { UserCard, UserCardLoading } from '@calls/components/UserCard';

import { FetchFailureReason } from '../Studio/dialogs/useMobileAppUsers';
import { useContactsContext } from './ContactsContext';
import { AddUserDropdown } from './components/dropdowns';

const MAX_CONTACTS = 10;

const UserList = styled.ul`
  > li {
    grid-template-columns: 32px calc(100% - 88px) 32px;
    border: none;
    padding: 0;
    height: 60px;
  }
`;

const Layout = styled.section`
  > h2 {
    ${Headings['heading-01']}
    color: ${cssVariables('neutral-10')};
  }

  > [role='combobox'] {
    transform: translateX(-12px);

    button {
      min-width: auto;
    }
  }

  > [role='alert'] {
    width: calc(100% + 16px);
    transform: translateX(-8px);
  }

  > h2 + ${UserList} {
    margin-top: 16px;
  }

  > h2 + ${EmptyState} {
    margin-top: 130px;

    [role='combobox'] {
      margin-top: 12px;
    }
  }

  > ${UserList} + [role='combobox'],
  > ${UserList} + [role='alert'] {
    margin-top: 8px;
  }
`;

const ContactsLimitInfo: FC = () => {
  const intl = useIntl();
  return (
    <InlineNotification
      type="info"
      message={intl.formatMessage({ id: 'calls.studio.contacts.notification.userLimitReached' }, { max: MAX_CONTACTS })}
    />
  );
};

const Contacts = () => {
  const intl = useIntl();
  const {
    items,
    reloadUser,
    showCreateUserDialog,
    showEditUserDialog,
    showAddExistingUserDialog,
    showRemoveUserDialog,
  } = useContactsContext();

  const handleRemoveClick = (userId: string) => () => {
    showRemoveUserDialog(userId);
  };

  const handleEditClick = (user: SDKUser) => () => {
    showEditUserDialog(user);
  };

  const handleReloadClick = (userId: string) => () => {
    reloadUser(userId);
  };

  return (
    <Layout>
      <h2>{intl.formatMessage({ id: 'calls.studio.contacts.header.title' })}</h2>
      {items.length > 0 && (
        <UserList>
          {items.map(({ isFetching, userId, data, fetchFailureReason }) => {
            if (isFetching) {
              return <UserCardLoading key={userId} />;
            }
            return (
              <UserCard
                key={userId}
                userId={userId}
                nickname={data?.nickname}
                profileUrl={data?.profile_url}
                errorMessage={
                  fetchFailureReason === FetchFailureReason.Else
                    ? intl.formatMessage({ id: 'calls.studio.contacts.user.fetchError' })
                    : undefined
                }
                deleted={fetchFailureReason === FetchFailureReason.Deleted}
                deactivated={data?.is_active === false}
                action={
                  <OverflowMenu
                    items={
                      [
                        data && {
                          label: intl.formatMessage({ id: 'calls.studio.contacts.user.actions.edit' }),
                          onClick: handleEditClick(data),
                          disabled: fetchFailureReason != null,
                        },
                        fetchFailureReason === FetchFailureReason.Else && {
                          label: intl.formatMessage({ id: 'calls.studio.contacts.user.actions.reload' }),
                          onClick: handleReloadClick(userId),
                          disabled: isFetching,
                        },
                        {
                          label: intl.formatMessage({ id: 'calls.studio.contacts.user.actions.remove' }),
                          onClick: handleRemoveClick(userId),
                        },
                      ].filter(Boolean) as OverflowMenuItem[]
                    }
                  />
                }
              />
            );
          })}
        </UserList>
      )}
      {items.length === 0 && (
        <EmptyState
          size={EmptyStateSize.Small}
          icon="user"
          title={intl.formatMessage({ id: 'calls.studio.contacts.empty' })}
          description={
            <AddUserDropdown
              variant="default"
              buttonType="tertiary"
              onClickCreate={showCreateUserDialog}
              onClickAddExisting={showAddExistingUserDialog}
            />
          }
        />
      )}
      {items.length > 0 && items.length < MAX_CONTACTS && (
        <AddUserDropdown
          variant="ghost"
          buttonType="primary"
          onClickCreate={showCreateUserDialog}
          onClickAddExisting={showAddExistingUserDialog}
        />
      )}
      {items.length === MAX_CONTACTS && <ContactsLimitInfo />}
    </Layout>
  );
};

export default Contacts;
