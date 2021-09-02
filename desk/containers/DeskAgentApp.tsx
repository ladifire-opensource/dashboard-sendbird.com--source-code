import { createContext, useEffect, useContext, useMemo, useCallback, FC } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import {
  LeftNavigationBar,
  LeftNavigationBarItemInterface,
  cssVariables,
  createLeftNavigationBarItem,
  LeftNavigationBarDividerInterface,
} from 'feather';

import { EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION, TicketStatus, Page } from '@constants';
import { VMUAE } from '@constants/uids';
import { LNBContext } from '@core/containers/app/lnbContext';
import { ConversationContext } from '@desk/containers/conversation/conversationTickets/conversationContext';
import { getConversationLNBItems } from '@desk/containers/conversation/getConversationLNBitems';
import { useAgentViewGlobalContext } from '@desk/contexts/AgentViewGlobalContext';
import {
  initialAgentViewGlobalContextValue,
  AgentViewGlobalContext as AgentViewGlobalContextType,
} from '@desk/contexts/AgentViewGlobalContext';
import { useAuthorization } from '@hooks';
import { ZIndexes } from '@ui';

const Container = styled.div`
  height: 100%;
  padding-left: ${LeftNavigationBar.collapsedWidth}px;
`;

const AgentViewGlobalContext = createContext<AgentViewGlobalContextType>(initialAgentViewGlobalContextValue);

const DeskAgentLNB = styled(LeftNavigationBar)`
  position: absolute;
  z-index: ${ZIndexes.navigation};
  top: 0;
  bottom: 0;
  left: 0;
  border-right: 1px solid ${cssVariables('neutral-3')};
  transition: top ${EMAIL_VERIFICATION_BANNER_SLIDE_ANIMATION_DURATION}s,
    width ${LeftNavigationBar.collapseAnimationDurationSecond}s;
`;

export const DeskAgentApp: FC = ({ children }) => {
  const intl = useIntl();
  const location = useLocation();

  const { isPermitted } = useAuthorization();
  const agentViewGlobalContext = useAgentViewGlobalContext();
  const { conversationTickets } = useContext(ConversationContext);
  const { assignedTickets } = conversationTickets.state;
  const { setIsCollapsed } = useContext(LNBContext);
  const { organizationUID, appID } = useSelector((state: RootState) => {
    return {
      organizationUID: state.organizations.current.uid,
      appID: state.applicationState.data?.app_id || '',
    };
  });
  const isVM = organizationUID === VMUAE; // VM

  useEffect(() => {
    if (isPermitted(['desk.agent'])) {
      setIsCollapsed(true);
    }
  }, [isPermitted, setIsCollapsed]);

  const getTicketUnreadMessageCounts = useCallback(() => {
    if (assignedTickets.length > 0) {
      return assignedTickets
        .filter(
          (ticket) =>
            (ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE) &&
            ticket.recentAssignment?.status !== 'IDLE',
        )
        .reduce((acc, ticket) => {
          return acc + (ticket.recentAssignment?.unreadCount || 0);
        }, 0);
    }
    return 0;
  }, [assignedTickets]);

  const lnbItems = useMemo(
    () =>
      getConversationLNBItems(intl, appID, {
        ticketUnreadMessageCount: getTicketUnreadMessageCounts(),
      }),
    [appID, getTicketUnreadMessageCounts, intl],
  );

  const menus = [
    lnbItems.tickets,
    lnbItems.assignmentLogs,
    lnbItems.proactiveChat,
    lnbItems.customers,
    lnbItems.settings,
  ];

  const menuItems = useMemo(() => {
    const agentMenuItems: (LeftNavigationBarItemInterface | LeftNavigationBarDividerInterface)[] = menus.slice(0);
    agentMenuItems.splice(agentMenuItems.length - 1, 0, lnbItems.LeftNavigationBarDivider);

    /**
     * Most of Desk Admin wants to offer minimum information to agents.
     * However, Virgin mobile wants their agents to watch monitoring page,
     * so Desk team decide to open the page for Virgin mobile agents.
     *
     * We will discuss whether it can be controlled by admin through Desk settings page.
     */
    if (isVM) {
      agentMenuItems.splice(
        agentMenuItems.length - 2,
        0,
        createLeftNavigationBarItem({
          key: Page.monitor,
          label: 'Monitoring',
          icon: 'monitor-filled' as const,
          href: `/${appID}/desk/monitoring`,
          useReactRouterLink: true,
        }),
      );
    }

    return agentMenuItems;
  }, [appID, isVM, lnbItems.LeftNavigationBarDivider, menus]);

  const activeMenu = Object.values(menus).find((item: LeftNavigationBarItemInterface) => {
    const { href } = item;
    return href && location.pathname.startsWith(href);
  });

  return (
    <AgentViewGlobalContext.Provider value={agentViewGlobalContext}>
      <Container>
        <DeskAgentLNB
          isCollapsed={true}
          activeKey={activeMenu && activeMenu.key}
          items={menuItems}
          isExpandCollapseButtonHidden={true}
        />
        {children}
      </Container>
    </AgentViewGlobalContext.Provider>
  );
};
