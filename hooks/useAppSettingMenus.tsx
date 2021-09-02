import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { css } from 'styled-components';

import { SideMenuItemBase, Lozenge, LozengeVariant } from 'feather';

import { Page, PredefinedRoles } from '@constants';
import { INTEGRATION_SETTING_ALLOWED_LIST } from '@constants/uids';

import { useAppId } from './useAppId';
import { useAuthorization } from './useAuthorization';
import { useIsCallsEnabled } from './useIsCallsEnabled';
import { useIsDeskEnabled } from './useIsDeskEnabled';
import { useIsProfanityFilterAvailable } from './useIsProfanityFilterAvailable';

export enum AppSettingMenuKey {
  General = 'general',
  Notifications = 'notifications',
  Features = 'features',
  Message = 'message',
  Channels = 'channels',
  ProfanityFilter = 'profanity_filter',
  Security = 'security',
  Webhooks = 'webhooks',
  DeskGeneral = 'desk_general',
  DeskAutomation = 'desk_automation',
  DeskTriggers = 'desk_triggers',
  DeskBots = 'desk_bots',
  DeskSystemMessage = 'desk_system_messages',
  DeskQuickReplies = 'quick_replies',
  DeskTicketRules = 'ticket_rules', // expandable title
  DeskAssignmentRules = 'assignment_rules',
  DeskPriorityRules = 'priority_rules',
  DeskTags = 'desk_tags',
  DeskTeams = 'desk_teams',
  DeskCustomerFields = 'desk_customer_fields',
  DeskTicketFields = 'desk_ticket_fields',
  DeskSecurity = 'desk_security',
  DeskCredentials = 'desk_credentials',
  DeskWebhooks = 'desk_webhooks',
  DeskIntegration = 'desk_integration',
  CallsGeneral = 'calls_general',
  CallsNotifications = 'calls_notifications',
  CallsWebhooks = 'calls_webhooks',
}

export interface SettingMenu extends Omit<SideMenuItemBase, 'type'> {
  parentKey?: string;
  key: AppSettingMenuKey;
}

const useCallsSettingMenus = () => {
  const intl = useIntl();
  const isCallsEnabled = useIsCallsEnabled();
  const { isPermitted } = useAuthorization();
  const appId = useAppId();
  const isAccessibleToSettings = isPermitted(['application.settings.all']);

  return useMemo(() => {
    if (!isCallsEnabled || !isAccessibleToSettings) return [];

    return [
      {
        key: AppSettingMenuKey.CallsGeneral,
        label: intl.formatMessage({ id: 'calls.settings.application.tab.general' }),
        href: `/${appId}/calls/settings/general`,
      },
      {
        key: AppSettingMenuKey.CallsNotifications,
        label: intl.formatMessage({ id: 'calls.settings.application.tab.notifications' }),
        href: `/${appId}/calls/settings/notifications`,
      },
      {
        key: AppSettingMenuKey.CallsWebhooks,
        label: intl.formatMessage({ id: 'calls.settings.application.tab.webhooks' }),
        href: `/${appId}/calls/settings/webhooks`,
      },
    ].filter(Boolean) as SettingMenu[];
  }, [intl, isCallsEnabled, appId, isAccessibleToSettings]);
};

export const useAppSettingMenus = () => {
  const intl = useIntl();
  const location = useLocation();
  const organizationUID = useSelector((state: RootState) => state.organizations.current.uid);
  const appID = useAppId();

  const { isAccessiblePage, isSelfService, role } = useAuthorization();
  const isLocalBuild = process.env.BUILD_MODE === 'local';
  const isAccessibleToDeskSettings = useIsDeskEnabled();
  const isAccessibleToCoreSettings = isAccessiblePage(Page.settings) || isLocalBuild;
  const isProfanityFilterAvailable = useIsProfanityFilterAvailable();
  const isOwner = role?.name === PredefinedRoles.OWNER;

  const { applicationMenus, chatMenus, deskMenus } = useMemo(() => {
    const applicationMenus: SettingMenu[] = isAccessibleToCoreSettings
      ? [
          {
            key: AppSettingMenuKey.General,
            label: intl.formatMessage({ id: 'core.settings.application.tab.general' }),
            href: `/${appID}/settings/general`,
          },
          {
            key: AppSettingMenuKey.Security,
            label: intl.formatMessage({ id: 'core.settings.application.tab.security' }),
            href: `/${appID}/settings/security`,
          },
        ]
      : [];

    const chatMenus: SettingMenu[] = isAccessibleToCoreSettings
      ? [
          ...(isSelfService
            ? [
                {
                  key: AppSettingMenuKey.Features,
                  label: intl.formatMessage({ id: 'core.settings.application.tab.features' }),
                  href: `/${appID}/settings/features`,
                },
              ]
            : []),
          {
            key: AppSettingMenuKey.Message,
            label: intl.formatMessage({ id: 'chat.settings.messages.title' }),
            href: `/${appID}/settings/message`,
          },
          {
            key: AppSettingMenuKey.Channels,
            label: intl.formatMessage({ id: 'chat.settings.channels.title' }),
            href: `/${appID}/settings/channels`,
          },
          ...(isProfanityFilterAvailable
            ? [
                {
                  key: AppSettingMenuKey.ProfanityFilter,
                  label: intl.formatMessage({ id: 'chat.settings.profanityFilter.title' }),
                  href: `/${appID}/settings/profanity-filter`,
                },
              ]
            : []),
          {
            key: AppSettingMenuKey.Notifications,
            label: intl.formatMessage({ id: 'core.settings.application.tab.notification' }),
            href: `/${appID}/settings/notifications`,
          },
          {
            key: AppSettingMenuKey.Webhooks,
            label: intl.formatMessage({ id: 'core.settings.application.tab.webhooks' }),
            href: `/${appID}/settings/webhooks`,
          },
        ]
      : [];

    const deskMenus: SettingMenu[] = isAccessibleToDeskSettings
      ? [
          {
            key: AppSettingMenuKey.DeskGeneral,
            label: intl.formatMessage({ id: 'desk.settings.general.title' }),
            href: `/${appID}/desk/settings/general`,
          },
          {
            key: AppSettingMenuKey.DeskAutomation,
            label: intl.formatMessage({ id: 'desk.settings.automation.title' }),
            href: `/${appID}/desk/settings/automation`,
          },
          {
            key: AppSettingMenuKey.DeskTriggers,
            label: intl.formatMessage({ id: 'desk.settings.triggers.title' }),
            href: `/${appID}/desk/settings/triggers`,
          },
          {
            key: AppSettingMenuKey.DeskBots,
            label: intl.formatMessage({ id: 'desk.settings.bots.title' }),
            href: `/${appID}/desk/settings/bots`,
            labelSuffixNode: (
              <Lozenge
                color="purple"
                variant={LozengeVariant.Light}
                css={css`
                  margin-left: 4px;
                `}
              >
                NEW
              </Lozenge>
            ),
          },
          {
            key: AppSettingMenuKey.DeskSystemMessage,
            label: intl.formatMessage({ id: 'desk.settings.systemMessages.title' }),
            href: `/${appID}/desk/settings/system_messages`,
          },
          {
            key: AppSettingMenuKey.DeskTicketRules,
            label: intl.formatMessage({ id: 'desk.settings.ticketRules.title' }),
          },
          {
            parentKey: AppSettingMenuKey.DeskTicketRules,
            key: AppSettingMenuKey.DeskAssignmentRules,
            label: intl.formatMessage({ id: 'desk.settings.assignmentRules.title' }),
            href: `/${appID}/desk/settings/assignment_rules`,
          },
          {
            parentKey: AppSettingMenuKey.DeskTicketRules,
            key: AppSettingMenuKey.DeskPriorityRules,
            label: intl.formatMessage({ id: 'desk.settings.priorityRules.title' }),
            href: `/${appID}/desk/settings/priority_rules`,
          },
          {
            key: AppSettingMenuKey.DeskQuickReplies,
            label: intl.formatMessage({ id: 'desk.settings.quickReplies.title' }),
            href: `/${appID}/desk/settings/quick-replies`,
          },
          {
            key: AppSettingMenuKey.DeskTags,
            label: intl.formatMessage({ id: 'desk.settings.tags.title' }),
            href: `/${appID}/desk/settings/tags`,
          },
          {
            key: AppSettingMenuKey.DeskTeams,
            label: intl.formatMessage({ id: 'desk.settings.teams.title' }),
            href: `/${appID}/desk/settings/teams`,
          },
          {
            key: AppSettingMenuKey.DeskCustomerFields,
            label: intl.formatMessage({ id: 'desk.settings.customerFields.title' }),
            href: `/${appID}/desk/settings/customer-fields`,
          },
          {
            key: AppSettingMenuKey.DeskTicketFields,
            label: intl.formatMessage({ id: 'desk.settings.ticketFields.title' }),
            href: `/${appID}/desk/settings/ticket-fields`,
          },
          ...(isOwner
            ? [
                {
                  key: AppSettingMenuKey.DeskSecurity,
                  label: intl.formatMessage({ id: 'desk.settings.security.title' }),
                  href: `/${appID}/desk/settings/security`,
                },
              ]
            : []),
          {
            key: AppSettingMenuKey.DeskCredentials,
            label: intl.formatMessage({ id: 'desk.settings.credentials.title' }),
            href: `/${appID}/desk/settings/credentials`,
          },
          {
            key: AppSettingMenuKey.DeskWebhooks,
            label: intl.formatMessage({ id: 'desk.settings.webhooks.title' }),
            href: `/${appID}/desk/settings/webhooks`,
          },
        ].concat(
          INTEGRATION_SETTING_ALLOWED_LIST.includes(organizationUID) || isLocalBuild
            ? [
                {
                  key: AppSettingMenuKey.DeskIntegration,
                  label: intl.formatMessage({ id: 'desk.settings.integration.title' }),
                  href: `/${appID}/desk/settings/integration`,
                },
              ]
            : [],
        )
      : [];

    return { applicationMenus, chatMenus, deskMenus };
  }, [
    appID,
    intl,
    isAccessibleToCoreSettings,
    isAccessibleToDeskSettings,
    isLocalBuild,
    isOwner,
    isProfanityFilterAvailable,
    isSelfService,
    organizationUID,
  ]);

  const callsMenus = useCallsSettingMenus();

  return useMemo(() => {
    const allMenus = [applicationMenus, chatMenus, callsMenus, deskMenus].flat();
    const activeMenu = allMenus.find((item) => item.href && location.pathname.startsWith(item.href));
    const isActiveMenuExactMatch = activeMenu ? activeMenu.href === location.pathname.replace(/\/$/, '') : false;
    const fallbackMenuPath = allMenus[0]?.href;

    return {
      applicationMenus,
      chatMenus,
      deskMenus,
      callsMenus,
      activeMenu,
      isActiveMenuExactMatch,
      fallbackMenuPath,
    };
  }, [applicationMenus, chatMenus, deskMenus, callsMenus, location.pathname]);
};
