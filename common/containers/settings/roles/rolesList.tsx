import React, { useEffect, useContext } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import { toast } from 'feather';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsHeader, SettingsLayoutContext } from '@common/containers/layout';
import { getErrorMessage } from '@epics';
import { usePagination, useAuthorization } from '@hooks';
import { logException } from '@utils/logException';

import { RolesContext } from './rolesReducer';
import { RolesTable } from './rolesTable';

const mapStateToProps = (state: RootState) => ({
  organization: state.organizations.current,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & RouteComponentProps;

const RolesListConnectable: React.FC<Props> = ({ match, history, organization, showDialogsRequest }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const {
    state: { isFetchingRoles, memberRoles, total },
    actions: { fetchMemberRolesRequest, deleteMemberRoleRequest, setCurrentRole },
  } = useContext(RolesContext);

  const settingsLayoutContext = useContext(SettingsLayoutContext);
  useEffect(() => {
    settingsLayoutContext.setBodyFitToWindow(true);
    return () => {
      settingsLayoutContext.setBodyFitToWindow(false);
    };
  }, [settingsLayoutContext]);

  const pagination = usePagination(1, 20);
  const { page, pageSize, setPagination } = pagination;

  useEffect(() => {
    try {
      setCurrentRole(null);
      fetchMemberRolesRequest({
        uid: organization.uid,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
    } catch (error) {
      logException(error);
    }
  }, [fetchMemberRolesRequest, organization, page, pageSize, setCurrentRole]);

  const handleActionClick = () => {
    history.push(`${match.url}/create`);
  };

  const handleRoleClick = (roleId) => {
    history.push(`${match.url}/${roleId}`);
  };

  const handleMenuItemClick = (action: string, role: MemberRole) => {
    switch (action) {
      case 'DELETE_ROLE':
        showDialogsRequest({
          dialogTypes: DialogType.Delete,
          dialogProps: {
            title: intl.formatMessage({ id: 'common.settings.roles.list_title.delete' }, { role: role.name }),
            description: intl.formatMessage({ id: 'common.settings.roles.list_desc.delete' }),
            onDelete: async () => {
              try {
                await deleteMemberRoleRequest({
                  roleId: role.id,
                });
                toast.success({
                  message: intl.formatMessage({ id: 'common.settings.roles.list_toastMessage.delete' }),
                });
                fetchMemberRolesRequest({
                  uid: organization.uid,
                  limit: pageSize,
                  offset: (page - 1) * pageSize,
                });
              } catch (error) {
                toast.error({
                  message: getErrorMessage(error),
                });
              }
            },
          },
        });
        return;
      case 'EDIT_ROLE':
        setCurrentRole(null);
        history.push(`${match.url}/${role.id}/edit`);
        return;
      case 'INVITE_MEMBER_AS_THIS_ROLE':
        showDialogsRequest({
          dialogTypes: DialogType.InviteMember,
          dialogProps: {
            uid: organization.uid,
            role,
            onSuccess: () => {
              history.push('/settings/members');
            },
          },
        });
        return;
      case 'DUPLICATE_FROM_THIS_ROLE':
        setCurrentRole(role);
        history.push(`${match.url}/create`);
        return;
      default:
        return;
    }
  };

  return (
    <>
      <SettingsHeader
        title={intl.formatMessage({ id: 'common.settings.label.roles' })}
        actions={
          isPermitted(['organization.roles.all'])
            ? [
                {
                  key: 'create-roles',
                  label: intl.formatMessage({ id: 'common.settings.roles_lbl.createButton' }),
                  icon: 'plus',
                  buttonType: 'primary',
                },
              ]
            : []
        }
        tabs={[]}
        onActionPress={handleActionClick}
      />
      <RolesTable
        isLoading={isFetchingRoles}
        memberRoles={memberRoles}
        onMenuClick={handleMenuItemClick}
        onRoleClick={handleRoleClick}
        paginator={{
          page,
          pageSize,
          setPagination,
          total,
        }}
      />
    </>
  );
};

export const RolesList = connect(mapStateToProps, mapDispatchToProps)(RolesListConnectable);
