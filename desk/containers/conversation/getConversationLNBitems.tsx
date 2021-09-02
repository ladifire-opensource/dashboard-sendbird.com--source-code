import { IntlShape } from 'react-intl';

import { createLeftNavigationBarItem, LeftNavigationBarDivider } from 'feather';

import { AgentPage } from '@constants';

export const getConversationLNBItems = (
  intl: IntlShape,
  appID: string,
  options: { ticketUnreadMessageCount: number },
) => {
  return {
    [AgentPage.tickets]: createLeftNavigationBarItem({
      key: AgentPage.tickets,
      label: intl.formatMessage({ id: 'desk.lnb.forAgent.tickets' }),
      icon: 'tickets-filled',
      href: `/${appID}/desk/conversation`,
      useReactRouterLink: true,
      badgeCount: options.ticketUnreadMessageCount,
    }),
    [AgentPage.assignmentLogs]: createLeftNavigationBarItem({
      key: AgentPage.assignmentLogs,
      label: intl.formatMessage({ id: 'desk.lnb.forAgent.assignmentLogs' }),
      icon: 'archive-filled',
      href: `/${appID}/desk/assignment_logs`,
      useReactRouterLink: true,
    }),
    [AgentPage.proactiveChat]: createLeftNavigationBarItem({
      key: AgentPage.proactiveChat,
      label: intl.formatMessage({ id: 'desk.lnb.forAgent.proactiveChats' }),
      icon: 'proactive-chat-filled',
      href: `/${appID}/desk/proactive_chats`,
      useReactRouterLink: true,
    }),
    [AgentPage.customers]: createLeftNavigationBarItem({
      key: AgentPage.customers,
      label: intl.formatMessage({ id: 'desk.lnb.forAgent.customers' }),
      icon: 'customers-filled',
      href: `/${appID}/desk/customers`,
      useReactRouterLink: true,
    }),
    LeftNavigationBarDivider,
    [AgentPage.settings]: createLeftNavigationBarItem({
      key: AgentPage.settings,
      label: intl.formatMessage({ id: 'desk.lnb.forAgent.settings' }),
      icon: 'settings-filled',
      href: `/${appID}/desk/settings`,
      useReactRouterLink: true,
    }),
  };
};
