import { ComponentProps, useMemo } from 'react';
import { Redirect, Route } from 'react-router-dom';

import { AuthorizeRoute } from '@authorization';
import Calls from '@calls/containers';
import { Analytics } from '@chat/containers/analytics';
import { Announcements } from '@chat/containers/announcements';
import { GroupChannels, OpenChannels } from '@chat/containers/channels';
import { DataExport } from '@chat/containers/dataExport';
import { Messages } from '@chat/containers/messages';
import { Overview } from '@core/containers/overview';
import { ApplicationSettings } from '@core/containers/settings';
import { Users } from '@core/containers/users';
import { Desk } from '@desk/containers';
import { useAuthorization, useCallsActivationVisibility, useIsCallsEnabled, useIsDeskEnabled } from '@hooks';

import { UserDetail } from '../users/userDetail';

const authorizedRoutes: ComponentProps<typeof AuthorizeRoute>[] = [
  {
    path: 'overview',
    component: Overview,
    allowedPermissions: ['application.overview.view'],
  },
  {
    path: 'open_channels',
    component: OpenChannels,
    allowedPermissions: [
      'application.channels.openChannel.all',
      'application.channels.openChannel.chat',
      'application.channels.openChannel.view',
    ],
  },
  {
    path: 'group_channels',
    component: GroupChannels,
    allowedPermissions: [
      'application.channels.groupChannel.all',
      'application.channels.groupChannel.chat',
      'application.channels.groupChannel.view',
    ],
  },
  {
    path: 'messages',
    component: Messages,
    allowedPermissions: ['application.messageSearch.all', 'application.messageSearch.view'],
    premiumFeature: 'message_search',
  },
  {
    path: 'announcements',
    component: Announcements,
    allowedPermissions: ['application.announcements.all', 'application.announcements.view'],
    premiumFeature: 'announcement',
  },
  {
    path: 'users',
    exact: true,
    component: Users,
    allowedPermissions: ['application.users.all', 'application.users.view'],
  },
  {
    path: 'users/:userId',
    exact: true,
    component: UserDetail,
    allowedPermissions: ['application.users.all', 'application.users.view'],
  },
  {
    path: 'data_exports',
    component: DataExport,
    allowedPermissions: ['application.dataExport.all', 'application.dataExport.view'],
    premiumFeature: 'data_export',
  },
  {
    path: 'analytics',
    component: Analytics,
    allowedPermissions: ['application.analytics.view'],
    premiumFeature: 'advanced_analytics',
  },
  {
    path: 'settings',
    component: ApplicationSettings,
    allowedPermissions: ['application.settings.all', 'application.settings.view'],
  },
  {
    path: 'desk',
    component: Desk,
    allowedPermissions: ['desk.admin', 'desk.agent'],
  },
  {
    path: 'support',
    component: () => <Redirect to="/settings/contact_us" />,
    allowedPermissions: ['support.technical'],
  },
];

export const useAuthorizedRoutes = (matchURL: string) => {
  const { isPermitted } = useAuthorization();
  const isDeskEnabled = useIsDeskEnabled();
  const isCallActivationVisible = useCallsActivationVisibility();
  const isCallsRouteShouldBeRendered = useIsCallsEnabled() || isCallActivationVisible;

  return useMemo(() => {
    const authorizedRouteProps = authorizedRoutes.map((route) => ({ ...route, path: `${matchURL}/${route.path}` }));

    const fallbackRoute:
      | ComponentProps<typeof AuthorizeRoute>
      | undefined = authorizedRouteProps.filter(({ allowedPermissions }) => isPermitted(allowedPermissions || []))[0];
    const fallbackRoutePath = fallbackRoute ? String(fallbackRoute.path) : undefined;

    const routes = authorizedRouteProps.map((props) => {
      if (props.component === ApplicationSettings && isDeskEnabled) {
        /**
         * If desk feature is enabled, allow navigating to settings route regardless of permissions
         * because users have to access desk setting menus.
         */
        return <Route key={String(props.path)} path={props.path} component={props.component} />;
      }
      return <AuthorizeRoute key={String(props.path)} {...props} />;
    });

    if (isCallsRouteShouldBeRendered) {
      const callsPath = `${matchURL}/calls`;
      return {
        routes: [...routes, <Route key={callsPath} path={callsPath} component={Calls} />],
        fallbackRoutePath: fallbackRoutePath || callsPath,
      };
    }

    return { routes, fallbackRoutePath };
  }, [isCallsRouteShouldBeRendered, isDeskEnabled, isPermitted, matchURL]);
};
