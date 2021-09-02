import React, { FC, useState, useMemo, useEffect, useContext, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useRouteMatch } from 'react-router-dom';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Button,
  useForm,
  useField,
  InputText,
  Checkbox,
  Table,
  TableProps,
  Dropdown,
  IconButton,
  Body,
  toast,
  DropdownProps,
} from 'feather';
import startCase from 'lodash/startCase';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsCardFooter, SettingsGridCard, SettingsGridGroup } from '@common/containers/layout';
import { SpinnerFull, PageHeader } from '@ui/components';

import { RolesContext } from './rolesReducer';

enum AACAction {
  ALL = 'ALL',
  LIMITED = 'LIMITED',
}

type AACActionItem = {
  action: AACAction;
  label: string;
};

type FormFields = { name: string; description: string };

const PermissionsTable = styled((props: TableProps<PermissionTableProps>) => Table<PermissionTableProps>(props))`
  tbody {
    border-top: 1px solid transparent;
  }
  tbody td {
    height: 48px;
  }
`;

const PermissionsWrapper = styled.div`
  ${PermissionsTable} + ${PermissionsTable} {
    margin-top: 32px;
  }
`;

const AACApps = styled.div`
  margin-top: 28px;
`;

const AACAppsSelectedList = styled.ul<{ isEmpty: boolean }>`
  border-radius: 4px;
  margin-bottom: 8px;
  ${({ isEmpty }) =>
    isEmpty &&
    css`
      display: flex;
      align-items: center;
      justify-content: center;
      height: 40px;
      border: 1px solid ${cssVariables('neutral-3')};
      background-color: white;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: -0.1px;
      color: ${cssVariables('neutral-6')};
    `}
`;

const AACAppsSelectedItem = styled.li`
  background: ${cssVariables('neutral-2')};
  height: 40px;
  display: flex;
  align-items: center;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']}
  padding: 0 8px 0 16px;
  button {
    margin-left: auto;
  }
  & + & {
    margin-top: 8px;
  }
`;

export const RolesForm: FC = () => {
  const {
    state: {
      isFetchingForm,
      isFetchingRole,
      isFetchingPermissions,
      currentRole,
      availablePermissions: availablePermissionsOrNull,
    },
    actions: {
      fetchMemberRoleRequest,
      createMemberRoleRequest,
      editMemberRoleRequest,
      fetchPermissionsRequest,
      getPermissionLevel,
    },
  } = useContext(RolesContext);

  const organization = useSelector<RootState, Organization>((state) => state.organizations.current);
  const dispatch = useDispatch();
  const match = useRouteMatch<{ roleId: string }>();
  const history = useHistory();

  const { roleId } = match?.params || {};

  const intl = useIntl();
  const [isEditMode] = useState(!!roleId);
  const [aacMode, setAACMode] = useState(AACAction.ALL);
  const [selectedApplications, setSelectedApplications] = useState<ApplicationSummary[]>([]);

  const [permissionKeys, setPermissionKeys] = useState<readonly PermissionKey[]>([]);

  useEffect(() => {
    if (roleId) {
      fetchMemberRoleRequest(roleId);
    }
    fetchPermissionsRequest(organization.uid);
  }, [fetchMemberRoleRequest, fetchPermissionsRequest, organization.uid, roleId]);

  /**
   * Handle create role from this role case
   * Action handle in list component set currentRole
   */
  useEffect(() => {
    if (currentRole) {
      setPermissionKeys(currentRole.permissions);
      if (currentRole.is_application_access_control) {
        setAACMode(AACAction.LIMITED);
      }
      setSelectedApplications(currentRole.application_access_controls_details);
    }
  }, [currentRole]);

  const getHigherLevels = useCallback(
    (currentPermission: Permission, levelMapper: string[]) => {
      const currentPermissionLevel = getPermissionLevel(currentPermission.key);
      return levelMapper.map<PermissionKey>(
        (higherLevel) => currentPermission.key.replace(currentPermissionLevel, higherLevel) as PermissionKey,
      );
    },
    [getPermissionLevel],
  );

  const filterLowerLevelPermissions = useCallback(
    (permissionKey: PermissionKey) => {
      const permissionWithoutLevel = permissionKey.replace(`.${getPermissionLevel(permissionKey)}`, '');
      const lowerLevels = ['agent', 'chat', 'view'].map((level) => `${permissionWithoutLevel}.${level}`);
      return permissionKeys.filter((key) => !lowerLevels.includes(key));
    },
    [getPermissionLevel, permissionKeys],
  );

  const updatePermissionKeys = useCallback(
    (permissionKey: PermissionKey, isAdd: boolean) => {
      setPermissionKeys(
        isAdd
          ? [...filterLowerLevelPermissions(permissionKey), permissionKey]
          : permissionKeys.filter((key) => key !== permissionKey),
      );
    },
    [permissionKeys, filterLowerLevelPermissions],
  );

  const handleCheckboxChangeFactory = useCallback(
    ({ key }: Permission) => {
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        updatePermissionKeys(key, e.target.checked);
      };
    },
    [updatePermissionKeys],
  );

  const isHigherLevelChecked = useCallback(
    (higherLevels: PermissionKey[]) => higherLevels.some((key) => permissionKeys.includes(key)),
    [permissionKeys],
  );

  const rolesDetailForm = useForm({
    onSubmit: async (data: FormFields) => {
      if (permissionKeys.length === 0) {
        toast.warning({
          message: intl.formatMessage({ id: 'common.settings.roles.form_toastMessage.atleastOnePermission' }),
        });
        return false;
      }

      if (aacMode === AACAction.LIMITED && selectedApplications.length === 0) {
        toast.warning({
          message: intl.formatMessage({ id: 'common.settings.roles.form_toastMessage.atleastOneApplication' }),
        });
        return false;
      }

      const editingRoleId = isEditMode && currentRole ? currentRole.id : null;

      const payload = {
        ...data,
        uid: organization.uid,
        permissions: permissionKeys as string[],
        is_application_access_control: aacMode === AACAction.LIMITED,
        app_ids: selectedApplications.map((application) => application.app_id),
      };

      const request = (onSuccess) =>
        editingRoleId
          ? editMemberRoleRequest({ roleId: editingRoleId, payload }, onSuccess)
          : createMemberRoleRequest(payload, onSuccess);

      await request(() => {
        toast.success({
          message: intl.formatMessage(
            {
              id: 'common.settings.roles.form_toastMessage.success',
            },
            { state: editingRoleId ? 'updated' : 'created' },
          ),
        });
        history.push(editingRoleId ? `/settings/roles/${editingRoleId}` : '/settings/roles');
      });
    },
  });

  const nameField = useField<string>('name', rolesDetailForm, {
    defaultValue: (currentRole && currentRole.name) || '',
    placeholder: '',
    validate: (value) => {
      if (value.trim().length === 0) {
        return intl.formatMessage({ id: 'common.settings.general.app.error_required' });
      }
      return '';
    },
  });

  const renderNameField = useMemo(() => {
    return (
      <SettingsGridCard title={intl.formatMessage({ id: 'common.settings.roles.form_lbl.name' })}>
        <InputText
          ref={nameField.ref}
          name={nameField.name}
          error={nameField.error}
          onChange={nameField.onChange}
          data-test-id="NameField"
        />
      </SettingsGridCard>
    );
  }, [intl, nameField]);

  const descriptionField = useField<string>('description', rolesDetailForm, {
    defaultValue: (currentRole && currentRole.description) || '',
    placeholder: '',
  });

  const renderDescriptionField = useMemo(() => {
    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'common.settings.roles.form_lbl.description' })}
        description={intl.formatMessage({ id: 'common.settings.roles.form_desc.description' })}
      >
        <InputText
          ref={descriptionField.ref}
          name={descriptionField.name}
          error={descriptionField.error}
          onChange={descriptionField.onChange}
          placeholder={intl.formatMessage({ id: 'common.settings.roles.form_ph.description' })}
          data-test-id="DescriptionField"
        />
      </SettingsGridCard>
    );
  }, [intl, descriptionField]);

  const renderPermissions = useMemo(() => {
    const descriptionDetail = (
      <>
        <br />
        <br />
        <b>All</b>: This role can access to all features in a menu.
        <br />
        <b>Chat</b>: This role can only access to chat-related features in a menu.
        <br />
        <b>View</b>: This role can only view.
      </>
    );
    const availablePermissions = availablePermissionsOrNull ?? [];
    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'common.settings.roles.form_lbl.permissions' })}
        description={
          <FormattedMessage
            id="common.settings.roles.form_desc.permissions"
            values={{
              detail: descriptionDetail,
            }}
          />
        }
        gridItemConfig={{ subject: { alignSelf: 'start' } }}
      >
        <PermissionsWrapper>
          {Object.keys(availablePermissions).map((category) => {
            const dataSource = Object.entries<Permission[]>(availablePermissions[category].pages).map(
              ([page, permissions]) => {
                return {
                  page,
                  permissions,
                } as PermissionTableProps;
              },
            );
            return (
              <PermissionsTable
                key={`permissions_table_${category}`}
                rowKey="page"
                dataSource={dataSource}
                columns={[
                  {
                    dataIndex: 'page',
                    title: startCase(category),
                    sorter: false,
                    render: ({ page }) => (page === 'Contact' ? '' : page),
                  },
                  {
                    dataIndex: 'permissions',
                    title: startCase(availablePermissions[category].levels[0]),
                    sorter: false,
                    render: ({ permissions }) => {
                      const currentPermission = permissions.find(
                        ({ key }) => key.includes('all') || key.includes('tech') || key.includes('admin'),
                      );
                      return (
                        currentPermission && (
                          <Checkbox
                            checked={permissionKeys.includes(currentPermission.key)}
                            onChange={handleCheckboxChangeFactory(currentPermission)}
                            value={currentPermission.key}
                          />
                        )
                      );
                    },
                    width: 56,
                  },
                  {
                    dataIndex: 'permissions',
                    key: 'levels2',
                    title:
                      availablePermissions[category].levels.length > 2
                        ? startCase(availablePermissions[category].levels[1])
                        : '',
                    sorter: false,
                    render: ({ permissions }) => {
                      const currentPermission = permissions.find(({ key }) => key.includes('chat'));
                      if (currentPermission) {
                        const higherLevels = getHigherLevels(currentPermission, ['all']);
                        return (
                          <Checkbox
                            onChange={handleCheckboxChangeFactory(currentPermission)}
                            checked={
                              permissionKeys.includes(currentPermission.key) || isHigherLevelChecked(higherLevels)
                            }
                            disabled={isHigherLevelChecked(higherLevels)}
                            value={currentPermission.key}
                          />
                        );
                      }
                      return '';
                    },
                    width: 56,
                  },
                  {
                    dataIndex: 'permissions',
                    key: 'levels3',
                    title:
                      availablePermissions[category].levels.length > 1
                        ? startCase(
                            availablePermissions[category].levels[availablePermissions[category].levels.length - 1],
                          )
                        : '',
                    sorter: false,
                    render: ({ permissions }: { permissions: Permission[] }) => {
                      const currentPermission = permissions.find(
                        ({ key }) => key.includes('view') || key.includes('agent'),
                      );
                      if (currentPermission) {
                        const higherLevels = getHigherLevels(currentPermission, ['all', 'chat', 'admin']);
                        return (
                          <Checkbox
                            onChange={handleCheckboxChangeFactory(currentPermission)}
                            checked={
                              permissionKeys.includes(currentPermission.key) || isHigherLevelChecked(higherLevels)
                            }
                            disabled={isHigherLevelChecked(higherLevels)}
                            value={currentPermission.key}
                          />
                        );
                      }
                      return '';
                    },
                    width: 56,
                  },
                ]}
                rowStyles={() => css`
                  border-top: 1px solid ${cssVariables('neutral-3')};
                  :hover {
                    background: white;
                    border-top: 1px solid ${cssVariables('neutral-3')};
                    & + tr {
                      border-top: 1px solid ${cssVariables('neutral-3')};
                    }
                  }
                `}
              />
            );
          })}
        </PermissionsWrapper>
      </SettingsGridCard>
    );
  }, [
    intl,
    availablePermissionsOrNull,
    permissionKeys,
    handleCheckboxChangeFactory,
    getHigherLevels,
    isHigherLevelChecked,
  ]);

  const renderAAC = useMemo(() => {
    const handleItemSelected: DropdownProps<AACActionItem>['onChange'] = (item) => {
      if (item == null) {
        return;
      }
      setAACMode(item.action);
    };

    const handleSelectApplicationsClick = () => {
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.SelectApplicationsToAccess,
          dialogProps: {
            organization,
            selectedApplications,
            onSubmit: (apps) => {
              setSelectedApplications(apps);
            },
          },
        }),
      );
    };

    const handleRemoveSelectedApplicationClick = (app) => () => {
      setSelectedApplications((prevState) => prevState.filter((selectedApp) => selectedApp.app_id !== app.app_id));
    };

    const aacItems: AACActionItem[] = [
      {
        action: AACAction.ALL,
        label: intl.formatMessage({ id: 'common.settings.roles.form_lbl.aacSelectDropdownAll' }),
      },
      {
        action: AACAction.LIMITED,
        label: intl.formatMessage({ id: 'common.settings.roles.form_lbl.aacSelectDropdownLimited' }),
      },
    ];

    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'common.settings.roles.form_title.aac' })}
        description={intl.formatMessage({ id: 'common.settings.roles.form_desc.aac' })}
        gridItemConfig={{ subject: { alignSelf: 'start' } }}
      >
        <Dropdown<AACActionItem>
          width="100%"
          items={aacItems}
          selectedItem={aacItems.find((aacItem) => aacItem.action === aacMode)}
          itemToString={(item) => item.label}
          onChange={handleItemSelected}
        />
        {aacMode === AACAction.LIMITED && (
          <AACApps>
            <AACAppsSelectedList isEmpty={selectedApplications.length === 0}>
              {selectedApplications.length === 0
                ? intl.formatMessage({ id: 'common.settings.roles.form_ph.noAAC' })
                : selectedApplications.map((app) => (
                    <AACAppsSelectedItem key={app.app_id}>
                      {app.app_name}
                      <IconButton
                        type="button"
                        buttonType="tertiary"
                        icon="remove"
                        size="small"
                        onClick={handleRemoveSelectedApplicationClick(app)}
                      />
                    </AACAppsSelectedItem>
                  ))}
            </AACAppsSelectedList>
            <Button
              type="button"
              buttonType="primary"
              variant="ghost"
              onClick={handleSelectApplicationsClick}
              icon="plus"
              data-test-id="AddApplicationButton"
            >
              {intl.formatMessage({ id: 'common.settings.roles.form_lbl.aacSelectButton' })}
            </Button>
          </AACApps>
        )}
      </SettingsGridCard>
    );
  }, [intl, dispatch, organization, aacMode, selectedApplications]);

  const handleCancelClick = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <>
      <PageHeader
        css={`
          & + * {
            margin-top: 24px;
          }
        `}
      >
        <PageHeader.BackButton href={`../${roleId}`} /> {/* /settings/roles/:id/edit → /settings/roles/:id */}
        <PageHeader.Title>
          {isEditMode
            ? intl.formatMessage({ id: 'common.settings.roles.form_title.edit' })
            : intl.formatMessage({ id: 'common.settings.roles.form_title.create' })}
        </PageHeader.Title>
      </PageHeader>

      <form onSubmit={rolesDetailForm.onSubmit}>
        {isFetchingRole && <SpinnerFull transparent={true} />}
        <SettingsGridGroup>
          {renderNameField}
          {renderDescriptionField}
          {renderPermissions}
          {renderAAC}
        </SettingsGridGroup>
        <SettingsCardFooter isVisible={true} theme="transparent">
          <Button type="button" key="cancel" buttonType="tertiary" onClick={handleCancelClick}>
            Cancel
          </Button>
          <Button
            type="submit"
            key="save"
            buttonType="primary"
            isLoading={isFetchingForm}
            disabled={isFetchingForm || isFetchingPermissions}
            data-test-id="SubmitButton"
          >
            Save
          </Button>
        </SettingsCardFooter>
      </form>
    </>
  );
};
