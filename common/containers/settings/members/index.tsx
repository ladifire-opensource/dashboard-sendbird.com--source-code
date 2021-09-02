import { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAuthorization, useTypedSelector, useShowDialog } from '@hooks';
import { useOrganizationInvitations } from '@hooks/useOrganizationInvitations';

import { SettingsHeader, SettingsHeaderAction, SettingsLayoutContext } from '../../layout/settingsLayout';
import { CurrentMembersTab } from './currentMembersTab';
import { InvitationsTab } from './invitationsTab';

enum TabKey {
  active = 'active',
  invited = 'invited',
}

type Tab = { key: TabKey; label: string };

export const Members = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showDialog = useShowDialog();
  const uid = useTypedSelector((state) => state.organizations.current.uid);
  const { isPermitted } = useAuthorization();
  const invitationsProps = useOrganizationInvitations();

  const settingsLayoutContext = useContext(SettingsLayoutContext);

  useEffect(() => {
    settingsLayoutContext.setBodyFitToWindow(true);
    return () => {
      settingsLayoutContext.setBodyFitToWindow(false);
    };
  }, [settingsLayoutContext]);

  const tabs: ReadonlyArray<Tab> = useMemo(
    () => [
      { key: TabKey.active, label: intl.formatMessage({ id: 'common.settings.members.tab.active' }) },
      { key: TabKey.invited, label: intl.formatMessage({ id: 'common.settings.members.tab.invited' }) },
    ],
    [intl],
  );

  const headerActions: ReadonlyArray<SettingsHeaderAction> = [
    {
      key: 'export',
      label: intl.formatMessage({ id: 'common.settings.members.button.export' }),
      icon: 'export',
      buttonType: 'secondary',
    },
    {
      key: 'invite-member',
      label: intl.formatMessage({ id: 'common.settings.members.button.invite' }),
      icon: 'plus',
      buttonType: 'primary',
    },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]);

  const handleTabPress = useCallback(
    (tab: Tab) => {
      setActiveTab(tab);
    },
    [setActiveTab],
  );

  const handleHeaderActionPress = useCallback(
    (action) => {
      const [exportAction] = headerActions;
      if (action === exportAction) {
        return dispatch(commonActions.exportOrganizationMembersRequest());
      }

      showDialog({
        dialogTypes: DialogType.InviteMember,
        dialogProps: {
          uid,
          onSuccess: () => {
            const { load } = invitationsProps;
            load();
            setActiveTab({
              key: TabKey.invited,
              label: intl.formatMessage({ id: 'common.settings.members.tab.invited' }),
            });
          },
        },
      });
    },
    [intl, headerActions, invitationsProps, dispatch, uid, showDialog],
  );

  return (
    <>
      <SettingsHeader
        title={intl.formatMessage({ id: 'label.members' })}
        actions={isPermitted(['organization.members.all']) ? headerActions : undefined}
        tabs={isPermitted(['organization.members.all']) ? tabs : undefined}
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onActionPress={handleHeaderActionPress}
      />
      {activeTab.key === TabKey.active && <CurrentMembersTab />}
      {activeTab.key === TabKey.invited && <InvitationsTab {...invitationsProps} />}
    </>
  );
};
