import React, { useEffect, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Lozenge, Table, TableProps, OverflowMenu, TableBatchAction, PrimitiveColor } from 'feather';

import { getRoleDisplayName } from '@authorization';
import { updateInvitation, cancelInvitation } from '@common/api/organizations';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { PredefinedRoles } from '@constants';
import { useAuthorization, useShowDialog } from '@hooks';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { SearchInputWrapper } from '../components';
import { CountLabel, NameWrapper, MembersPagination, CountNumber } from './components';

const statusColor: { [key in Invitation['status']]: PrimitiveColor } = {
  PENDING: 'orange',
  EXPIRED: 'red',
  JOINED: 'green',
  QUEUED: 'neutral',
  SEND_FAIL: 'red',
};

const InvitationTable = styled((props: TableProps<Invitation>) => Table<Invitation>(props))`
  flex: 1;
  min-height: 96px;
`;

const StatusLozenge = styled(Lozenge)`
  width: 80px;
`;

/**
 * TODO: Let's discuss about how we handle bulk API call errors
 */
const updateInvitations = (hashes: string[]) => Promise.all(hashes.map((hash) => updateInvitation(hash)));
const cancelInvitations = (hashes: string[]) => Promise.all(hashes.map((hash) => cancelInvitation(hash)));

export const InvitationsTab = ({
  invitations,
  page,
  pageSize,
  loading,
  setPagination,
  setOrder,
  count,
  load,
}: {
  invitations: Invitation[];
  page: number;
  pageSize: PerPage;
  loading: boolean;
  setOrder: React.Dispatch<React.SetStateAction<string>>;
  setPagination: (page: number, pageSize: PerPage) => void;
  count: number;
  load: () => void;
}) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const showDialog = useShowDialog();
  const [selection, setSelection] = useState<Invitation[]>([]);
  useEffect(() => setSelection([]), [invitations]);

  const onSelectionChange = (_: string[], selectedRows: Invitation[]) => setSelection(selectedRows);

  const resendInvitations = useCallback(
    (invitations) => () => {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          description: `Are you sure you want to resend ${
            invitations.length > 1 ? 'the selected invitations' : 'this invitation'
          }?`,
          onConfirm: async (setIsPending) => {
            setIsPending(true);
            await updateInvitations(invitations.map(({ invite_hash }) => invite_hash));
            load();
            setIsPending(false);
          },
        },
      });
    },
    [load, showDialog],
  );

  const deleteInvitations = useCallback(
    (invitations) => () => {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          description: `Are you sure you want to delete ${
            invitations.length > 1 ? 'the selected invitations' : 'this invitation'
          }?`,
          onConfirm: async (setIsPending) => {
            setIsPending(true);
            await cancelInvitations(invitations.map(({ invite_hash }) => invite_hash));
            load();
            setIsPending(false);
          },
        },
      });
    },
    [load, showDialog],
  );

  const getBatchActions = () => {
    const deleteInvitationAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'label.delete' }),
      icon: 'delete',
      onClick: deleteInvitations(selection),
    };
    const resendInvitationAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'label.resend' }),
      icon: 'reopen',
      onClick: resendInvitations(selection),
    };

    const batchActions = [deleteInvitationAction];
    if (selection.every((item) => item.status === 'EXPIRED')) {
      batchActions.unshift(resendInvitationAction);
    }
    return isPermitted(['organization.members.all']) && selection.length > 0 ? batchActions : [];
  };

  const onSortByUpdated = useCallback(
    (column, order) => {
      setPagination(1, pageSize); // move back to the first page
      if (!column) {
        setOrder('email');
        return;
      }
      setOrder(`${order === 'descend' ? '-' : ''}${column.dataIndex}` as FetchAppliationsOrderParam);
    },
    [pageSize, setOrder, setPagination],
  );

  return (
    <>
      <SearchInputWrapper>
        <CountLabel>
          {intl.formatMessage(
            { id: 'common.settings.invitations.count.total' },
            {
              count: <CountNumber>{intl.formatNumber(count)}</CountNumber>,
            },
          )}
        </CountLabel>
      </SearchInputWrapper>
      <InvitationTable
        rowKey="email"
        dataSource={invitations}
        loading={loading}
        batchActions={getBatchActions()}
        rowSelection={{
          onChange: onSelectionChange,
          selectedRowKeys: selection.map((item) => item.email),
        }}
        columns={[
          {
            dataIndex: 'email',
            title: intl.formatMessage({ id: 'label.email' }),
            defaultSortOrder: 'ascend',
            sorter: true,
            render: ({ email }) => <NameWrapper>{email}</NameWrapper>,
          },
          {
            dataIndex: 'role',
            title: intl.formatMessage({ id: 'label.role' }),
            sorter: true,
            render: ({ role }) =>
              getRoleDisplayName({
                name: role,
                is_predefined: Object.values(PredefinedRoles).includes(role),
              } as MemberRole),
          },
          {
            dataIndex: 'status',
            title: intl.formatMessage({ id: 'label.status' }),
            sorter: true,
            render: ({ status }) => <StatusLozenge color={statusColor[status]}>{status}</StatusLozenge>,
          },
        ]}
        rowActions={(record) => [
          <OverflowMenu
            key="invitationTabOverflow"
            items={[
              ...(record.status === 'EXPIRED'
                ? [{ label: intl.formatMessage({ id: 'label.resend' }), onClick: resendInvitations([record]) }]
                : []),
              { label: intl.formatMessage({ id: 'label.delete' }), onClick: deleteInvitations([record]) },
            ]}
          />,
        ]}
        emptyView={
          <CenteredEmptyState
            icon="users"
            title={intl.formatMessage({ id: 'label.invitationListEmpty' })}
            description={intl.formatMessage({ id: 'desc.invitationListEmpty' })}
          />
        }
        onSortByUpdated={onSortByUpdated}
        footer={
          <MembersPagination
            current={page}
            total={count}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50, 100] as ReadonlyArray<PerPage>}
            onChange={setPagination}
            onItemsPerPageChange={setPagination}
          />
        }
        showScrollbars={true}
      />
    </>
  );
};
