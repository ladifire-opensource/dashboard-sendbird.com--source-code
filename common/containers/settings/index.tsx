import React, { useCallback, useEffect, FC } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Switch, Route, Redirect, matchPath, RouteComponentProps, useHistory } from 'react-router-dom';

import { Location } from 'history';

import { coreActions, deskActions } from '@actions';
import { OrganizationSettingMenu } from '@constants';
import { useUnsaved, useAuthorization } from '@hooks';
import { useOrganizationMenu } from '@hooks/useOrganizationMenu';
import { UnsavedPrompt } from '@ui/components';
import { isEmpty } from '@utils';

import { useCurrentChatSubscription } from '../CurrentChatSubscriptionProvider';
import SubscriptionPlanModal from '../FullScreenModals/SubscriptionPlanModal';
import SupportPlanModal from '../FullScreenModals/SupportPlanModal';
import { NoPlanError } from '../NoPlanError';
import { SettingsLayout, SettingsSidebarMenuItem } from '../layout/settingsLayout';
import { Support } from '../support';
import { ApplicationsSetting } from './applications';
import { Billing } from './billing';
import { FeatureFlags } from './featureFlags';
import { GeneralSetting } from './general';
import { Members } from './members';
import { Billing as NewBilling } from './newBilling';
import { Roles } from './roles';
import { Security } from './security';
import { Usage } from './usage';

const mapStateToProps = (state: RootState) => ({
  organization: state.organizations.current,
});

const mapDispatchToProps = {
  resetApplicationRequest: coreActions.resetApplicationRequest,
  resetDesk: deskActions.resetDesk,
};

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  RouteComponentProps<{}, { statusCode?: number }, { background: Location }>;

const NoPlanErrorWrapper: FC = () => (
  <div
    css={`
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
      min-height: 424px;
    `}
  >
    <NoPlanError
      css={`
        margin-bottom: 96px;
      `}
    />
  </div>
);

const SettingsConnectable: React.FC<Props> = ({ match, organization, resetApplicationRequest, resetDesk }) => {
  const intl = useIntl();
  const unsavedChecker = useUnsaved();
  const { isSelfService } = useAuthorization();
  const { isLoaded: isLoadedPlan, isFreeTrialMissing } = useCurrentChatSubscription();
  const history = useHistory<{ background: Location }>();

  const background = history.location.state?.background;

  useEffect(() => {
    resetApplicationRequest();
    resetDesk();
    if (window.dashboardSB) {
      window.dashboardSB.disconnect(() => {});
    }
  }, [resetApplicationRequest, resetDesk]);

  useEffect(() => {
    if (isEmpty(organization)) {
      history.push('/');
    }
  }, [history, organization]);

  const availableMenus = useOrganizationMenu(organization.uid);

  const availableRoutes: ReadonlyArray<{
    key: OrganizationSettingMenu;
    path: string;
    component?: React.ComponentType<any>;
    render?: (routeProps: RouteComponentProps) => React.ReactNode;
  }> = [
    {
      key: OrganizationSettingMenu.general,
      path: `${match.url}/general`,
      render: (routeProps) => <GeneralSetting setUnsaved={unsavedChecker.setUnsaved} {...routeProps} />,
    },
    ...(isSelfService
      ? [
          {
            key: OrganizationSettingMenu.usage,
            path: `${match.url}/usage`,
            component: Usage,
          },
        ]
      : []),
    {
      key: OrganizationSettingMenu.applications,
      path: `${match.url}/applications`,
      component: ApplicationsSetting,
    },
    {
      key: OrganizationSettingMenu.members,
      path: `${match.url}/members`,
      component: Members,
    },
    {
      key: OrganizationSettingMenu.roles,
      path: `${match.url}/roles`,
      component: Roles,
    },
    {
      key: OrganizationSettingMenu.billing,
      path: `${match.url}/billing`,
      component: isSelfService ? NewBilling : Billing,
    },
    {
      key: OrganizationSettingMenu.security,
      path: `${match.url}/security`,
      component: Security,
    },
    {
      key: OrganizationSettingMenu.contactUs,
      path: `${match.url}/contact_us`,
      component: Support,
    },
  ]
    .filter((route) => availableMenus.includes(route.key))
    .map((route) => {
      if (isFreeTrialMissing && route.key !== OrganizationSettingMenu.contactUs) {
        // If Free trial is unexpectedly missing, the user can only access "Contact us" menu.
        return { ...route, component: NoPlanErrorWrapper };
      }
      return route;
    })
    .concat({ key: 'ff' as any, path: `${match.url}/ff`, component: FeatureFlags });

  const menuItems = [
    {
      icon: 'general' as const,
      key: OrganizationSettingMenu.general,
      label: intl.formatMessage({ id: 'common.settings.label.general' }),
    },
    {
      icon: 'usage' as const,
      key: OrganizationSettingMenu.usage,
      label: intl.formatMessage({ id: 'common.settings.label.usage' }),
    },
    {
      icon: 'applications' as const,
      key: OrganizationSettingMenu.applications,
      label: intl.formatMessage({ id: 'common.settings.label.applications' }),
    },
    {
      icon: 'users' as const,
      key: OrganizationSettingMenu.members,
      label: intl.formatMessage({ id: 'common.settings.label.members' }),
    },
    {
      icon: 'permission' as const,
      key: OrganizationSettingMenu.roles,
      label: intl.formatMessage({ id: 'common.settings.label.roles' }),
    },
    {
      icon: 'billing' as const,
      key: OrganizationSettingMenu.billing,
      label: intl.formatMessage({ id: 'common.settings.label.billing' }),
    },
    {
      icon: 'security' as const,
      key: OrganizationSettingMenu.security,
      label: intl.formatMessage({ id: 'common.settings.label.security' }),
    },
    {
      icon: 'support' as const,
      key: OrganizationSettingMenu.contactUs,
      label: intl.formatMessage({ id: 'common.settings.label.contactUs' }),
    },
    {
      icon: 'filter' as const,
      key: 'ff' as any,
      label: 'Feature flags',
    },
  ];

  const onMenuItemClick = useCallback(
    (menu: SettingsSidebarMenuItem) => unsavedChecker.pushTo(`${match.url}/${menu.key}`),
    [match.url, unsavedChecker],
  );

  return (
    <SettingsLayout
      title={intl.formatMessage({ id: 'common.settings.title' })}
      menuItems={menuItems.filter((menu) => availableMenus.includes(menu.key))}
      onMenuItemClick={onMenuItemClick}
      activeMenuItem={menuItems.find(
        (item) => !!matchPath(history.location.pathname, { path: `${match.url}/${item.key}` }),
      )}
    >
      <UnsavedPrompt when={unsavedChecker.unsaved} />
      {!isSelfService || isLoadedPlan ? (
        <>
          <Switch location={background || history.location}>
            {availableRoutes.map((props) => (
              <Route {...props} key={`settingsRoute_${props.key}`} />
            ))}
            <Redirect to={availableRoutes.length > 0 ? availableRoutes[0].path : '/'} />
          </Switch>
          <Route path="/settings/general/plans/chat" exact={true} component={SubscriptionPlanModal} />
          <Route path="/settings/general/plans/support" exact={true} component={SupportPlanModal} />
        </>
      ) : null}
    </SettingsLayout>
  );
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsConnectable);

export default Settings;
