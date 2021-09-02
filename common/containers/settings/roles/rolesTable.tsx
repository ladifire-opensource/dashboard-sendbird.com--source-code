import React, { ComponentProps, HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { TableProps, Table, OverflowMenu, Lozenge, cssVariables } from 'feather';

import { getRoleDisplayName } from '@authorization';
import { PredefinedRoles } from '@constants';
import { useAuthorization } from '@hooks';
import { Paginator } from '@ui/components';

const RolesPaginator = styled(Paginator)`
  margin-left: auto;
`;

const RolesTableComponent = styled((props: TableProps<MemberRole>) => Table<MemberRole>(props))`
  flex: 1;
  min-height: 96px;

  table {
    flex: 1;
  }

  input[type='checkbox'] {
    outline: 0;
  }
`;

const RoleName = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.31px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  ${Lozenge} {
    margin-left: 8px;
  }
`;

type Props = {
  isLoading: boolean;
  memberRoles: MemberRole[];

  onMenuClick: (action: string, role: MemberRole) => void;
  onRoleClick: (roleId: string) => void;

  paginator: {
    page: number;
    pageSize: PerPage;
    setPagination: ComponentProps<typeof Paginator>['onChange'];
    total: number;
  };
};

export const RolesTable: React.FC<Props> = ({ isLoading, memberRoles = [], onMenuClick, onRoleClick, paginator }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();

  const { page, pageSize, setPagination, total } = paginator;

  const getMenuItems = (role) => {
    const actions = [
      {
        label: intl.formatMessage({ id: 'common.settings.roles.actions_lbl.inviteAs' }),
        onClick: () => onMenuClick('INVITE_MEMBER_AS_THIS_ROLE', role),
      },
      {
        label: intl.formatMessage({ id: 'common.settings.roles.actions_lbl.createFrom' }),
        onClick: () => onMenuClick('DUPLICATE_FROM_THIS_ROLE', role),
      },
    ];
    if (!role.is_predefined && role.name !== PredefinedRoles.OWNER) {
      actions.push({
        label: intl.formatMessage({ id: 'common.settings.roles.actions_lbl.edit' }),
        onClick: () => onMenuClick('EDIT_ROLE', role),
      });
      actions.push({
        label: intl.formatMessage({ id: 'common.settings.roles.actions_lbl.delete' }),
        onClick: () => onMenuClick('DELETE_ROLE', role),
      });
    }
    return actions;
  };

  return (
    <RolesTableComponent
      rowKey="id"
      dataSource={memberRoles}
      loading={isLoading}
      columns={[
        {
          dataIndex: 'name',
          title: intl.formatMessage({ id: 'common.settings.roles.table_lbl.name' }),
          defaultSortOrder: 'ascend' as const,
          onCell: () => ({ 'data-test-id': 'NameCell' } as HTMLAttributes<HTMLElement>),
          sorter: true,
          render: (role) => {
            return (
              <RoleName>
                {getRoleDisplayName(role)} {role.is_predefined && <Lozenge color="neutral">System Role</Lozenge>}
              </RoleName>
            );
          },
        },
        {
          dataIndex: 'description',
          title: intl.formatMessage({ id: 'common.settings.roles.table_lbl.description' }),
          sorter: true,
          onCell: () => ({ 'data-test-id': 'DescriptionCell' } as HTMLAttributes<HTMLElement>),
        },
      ]}
      onRow={(role) => ({
        onClick: () => {
          onRoleClick(role.is_predefined ? role.name : `${role.id}`);
        },
        style: {
          cursor: 'pointer',
        },
      })}
      rowActions={(role) =>
        role.name === PredefinedRoles.OWNER || !isPermitted(['organization.roles.all'])
          ? []
          : [<OverflowMenu key="rolesTableOverflow" items={getMenuItems(role)} stopClickEventPropagation={true} />]
      }
      footer={
        <RolesPaginator
          current={page}
          total={total}
          pageSize={pageSize}
          onChange={setPagination}
          onItemsPerPageChange={setPagination}
        />
      }
      showScrollbars={true}
    />
  );
};
