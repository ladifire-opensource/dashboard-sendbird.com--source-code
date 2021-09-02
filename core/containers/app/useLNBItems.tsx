import { Key, useEffect, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import {
  createLeftNavigationBarItem,
  createLeftNavigationBarLabel,
  createLeftNavigationBarSubItem,
  LeftNavigationBarDivider,
  LeftNavigationBarItemInterface,
  LeftNavigationBarItemType,
  LeftNavigationBarLabelInterface,
  LeftNavigationBarMenuItem,
  Lozenge,
  LozengeVariant,
  IconName,
} from 'feather';
import isEmpty from 'lodash/isEmpty';
import upperFirst from 'lodash/upperFirst';

import { commonActions } from '@actions';
import { filterAccessibleMenusForOrganization } from '@authorization';
import { ChatFeatureName, Page, Product } from '@constants';
import {
  useAuthorization,
  useCallsActivationVisibility,
  useIsCallsEnabled,
  useIsCallsStudioEnabled,
  useIsDeskEnabled,
} from '@hooks';
import { useIsCallsActivatedOrganization } from '@hooks/useIsCallsActivatedOrganization';

const LabelSuffixContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-start;
  margin-left: 8px;
`;

export type LNBMenu =
  | Page.overview
  | Page.openChannels
  | Page.groupChannels
  | Page.announcements
  | 'messages'
  | Page.dataExports
  | Page.users
  | Page.analytics
  | Page.tickets
  | Page.conversation
  | Page.views
  | Page.assignmentLogs
  | Page.agents
  | Page.proactiveChat
  | Page.customers
  | Page.monitor
  | Page.reports
  | Page.deskDataExport
  | Page.settings
  | Page.directCalls
  | Page.callsActivation
  | Page.callsStudio
  | Page.groupCalls
  | Page.support;

type MenuGroup = {
  name: LeftNavigationBarLabelInterface;
  items: LeftNavigationBarMenuItem[];
};

const { BUILD_MODE } = process.env;

type MenuDefinition = {
  key: string;
  href: string;
  icon: IconName;
  id?: string;
  label?: string;
  labelIntlKey?: string;
  labelSuffix?: JSX.Element;
  subMenus?: SubMenuDefinition[];
  useReactRouterLink?: boolean;
};

type SubMenuDefinition = Omit<MenuDefinition, 'icon'> & { type: LeftNavigationBarItemType.SubItem };

const menuDefinitions: MenuDefinition[] = [
  {
    key: Page.overview,
    labelIntlKey: 'core.overview.title',
    icon: 'overview-filled' as const,
    href: '/overview',
    useReactRouterLink: true,
  },
  {
    key: Page.openChannels,
    label: 'Open channels',
    icon: 'open-channels-filled' as const,
    href: '/open_channels',
    useReactRouterLink: true,
  },
  {
    key: Page.groupChannels,
    label: 'Group channels',
    icon: 'group-channels-filled' as const,
    href: '/group_channels',
    useReactRouterLink: true,
  },
  {
    key: Page.announcements,
    label: 'Announcements',
    icon: 'announcements-filled' as const,
    href: '/announcements',
    useReactRouterLink: true,
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: 'messages-filled' as const,
    href: '/messages',
    useReactRouterLink: true,
  },
  {
    key: Page.users,
    labelIntlKey: 'core.users.header.title',
    icon: 'users-filled' as const,
    href: '/users',
    id: 'tourTargetUsers',
    useReactRouterLink: true,
  },
  {
    key: Page.dataExports,
    label: 'Data exports',
    icon: 'data-export-filled' as const,
    href: '/data_exports',
    useReactRouterLink: true,
  },
  {
    key: Page.analytics,
    label: 'Advanced analytics',
    icon: 'analytics-filled' as const,
    href: '/analytics',
    useReactRouterLink: true,
  },
  {
    key: Page.tickets,
    labelIntlKey: 'desk.tickets.header.title',
    icon: 'tickets-filled' as const,
    href: '/desk/tickets',
    useReactRouterLink: true,
    subMenus: [
      {
        type: LeftNavigationBarItemType.SubItem,
        key: Page.allTickets,
        labelIntlKey: 'desk.tickets.header.title.allTickets',
        href: '/desk/tickets',
        useReactRouterLink: true,
      },
      {
        type: LeftNavigationBarItemType.SubItem,
        key: Page.conversation,
        labelIntlKey: 'desk.tickets.header.title.conversation',
        href: '/desk/conversation',
        useReactRouterLink: true,
      },
    ],
  },
  {
    key: Page.views,
    labelIntlKey: 'desk.views.title',
    labelSuffix: (
      <LabelSuffixContainer>
        <Lozenge color="purple" variant={LozengeVariant.Light}>
          Beta
        </Lozenge>
      </LabelSuffixContainer>
    ),
    icon: 'ticket-views' as const,
    href: '/desk/views',
    useReactRouterLink: true,
  },
  {
    key: Page.agents,
    labelIntlKey: 'desk.agents.list.title',
    icon: 'agents-filled' as const,
    href: '/desk/agents',
    useReactRouterLink: true,
  },
  {
    key: Page.assignmentLogs,
    labelIntlKey: 'desk.assignmentLogs.header.lbl',
    icon: 'archive-filled' as const,
    href: '/desk/assignment_logs',
    useReactRouterLink: true,
  },
  {
    key: Page.proactiveChat,
    labelIntlKey: 'desk.proactiveChat.title',
    icon: 'proactive-chat-filled' as const,
    href: '/desk/proactive_chats',
    useReactRouterLink: true,
  },
  {
    key: Page.customers,
    labelIntlKey: 'desk.customers.title',
    icon: 'customers-filled' as const,
    href: '/desk/customers',
    useReactRouterLink: true,
  },
  {
    key: Page.monitor,
    labelIntlKey: 'desk.monitoring.title',
    icon: 'monitor-filled' as const,
    href: '/desk/monitoring',
    useReactRouterLink: true,
  },
  {
    key: Page.reports,
    labelIntlKey: 'desk.statistics.title.lnb',
    icon: 'reports-filled' as const,
    href: '/desk/reports',
    useReactRouterLink: true,
  },
  {
    key: Page.deskDataExport,
    labelIntlKey: 'desk.dataExport.title',
    icon: 'data-export-filled' as const,
    href: '/desk/data_exports',
    useReactRouterLink: true,
  },
  {
    key: Page.settings,
    labelIntlKey: 'core.settings.header.title',
    icon: 'settings-filled' as const,
    href: '/settings',
    useReactRouterLink: true,
  },
  {
    key: Page.callsActivation,
    icon: 'call-filled' as const,
    href: '/calls',
    useReactRouterLink: true,
  },
  {
    key: Page.callsStudio,
    labelIntlKey: 'calls.lnb.studio',
    icon: 'call-filled' as const,
    href: '/calls/studio',
    useReactRouterLink: true,
  },
  {
    key: Page.directCalls,
    labelIntlKey: 'calls.lnb.callLogs',
    icon: 'direct-call-filled' as const,
    href: '/calls/direct-calls',
    useReactRouterLink: true,
  },
  {
    key: Page.groupCalls,
    labelIntlKey: 'calls.lnb.groupCalls',
    icon: 'group-call-filled' as const,
    href: '/calls/group-calls',
    useReactRouterLink: true,
  },
];

const getMenus = (intl: ReturnType<typeof useIntl>) => {
  return menuDefinitions.map((item) => {
    const result = {
      ...item,
      subMenus: item.subMenus?.map((subMenu) =>
        typeof subMenu['labelIntlKey'] === 'string'
          ? { ...subMenu, label: intl.formatMessage({ id: subMenu.labelIntlKey }) }
          : { ...subMenu, label: subMenu.label ?? '' },
      ),
    };
    if (typeof result['labelIntlKey'] === 'string') {
      const { labelIntlKey, ...rest } = result;
      return {
        ...rest,
        label: intl.formatMessage({ id: labelIntlKey }),
      };
    }
    const { label, ...rest } = result;
    return { ...rest, label: label ?? '' };
  });
};

export const flattenMenuGroupsWithDivider = <T,>(
  acc: (T | typeof LeftNavigationBarDivider)[],
  cur: T[],
  index: number,
  array: T[][],
) => {
  if (isEmpty(cur)) {
    return acc;
  }
  acc.push(...cur);
  if (index < array.length - 1) {
    acc.push(LeftNavigationBarDivider);
  }
  return acc;
};

export const composeObjectByKeyProperty = <T extends { key: Key }>(acc, item: T) => {
  acc[item.key] = item;
  return acc;
};

export const getLNBItems = (options: {
  organizationUID: string;
  appID: string;
  isCallsEnabled: boolean;
  isCallsActivationVisible?: boolean;
  isCallsActivatedOrganization?: boolean;
  isCallsStudioVisible?: boolean;
  isAccessibleToCoreMenus: boolean;
  isAnnouncementsVisible: boolean;
  isDeskEnabled: boolean;
  isDataExportVisible: boolean;
  isAnalyticsVisible: boolean;
  isSettingsVisible: boolean;
  isSupportVisible: boolean;
  isMessagesVisible: boolean;
  intl: ReturnType<typeof useIntl>;
}) => {
  const {
    organizationUID,
    appID,
    isCallsEnabled,
    isCallsActivationVisible,
    isCallsActivatedOrganization,
    isCallsStudioVisible,
    isAccessibleToCoreMenus,
    isAnnouncementsVisible,
    isMessagesVisible,
    isDataExportVisible,
    isDeskEnabled,
    isAnalyticsVisible,
    isSettingsVisible,
    isSupportVisible,
    intl,
  } = options;

  const menus = getMenus(intl);
  const accessiblePagesByOrg = menus.map((v) => v.key).filter(filterAccessibleMenusForOrganization(organizationUID));
  const accessibleMenus = menus.filter((v) => accessiblePagesByOrg.includes(v.key));

  const lnbItems = accessibleMenus
    .map((item) => ({
      ...item,
      href: item.href && `/${appID}${item.href}`,
      subMenus: item.subMenus?.map((subMenu) =>
        createLeftNavigationBarSubItem({ ...subMenu, href: `/${appID}${subMenu.href}` }),
      ),
    }))
    .map((item) => createLeftNavigationBarItem(item))
    .reduce(composeObjectByKeyProperty, {} as Record<LNBMenu, LeftNavigationBarMenuItem>);

  const generalMenuGroup = (isAccessibleToCoreMenus ? [lnbItems.overview, lnbItems.users] : []).concat(
    isSettingsVisible ? lnbItems.settings : [],
  );

  const chatMenuGroup = {
    name: createLeftNavigationBarLabel({ key: Product.chat, label: upperFirst(Product.chat) }),
    items: isAccessibleToCoreMenus
      ? [lnbItems.open_channels, lnbItems.group_channels]
          .concat(isAnnouncementsVisible ? [lnbItems.announcements] : [])
          .concat(isMessagesVisible ? [lnbItems.messages] : [])
          .concat(isDataExportVisible ? [lnbItems.data_export] : [])
          .concat(isAnalyticsVisible ? [lnbItems.analytics] : [])
      : [],
  };

  const callsMenus = (() => {
    const menus = isCallsEnabled
      ? [isCallsStudioVisible && lnbItems.calls_studio, lnbItems.direct_calls, lnbItems.group_calls]
      : [
          isCallsActivationVisible && {
            ...lnbItems.calls_activation,
            label: intl.formatMessage({
              id: isCallsActivatedOrganization ? 'calls.lnb.activation.activated' : 'calls.lnb.activation.inactivated',
            }),
          },
        ];

    return menus.filter(Boolean) as LeftNavigationBarMenuItem[];
  })();

  const callsMenuGroup =
    callsMenus.length > 0
      ? {
          name: createLeftNavigationBarLabel({ key: Product.calls, label: upperFirst(Product.calls) }),
          items: callsMenus,
        }
      : null;

  const deskMenuGroup = isDeskEnabled
    ? {
        name: createLeftNavigationBarLabel({ key: Product.desk, label: upperFirst(Product.desk) }),
        items: [
          lnbItems.tickets,
          lnbItems.conversation,
          lnbItems.views,
          lnbItems.assignment_logs,
          lnbItems.proactive_chat,
          lnbItems.agents,
          lnbItems.customers,
          lnbItems.monitor,
          lnbItems.reports,
          lnbItems.desk_data_export,
        ],
      }
    : null;

  const supportMenuGroup = isSupportVisible ? [lnbItems.support] : [];

  const productGroups = [chatMenuGroup, callsMenuGroup, deskMenuGroup].filter(
    (group): group is MenuGroup => (group?.items.length ?? 0) > 0,
  );
  const shouldShowGroupName = productGroups.length > 1;

  const menuGroups = [generalMenuGroup]
    .concat(productGroups.map((group) => (shouldShowGroupName ? [group.name, ...group.items] : group.items)))
    .concat([supportMenuGroup])
    .map((group) => group.filter((menu) => menu != null))
    .filter((group) => group.length > 0);

  return menuGroups.reduce(flattenMenuGroupsWithDivider, [] as LeftNavigationBarItemInterface[]);
};

export const useLNBItems = () => {
  const intl = useIntl();
  const organizationUID = useSelector((state: RootState) => state.organizations.current.uid);
  const appID = useSelector((state: RootState) => state.applicationState.data?.app_id) || '';
  const dispatch = useDispatch();
  const { isFeatureEnabled, isAccessiblePage } = useAuthorization();
  const isCallsEnabled = useIsCallsEnabled();
  const isCallsActivatedOrganization = useIsCallsActivatedOrganization();
  const isCallsActivationVisible = useCallsActivationVisibility();
  const isCallsStudioVisible = useIsCallsStudioEnabled();

  const isAccessibleToCoreMenus = isAccessiblePage(Page.application);
  const isDeskEnabled = useIsDeskEnabled();
  const isSettingsVisible = isAccessiblePage(Page.settings) || isDeskEnabled;
  const isSupportVisible = isAccessiblePage(Page.support) || BUILD_MODE === 'local';
  const isAnnouncementsVisible = isFeatureEnabled(ChatFeatureName.Announcement);
  const isDataExportVisible = isFeatureEnabled(ChatFeatureName.DataExport);
  const isAnalyticsVisible = isFeatureEnabled(ChatFeatureName.AdvancedAnalytics);

  // TODO: we should deprecate below feature
  const isMessagesVisible = isFeatureEnabled('message_search') && isAccessiblePage(Page.messageSearch);

  const menuItems = useMemo(
    () =>
      getLNBItems({
        organizationUID,
        appID,
        isAccessibleToCoreMenus,
        isAnalyticsVisible,
        isAnnouncementsVisible,
        isMessagesVisible,
        isDataExportVisible,
        isDeskEnabled,
        isSettingsVisible,
        isSupportVisible,
        isCallsEnabled,
        isCallsActivatedOrganization,
        isCallsActivationVisible,
        isCallsStudioVisible,
        intl,
      }),
    [
      appID,
      intl,
      isAccessibleToCoreMenus,
      isAnalyticsVisible,
      isAnnouncementsVisible,
      isCallsActivatedOrganization,
      isCallsActivationVisible,
      isCallsEnabled,
      isCallsStudioVisible,
      isDataExportVisible,
      isDeskEnabled,
      isMessagesVisible,
      isSettingsVisible,
      isSupportVisible,
      organizationUID,
    ],
  );

  const activeMenu = Object.values(menuItems)
    .flatMap((item) =>
      (item as LeftNavigationBarItemInterface)?.subMenus?.length ?? 0 > 0
        ? (item as LeftNavigationBarItemInterface).subMenus
        : item,
    )
    .find((item) => {
      const settingURLRegex = /^\/[A-Z\d-]+\/(calls\/|desk\/)?settings/;
      const { key, href } = item as LeftNavigationBarItemInterface;
      if (key === Page.settings && location.pathname.match(settingURLRegex)) {
        return true;
      }
      return !!(href && location.pathname.startsWith(href.split('?')[0]));
    });

  useEffect(() => {
    dispatch(
      commonActions.setLNBMenuItems({
        items: menuItems,
      }),
    );
  }, [dispatch, menuItems]);

  useEffect(() => {
    dispatch(
      commonActions.setActiveLNBMenuItem({ activeItemKey: (activeMenu as LeftNavigationBarItemInterface)?.key }),
    );
  }, [activeMenu, dispatch]);

  return;
};
