import React, { useEffect, useCallback, useContext } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router-dom';

import styled from 'styled-components';

import { Button, cssVariables } from 'feather';
import startCase from 'lodash/startCase';

import { commonActions } from '@actions';
import { getRoleDisplayName } from '@authorization';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { PredefinedRoles } from '@constants';
import { useAuthorization, useApplicationRegionsSelector } from '@hooks';
import { SpinnerFull } from '@ui/components';

import { OrgSettingPageHeader } from '../OrgSettingPageHeader';
import { RolesContext, getPermissionPageName, getPermissionLevel } from './rolesReducer';

const Divider = styled.hr`
  border-width: 0;
  background-color: ${cssVariables('neutral-3')};
  height: 1px;
  margin-bottom: 24px;
`;

const PermissionsDetail = styled.div``;

const PermissionsDetailSection = styled.div`
  & + & {
    margin-top: 32px;
  }
`;

const SectionLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.15px;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
`;

const Description = styled.div`
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.1px;
`;

const DetailTable = styled.table`
  margin-top: 16px;
  border-collapse: collapse;
  min-width: 400px;
  thead {
    th {
      font-size: 14px;
      font-weight: 500;
      height: 20px;
      line-height: 20px;
      letter-spacing: -0.1px;
      color: ${cssVariables('neutral-10')};
      border-bottom: 1px solid ${cssVariables('neutral-9')};
      text-align: left;
      :nth-child(2) {
        width: 104px;
      }
    }
  }
  tbody {
    td {
      height: 28px;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: -0.1px;
      color: ${cssVariables('neutral-10')};
      :nth-child(2) {
        width: 104px;
      }
    }

    tr {
      :first-child {
        td {
          height: 32px;
          padding-top: 8px;
        }
      }
    }
  }
`;

const mapStateToProps = (state: RootState) => ({
  organization: state.organizations.current,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
};

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & RouteComponentProps<{ roleId: string }>;

const RolesDetailConnectable: React.FC<Props> = ({ match, history, organization, showDialogsRequest }) => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const {
    state: { isFetchingRole, currentRole },
    actions: { fetchMemberRoleRequest, fetchMemberRoleByNameRequest },
  } = useContext(RolesContext);
  const appRegions = useApplicationRegionsSelector(currentRole ? currentRole.application_access_controls_details : []);

  const { roleId } = match.params;

  useEffect(() => {
    if (roleId) {
      if (isNaN(parseInt(roleId, 10))) {
        fetchMemberRoleByNameRequest(roleId);
      } else {
        fetchMemberRoleRequest(roleId);
      }
    }
  }, [fetchMemberRoleByNameRequest, fetchMemberRoleRequest, roleId]);

  const handleInviteClick = useCallback(() => {
    showDialogsRequest({
      dialogTypes: DialogType.InviteMember,
      dialogProps: {
        uid: organization.uid,
        role: currentRole ?? undefined,
        onSuccess: () => {
          history.push('/settings/members');
        },
      },
    });
  }, [showDialogsRequest, organization, currentRole, history]);

  const handleDuplicateClick = () => {
    history.push(`/settings/roles/create`);
  };

  const handleEditClick = useCallback(() => {
    history.push(`/settings/roles/${roleId}/edit`);
  }, [history, roleId]);

  return (
    <>
      {isFetchingRole && <SpinnerFull transparent={true} />}
      <OrgSettingPageHeader>
        <OrgSettingPageHeader.BackButton href="/settings/roles" />
        <OrgSettingPageHeader.Title>{currentRole && getRoleDisplayName(currentRole)}</OrgSettingPageHeader.Title>
        {currentRole && currentRole.name !== PredefinedRoles.OWNER && (
          <OrgSettingPageHeader.Actions
            css={`
              > * + * {
                margin-left: 8px;
              }
            `}
          >
            <Button
              buttonType="tertiary"
              icon="users"
              size="small"
              disabled={!isPermitted(['organization.roles.all'])}
              onClick={handleInviteClick}
              data-test-id="InviteButton"
            >
              {intl.formatMessage({ id: 'common.settings.roles.actions_lbl.inviteAs' })}
            </Button>
            <Button
              buttonType="tertiary"
              icon="copy"
              size="small"
              onClick={handleDuplicateClick}
              disabled={!isPermitted(['organization.roles.all'])}
              data-test-id="DuplicateButton"
            >
              {intl.formatMessage({ id: 'common.settings.roles.actions_lbl.createFrom' })}
            </Button>
            {currentRole && !currentRole.is_predefined && (
              <Button
                buttonType="secondary"
                icon="edit"
                size="small"
                onClick={handleEditClick}
                disabled={!isPermitted(['organization.roles.all'])}
                data-test-id="EditButton"
              >
                {intl.formatMessage({ id: 'common.settings.roles.actions_lbl.edit' })}
              </Button>
            )}
          </OrgSettingPageHeader.Actions>
        )}
      </OrgSettingPageHeader>

      <Divider />

      {currentRole && (
        <PermissionsDetail>
          <PermissionsDetailSection>
            <SectionLabel>{intl.formatMessage({ id: 'common.settings.roles.detail_lbl.description' })}</SectionLabel>
            <Description>{currentRole.description}</Description>
          </PermissionsDetailSection>
          {currentRole.permissions.length > 0 && (
            <PermissionsDetailSection>
              <SectionLabel>{intl.formatMessage({ id: 'common.settings.roles.detail_lbl.permissions' })}</SectionLabel>
              <DetailTable>
                <thead>
                  <tr>
                    <th>{intl.formatMessage({ id: 'common.settings.roles.detail_lbl.menu' })}</th>
                    <th>{intl.formatMessage({ id: 'common.settings.roles.detail_lbl.level' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRole.permissions.map((permission) => {
                    const category = permission.split('.')[0];
                    const isLowerDepth = permission.includes('desk') || permission.includes('support');
                    return (
                      <tr key={`permissions_${permission}`}>
                        <td>
                          {startCase(category)} {`${isLowerDepth ? '' : `> ${getPermissionPageName(permission)}`}`}
                        </td>
                        <td>{startCase(getPermissionLevel(permission))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </DetailTable>
            </PermissionsDetailSection>
          )}
          {currentRole.is_application_access_control && (
            <PermissionsDetailSection>
              <SectionLabel>{intl.formatMessage({ id: 'common.settings.roles.form_title.aac' })}</SectionLabel>
              <DetailTable>
                <thead>
                  <tr>
                    <th>{intl.formatMessage({ id: 'common.settings.roles.detail_lbl.name' })}</th>
                    <th>{intl.formatMessage({ id: 'common.settings.roles.detail_lbl.region' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRole.application_access_controls_details.map(({ app_id, app_name }) => {
                    return (
                      <tr key={app_id}>
                        <td>{app_name}</td>
                        <td>{appRegions[app_id]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </DetailTable>
            </PermissionsDetailSection>
          )}
        </PermissionsDetail>
      )}
    </>
  );
};

export const RolesDetail = connect(mapStateToProps, mapDispatchToProps)(RolesDetailConnectable);
