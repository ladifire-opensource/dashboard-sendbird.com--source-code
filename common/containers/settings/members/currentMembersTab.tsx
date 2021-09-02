import { useState, useCallback, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import styled, { css } from 'styled-components';

import {
  Table,
  TableProps,
  toast,
  Lozenge,
  LozengeVariant,
  OverflowMenu,
  TableBatchAction,
  Avatar,
  AvatarType,
  EmptyState,
  EmptyStateSize,
} from 'feather';

import { commonActions } from '@actions';
import { getRoleDisplayName } from '@authorization';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { PredefinedRoles, EMPTY_TEXT } from '@constants';
import { useAuthorization, usePagination, useShowDialog, useLatestValue, useOrganization } from '@hooks';
import { useOrganizationMembers } from '@hooks/useOrganizationMembers';
import { DialogAlert, DialogAlertTitle, DialogAlertDesc } from '@ui/components';

import { SearchInputWrapper, SearchInput } from '../components';
import { AuthenticationBadge } from './authenticationBadge';
import { CountLabel, NameWrapper, MembersPagination, CountNumber } from './components';

const MemberTable = styled((props: TableProps<OrganizationMember> & { isEmpty: boolean }) =>
  Table<OrganizationMember>(props),
)`
  flex: 1;
  min-height: 96px;

  input[type='checkbox'] {
    outline: 0;
  }

  ${({ isEmpty }) => {
    if (isEmpty) {
      return css`
        tbody {
          border-bottom: 0;
          height: 100%;
        }
        tr {
          height: 100%;
          td {
            align-items: center;
            justify-content: center;
            padding-bottom: 40px;
          }
        }
      `;
    }
  }}
`;

const NameText = styled.span`
  vertical-align: baseline;
  &:not(:last-child) {
    margin-right: 8px;
  }
`;

const NameColumnCell = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  ${NameWrapper} {
    margin-left: 16px;
  }
`;

const MemberAvatar = styled(Avatar)`
  margin-top: -6px;
  margin-bottom: -6px;
`;

const SystemRoleLozenge = styled(Lozenge)`
  margin-left: 8px;
`;

const CountWrapper = styled.div`
  margin-bottom: 16px;
`;

const MembersSearchInput = ({
  handleSearchClear,
  handleSubmit,
}: {
  handleSearchClear: () => void;
  handleSubmit: (query: string) => void;
}) => {
  const [query, setQuery] = useState('');
  return (
    <SearchInput
      type="default"
      styles={{
        SearchInput: css`
          padding-left: 16px;
        `,
        SearchScope: css`
          display: none;
        `,
      }}
      value={query}
      handleChange={setQuery}
      handleSearchClear={() => {
        handleSearchClear();
        setQuery('');
      }}
      handleSubmit={handleSubmit}
    />
  );
};

type Order = FetchOrganizationMembersPayload['params']['order'];

export const CurrentMembersTab = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const { uid, sso_enforcing: enforcingSSO } = useOrganization();
  const { role, isPermitted } = useAuthorization();
  const { page, pageSize, setPagination } = usePagination(1, 20);
  const [order, setOrder] = useState<Order>('nickname');
  const { loading, searching, searchQuery, members, total, count, load } = useOrganizationMembers({
    limit: pageSize,
    offset: (page - 1) * pageSize,
    order,
  });
  const [selectedMembers, setSelectedMembers] = useState<OrganizationMember[]>([]);

  const removeSelectedMember = (member: OrganizationMember) => {
    const filteredMembers = selectedMembers.filter((selectedMember) => {
      return selectedMember.user.email !== member.user.email && member.role !== PredefinedRoles.OWNER;
    });
    setSelectedMembers(filteredMembers);
  };

  const latestRemoveSelectedMember = useLatestValue(removeSelectedMember);

  useEffect(() => {
    latestRemoveSelectedMember.current = removeSelectedMember;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [removeSelectedMember]);

  useEffect(() => {
    /**
     * FIXME: if just call setSelectedMembers([]) it cause infinite render in jest test...
     */
    if (members.length > 0) {
      setSelectedMembers([]);
    }
  }, [members]);

  const onSelectionChange = (_: string[], selectedRows: OrganizationMember[]) => {
    setSelectedMembers(
      // Owner cannot be selected
      selectedRows.filter((member) => member.role !== PredefinedRoles.OWNER),
    );
  };

  const transferOwner = (member: OrganizationMember) => () => {
    showDialog({
      dialogTypes: DialogType.Confirm,
      dialogProps: {
        title: 'Transfer Owner',
        description: (
          <DialogAlert>
            <DialogAlertTitle>Are you sure you want to transfer ownership?</DialogAlertTitle>
            <DialogAlertDesc>
              There can only be <strong>one Owner for an organization</strong> and by switching ownership, you will be
              automatically assigned as an Admin. You will lose the right to delete applications and manage members.
            </DialogAlertDesc>
          </DialogAlert>
        ),
        onConfirm: () => {
          dispatch(
            commonActions.transferOwnerRequest({
              organization_uid: uid,
              email: member.user.email,
            }),
          );
        },
      },
    });
    return;
  };

  const deleteMembers = useCallback(
    (members: OrganizationMember[]) => {
      if (members.length === 0) {
        return;
      }
      showDialog({
        dialogTypes: DialogType.Delete,
        dialogProps: {
          description: 'Selected members will be deleted immediately.',
          onDelete: () => {
            dispatch(
              commonActions.deleteOrganizationMembersRequest({
                organization_uid: uid,
                members,
                onDelete: () => {
                  load(searchQuery);
                },
              }),
            );
          },
        },
      });
    },
    [dispatch, load, searchQuery, showDialog, uid],
  );

  const deleteSelectedMembers = () => {
    if (selectedMembers.length === 0) {
      toast.warning({
        message: 'There are no selected members. Please select a member.',
      });
      return;
    }
    deleteMembers(selectedMembers);
  };

  const editMembers = useCallback(
    (members: OrganizationMember[]) => {
      if (members.length === 0) {
        return;
      }
      showDialog({
        dialogTypes: DialogType.ChangeMemberRole,
        dialogProps: {
          uid,
          members,
          removeSelectedMemberRef: latestRemoveSelectedMember,
          onSuccess: () => {
            load(searchQuery);
          },
        },
      });
    },
    [showDialog, uid, latestRemoveSelectedMember, load, searchQuery],
  );

  const handleEditClick = () => {
    if (selectedMembers.length === 0) {
      toast.warning({
        message: 'There are no selected members. Please select a member.',
      });
      return;
    }
    editMembers(selectedMembers);
  };

  const editMember = useCallback((member: OrganizationMember) => () => editMembers([member]), [editMembers]);
  const deleteMember = useCallback((member: OrganizationMember) => () => deleteMembers([member]), [deleteMembers]);

  const getBatchActions = () => {
    const editMembersAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'label.edit' }),
      icon: 'edit',
      onClick: handleEditClick,
    };
    const deleteMembersAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'label.delete' }),
      icon: 'delete',
      onClick: deleteSelectedMembers,
    };

    return isPermitted(['organization.members.all']) && selectedMembers.length > 0
      ? [editMembersAction, deleteMembersAction]
      : [];
  };

  const onSortByUpdated = useCallback(
    (column, order) => {
      setPagination(1, pageSize); // move back to the first page
      if (!column) {
        setOrder('nickname');
        return;
      }
      setOrder(`${order === 'descend' ? '-' : ''}${column.dataIndex}` as Order);
    },
    [pageSize, setPagination],
  );

  const memberCount = useMemo(() => {
    if (count === 0) {
      return null;
    }
    if (searching) {
      return intl.formatMessage(
        { id: 'common.settings.members.count.search' },
        {
          count: <CountNumber>{intl.formatNumber(count)}</CountNumber>,
          countNumber: count,
          total: <CountNumber>{intl.formatNumber(total)}</CountNumber>,
          totalNumber: total,
        },
      );
    }
    return intl.formatMessage(
      { id: 'common.settings.members.count.total' },
      {
        count: <CountNumber>{intl.formatNumber(total)}</CountNumber>,
      },
    );
  }, [count, intl, searching, total]);

  return (
    <>
      <SearchInputWrapper
        css={css`
          ${SearchInput} {
            margin-left: 0;
          }
        `}
      >
        <MembersSearchInput
          handleSearchClear={() => {
            setPagination(1, pageSize);
            load('');
          }}
          handleSubmit={(value) => {
            setPagination(1, pageSize);
            load(value);
          }}
        />
      </SearchInputWrapper>
      <CountWrapper>
        <CountLabel>{memberCount}</CountLabel>
      </CountWrapper>
      <MemberTable
        isEmpty={searchQuery !== '' && count === 0}
        rowKey="id"
        dataSource={members}
        loading={loading}
        batchActions={getBatchActions()}
        rowSelection={
          isPermitted(['organization.members.all'])
            ? {
                onChange: onSelectionChange,
                selectedRowKeys: selectedMembers.map((member) => member.id as any),
                getCheckboxProps: (record) => ({
                  // Owner cannot be selected
                  disabled: record.role === PredefinedRoles.OWNER,
                }),
              }
            : undefined
        }
        columns={[
          {
            dataIndex: 'nickname',
            title: intl.formatMessage({ id: 'common.settings.members.column.displayName' }),
            defaultSortOrder: 'ascend' as const,
            sorter: true,
            render: (member) => (
              <NameColumnCell>
                <MemberAvatar type={AvatarType.Member} size={32} profileID={member.user.email} />
                <NameWrapper>
                  <NameText>{member.user.profile.nickname}</NameText>
                  {member.sso_name_id && <AuthenticationBadge>SSO</AuthenticationBadge>}
                  {member.user.profile.two_factor_authentication && !enforcingSSO && (
                    <AuthenticationBadge>2FA</AuthenticationBadge>
                  )}
                </NameWrapper>
              </NameColumnCell>
            ),
          },
          {
            dataIndex: 'first_name',
            title: intl.formatMessage({ id: 'common.settings.members.column.name' }),
            sorter: false,
            width: 200,
            render: (member) =>
              member.user.first_name === '' && member.user.last_name === '' ? (
                EMPTY_TEXT
              ) : (
                <>
                  {member.user.first_name} {member.user.last_name}
                </>
              ),
          },
          {
            dataIndex: 'email',
            title: intl.formatMessage({ id: 'label.email' }),
            sorter: true,
            render: ({ user }) => user.email,
          },
          {
            dataIndex: 'role',
            title: intl.formatMessage({ id: 'label.role' }),
            sorter: true,
            render: ({ role }) => {
              const is_predefined = Object.values(PredefinedRoles).includes(role);
              return (
                <>
                  {getRoleDisplayName({ name: role, is_predefined } as MemberRole)}
                  {is_predefined && (
                    <SystemRoleLozenge variant={LozengeVariant.Light} color="neutral">
                      System role
                    </SystemRoleLozenge>
                  )}
                </>
              );
            },
          },
          ...(isPermitted(['organization.members.all'])
            ? [
                {
                  key: 'more',
                  width: 32,
                  styles: 'margin: -6px 0; margin-right: 8px;',
                  render: (member) => {
                    if (member.role === PredefinedRoles.OWNER) {
                      return '';
                    }

                    const overflowItems = [
                      { label: 'Edit', onClick: editMember(member) },
                      { label: intl.formatMessage({ id: 'label.delete' }), onClick: deleteMember(member) },
                    ];
                    if (role.name === PredefinedRoles.OWNER && member.role !== PredefinedRoles.OWNER) {
                      overflowItems.unshift({ label: 'Transfer owner', onClick: transferOwner(member) });
                    }
                    return <OverflowMenu items={overflowItems} />;
                  },
                },
              ]
            : []),
        ]}
        onSortByUpdated={onSortByUpdated}
        footer={
          <MembersPagination
            current={page}
            total={count}
            pageSize={pageSize as PerPage}
            pageSizeOptions={[20, 50, 100] as ReadonlyArray<PerPage>}
            onChange={setPagination}
            onItemsPerPageChange={setPagination}
          />
        }
        showScrollbars={count !== 0}
        emptyView={
          !loading &&
          searchQuery !== '' && (
            <EmptyState
              size={EmptyStateSize.Large}
              icon="no-search"
              title={intl.formatMessage({ id: 'common.settings.members.noResult.title' })}
              description={intl.formatMessage(
                { id: 'common.settings.members.noResult.description' },
                { query: searchQuery },
              )}
              withoutMarginBottom={true}
            />
          )
        }
      />
    </>
  );
};
