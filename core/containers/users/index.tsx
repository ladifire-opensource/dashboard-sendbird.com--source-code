import { FC, useState, useEffect, useMemo, HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  Button,
  Dropdown,
  Lozenge,
  TableBatchAction,
  cssVariables,
  toast,
  TableColumnProps,
  DropdownProps,
} from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { QUERY_USER_ID, QUERY_USER_NICKNAME, QUERY_USER_NICKNAME_STARTSWITH, EMPTY_TEXT } from '@constants';
import { fetchUsers, searchUsers } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAuthorization } from '@hooks';
import { SearchInput, SDKUserAvatar, LoadMoreTable, PageHeader, TablePageContainer } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { camelCaseKeys } from '@utils';

type SearchQueryOption = {
  label: string;
  suffix: string;
  key: string;
  description: string;
};

type UserStatusFilterOption = {
  value: 'all' | 'activated' | 'deactivated';
  label: string;
};

const UserIdColumnItem = styled(Link)`
  flex: 1;
  align-self: stretch;
  margin: -12px 0;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.43;
  color: ${cssVariables('neutral-10')};
`;

const UserStatusFilter = styled((props: DropdownProps<UserStatusFilterOption>) => <Dropdown {...props} />)`
  height: 32px;
`;

const NicknameAvatar = styled(SDKUserAvatar)`
  margin-right: 10px;
`;

const Filters = styled.div`
  display: grid;
  grid-auto-flow: column;
  justify-content: start;
  grid-gap: 4px;
`;

const defaultUsersSearchQueryOption = {
  label: 'id',
  suffix: ' (equal)',
  key: QUERY_USER_ID,
  description: 'User ID',
};

const usersSearchQueryOptions = [
  defaultUsersSearchQueryOption,
  {
    label: 'nickname',
    suffix: ' (equal)',
    key: QUERY_USER_NICKNAME,
    description: 'User Nickname',
  },
  {
    label: 'nickname',
    suffix: ' (startswith)',
    key: QUERY_USER_NICKNAME_STARTSWITH,
    description: 'User Nickname',
  },
];

const activeMode = {
  activate: { value: 'activated', label: 'Active users' },
  deactivate: { value: 'deactivated', label: 'Deactivated users' },
  all: { value: 'all', label: 'All users' },
} as const;

type ActiveModeFilter = typeof activeMode[keyof typeof activeMode];

type EmptyViewProps = { isSearched: boolean; query: string };

const EmptyView: FC<EmptyViewProps> = ({ isSearched, query }) => {
  const intl = useIntl();

  if (isSearched) {
    return (
      <CenteredEmptyState
        icon="no-search"
        title={intl.formatMessage({ id: 'core.users.table_body.noMatch.title' })}
        description={intl.formatMessage({ id: 'core.users.table_body.noMatch.desc' }, { query })}
      />
    );
  }
  return (
    <CenteredEmptyState
      icon="users"
      title={intl.formatMessage({ id: 'core.users.table_body.noResult.title' })}
      description={intl.formatMessage({ id: 'core.users.table_body.noResult.desc' })}
    />
  );
};

export const Users: FC = () => {
  const intl = useIntl();
  const appId = useSelector<RootState, Application['app_id']>((state) => state.applicationState.data?.app_id ?? '');
  const dispatch = useDispatch();
  const { isPermitted } = useAuthorization();
  const [activeModeFilter, setActiveModeFilter] = useState<ActiveModeFilter>(activeMode.all);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState<SearchQueryOption>(defaultUsersSearchQueryOption);
  const [selectedUsers, setSelectedUsers] = useState<readonly User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [next, setNext] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isFetchingMoreUsers, setIsFetchingMoreUsers] = useState(false);

  const resetSelectedUsers = () => {
    setSelectedUsers([]);
  };

  const handleCreateUserButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.CreateUser,
        dialogProps: {
          onSuccess: (user) => {
            setUsers([user, ...users]);
          },
        },
      }),
    );
  };

  const handleDeleteUserActionButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.DeleteUser,
        dialogProps: {
          selectedUsers,
          onSuccess: (deletedUserIds) => {
            setSelectedUsers(selectedUsers.filter(({ userId }) => !deletedUserIds.includes(userId)));
            setUsers(users.filter((user) => !deletedUserIds.some((userId) => userId === user.userId)));
          },
        },
      }),
    );
  };

  const handleDeactivateUserActionButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.DeactivateUser,
        dialogProps: {
          selectedUsers,
          onSuccess: (userIds) => {
            setSelectedUsers([]);
            setUsers(
              users.map((user) => {
                if (userIds.some((userId) => userId === user.userId)) {
                  return { ...user, isActive: false };
                }
                return user;
              }),
            );
          },
        },
      }),
    );
  };

  const handleReactivateUserActionButtonClick = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.ReactivateUser,
        dialogProps: {
          selectedUsers,
          onSuccess: (userIds) => {
            setSelectedUsers([]);
            setUsers(
              users.map((user) => {
                if (userIds.some((userId) => userId === user.userId)) {
                  return { ...user, isActive: true };
                }
                return user;
              }),
            );
          },
        },
      }),
    );
  };

  const handleUsersSearchOptionChange = (option) => {
    setSearchOption(option);
  };

  const handleUsersSearchInputClear = () => {
    setSearchQuery('');
    setActiveModeFilter(activeMode.all);
    setIsSearched(false);
    setIsFetchingUsers(true);
    fetchUsers({ appId, activeMode: 'all' })
      .then(({ data }) => {
        setIsFetchingUsers(false);
        setUsers(data.users.map((user) => camelCaseKeys(user)));
        setNext(data.next);
      })
      .catch((error) => {
        setIsFetchingUsers(false);
        toast.error({ message: getErrorMessage(error) });
      });
  };

  const handleUsersSearchSubmit = () => {
    resetSelectedUsers();
    setIsFetchingUsers(true);
    if (searchQuery === '') {
      fetchUsers({ appId, activeMode: activeModeFilter.value })
        .then(({ data }) => {
          setIsSearched(false);
          setIsFetchingUsers(false);
          setUsers(data.users.map((user) => camelCaseKeys(user)));
          setNext(data.next);
        })
        .catch((error) => {
          setIsFetchingUsers(false);
          toast.error({ message: getErrorMessage(error) });
        });
    } else {
      setActiveModeFilter(activeMode.all);
      setIsFetchingUsers(true);
      searchUsers({ appId, query: searchQuery, option: searchOption.key })
        .then(({ data }) => {
          setIsSearched(true);
          setIsFetchingUsers(false);
          setUsers(data.users.map((user) => camelCaseKeys(user)));
          setNext(data.next);
        })
        .catch((error) => {
          setIsFetchingUsers(false);
          toast.error({ message: getErrorMessage(error) });
        });
    }
  };

  const handleActiveModeFilterChange = (activeMode: ActiveModeFilter) => {
    if (activeMode.value !== activeModeFilter.value) {
      setActiveModeFilter(activeMode);
      setSearchQuery('');
      resetSelectedUsers();
      setIsSearched(false);
      setIsFetchingUsers(true);
      fetchUsers({ appId, activeMode: activeMode.value })
        .then(({ data }) => {
          setIsFetchingUsers(false);
          setUsers(data.users.map((user) => camelCaseKeys(user)));
          setNext(data.next);
        })
        .catch((error) => {
          setIsFetchingUsers(false);
          toast.error({ message: getErrorMessage(error) });
        });
    }
  };

  const handleLoadMoreButtonClick = () => {
    setIsFetchingMoreUsers(true);
    if (isSearched) {
      searchUsers({ appId, query: searchQuery, option: searchOption.key, next })
        .then(({ data }) => {
          setIsSearched(true);
          setIsFetchingMoreUsers(false);
          setUsers(users.concat(data.users.map((user) => camelCaseKeys(user))));
          setNext(data.next);
        })
        .catch((error) => {
          setIsFetchingMoreUsers(false);
          toast.error({ message: getErrorMessage(error) });
        });
    } else {
      fetchUsers({ appId, activeMode: activeModeFilter.value, next })
        .then(({ data }) => {
          setIsFetchingMoreUsers(false);
          setUsers(users.concat(data.users.map((user) => camelCaseKeys(user))));
          setNext(data.next);
        })
        .catch((error) => {
          setIsFetchingMoreUsers(false);
          toast.error({ message: getErrorMessage(error) });
        });
    }
  };

  const getBatchActions = () => {
    const deleteUserAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'core.users.table_header.batchActions_delete.button' }),
      icon: 'delete',
      onClick: handleDeleteUserActionButtonClick,
      ...({ 'data-test-id': 'DeleteButton' } as HTMLAttributes<HTMLButtonElement>),
    };
    const deactivateUserAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'core.users.table_header.batchActions_deactivate.button' }),
      icon: 'ban',
      onClick: handleDeactivateUserActionButtonClick,
    };
    const reactivateUserAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'core.users.table_header.batchActions_reactivate.button' }),
      icon: 'invite',
      onClick: handleReactivateUserActionButtonClick,
    };
    const batchActions = [deleteUserAction];

    if (selectedUsers.every((user) => user.isActive)) {
      batchActions.push(deactivateUserAction);
    } else if (selectedUsers.every((user) => !user.isActive)) {
      batchActions.push(reactivateUserAction);
    }

    return batchActions;
  };

  const dataSource = useMemo(() => {
    if (activeModeFilter.value === 'activated') {
      return users.filter((user) => user.isActive === true);
    }
    if (activeModeFilter.value === 'deactivated') {
      return users.filter((user) => user.isActive === false);
    }
    return users;
  }, [activeModeFilter.value, users]);

  useEffect(() => {
    setIsFetchingUsers(true);
    fetchUsers({ appId, activeMode: 'all' })
      .then(({ data }) => {
        setIsFetchingUsers(false);
        setUsers(data.users.map((user) => camelCaseKeys(user)));
        setNext(data.next);
      })
      .catch((error) => {
        setIsFetchingUsers(false);
        toast.error({ message: getErrorMessage(error) });
      });
  }, [appId]);

  const isAllUsersHaveCreatedAt = dataSource.every((user) => user.createdAt != null);

  const columns = useMemo(() => {
    const defaultColumns: TableColumnProps<User>[] = [
      {
        title: intl.formatMessage({ id: 'core.users.table_header.userId' }),
        dataIndex: 'userId',
        flex: 2,
        render: ({ userId }) => (
          <UserIdColumnItem to={`/${appId}/users/${encodeURIComponent(userId)}`}>{userId}</UserIdColumnItem>
        ),
        onCell: () => ({ 'data-test-id': 'userIdColumn' } as any),
      },
      {
        title: intl.formatMessage({ id: 'core.users.table_header.nickname' }),
        dataIndex: 'nickname',
        flex: 2,
        render: (user) => (
          <>
            <NicknameAvatar size="small" userID={user.userId} imageUrl={user.profileUrl} />
            {user.nickname || EMPTY_TEXT}
          </>
        ),
        onCell: () => ({ 'data-test-id': 'nicknameColumn' } as any),
      },
      {
        title: intl.formatMessage({ id: 'core.users.table_header.status' }),
        dataIndex: 'isActive',
        render: (record) =>
          record.isActive ? (
            <Lozenge color="green">{intl.formatMessage({ id: 'core.users_status.activated' })}</Lozenge>
          ) : (
            <Lozenge color="neutral">{intl.formatMessage({ id: 'core.users_status.deactivated' })}</Lozenge>
          ),
        onCell: () => ({ 'data-test-id': 'isActiveColumn' } as any),
      },
    ];

    if (isAllUsersHaveCreatedAt) {
      return defaultColumns.concat([
        {
          title: intl.formatMessage({ id: 'core.users.table_header.createdAt' }),
          dataIndex: 'createdAt',
          render: (record) => (record.createdAt ? moment(record.createdAt * 1000).format('lll') : EMPTY_TEXT),
          onCell: () => ({ 'data-test-id': 'createdAtColumn' } as any),
        },
      ]);
    }
    return defaultColumns;
  }, [appId, intl, isAllUsersHaveCreatedAt]);

  return (
    <TablePageContainer
      css={`
        ${PageHeader} + * {
          margin-top: 24px;
        }
      `}
    >
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'core.users.header.title' })}</PageHeader.Title>
        {isPermitted(['application.users.all']) && (
          <PageHeader.Actions>
            <Button buttonType="primary" size="small" icon="plus" onClick={handleCreateUserButtonClick}>
              {intl.formatMessage({ id: 'core.users.header.createUser.button' })}
            </Button>
          </PageHeader.Actions>
        )}
      </PageHeader>
      <Filters>
        <SearchInput
          ph={intl.formatMessage({ id: 'core.users.table_menu.search.ph' })}
          value={searchQuery}
          defaultOption={defaultUsersSearchQueryOption}
          options={usersSearchQueryOptions}
          isFetching={isFetchingUsers}
          handleChange={setSearchQuery}
          handleOptionChange={handleUsersSearchOptionChange}
          handleSearchClear={handleUsersSearchInputClear}
          handleSubmit={handleUsersSearchSubmit}
          styles={{
            SearchInput: css`
              min-width: 224px;
              width: 224px;
              height: 32px;
            `,
          }}
        />
        <UserStatusFilter
          selectedItem={activeModeFilter}
          items={[
            {
              value: 'all',
              label: intl.formatMessage({ id: 'core.users.table_menu.activeStatusFilter.all' }),
            },
            {
              value: 'activated',
              label: intl.formatMessage({ id: 'core.users.table_menu.activeStatusFilter.active' }),
            },
            {
              value: 'deactivated',
              label: intl.formatMessage({ id: 'core.users.table_menu.activeStatusFilter.deactivate' }),
            },
          ]}
          itemToString={(item) => item.label}
          onItemSelected={handleActiveModeFilterChange}
        />
      </Filters>
      <LoadMoreTable<User>
        columns={columns}
        dataSource={dataSource}
        rowKey="userId"
        rowSelection={
          isPermitted(['application.users.all'])
            ? {
                hideDefaultSelections: true,
                selectedRowKeys: selectedUsers.map((user) => user.userId),
                onChange: (_, selectedRows) => setSelectedUsers(selectedRows),
                getCheckboxProps: () => ({
                  onClick: (e) => e.stopPropagation(),
                }),
              }
            : undefined
        }
        batchActions={getBatchActions()}
        loading={isFetchingUsers}
        emptyView={!isFetchingUsers && <EmptyView isSearched={isSearched} query={searchQuery} />}
        hasNext={users.length > 0 && !isFetchingUsers && !!next}
        loadMoreButtonProps={{ isLoading: isFetchingMoreUsers, onClick: handleLoadMoreButtonClick }}
      />
    </TablePageContainer>
  );
};
