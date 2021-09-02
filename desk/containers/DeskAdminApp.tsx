import { FC, useEffect, useContext, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';
import { TicketStatus, Page } from '@constants';
import { ConversationContext } from '@desk/containers/conversation/conversationTickets/conversationContext';
import { AdminContextProvider } from '@desk/contexts/AdminContext';

import { AgentDetailSidebar } from './agents/agentDetailSidebar';

export const DeskAdminApp: FC = ({ children }) => {
  const dispatch = useDispatch();
  const { conversationTickets } = useContext(ConversationContext);
  const { assignedTickets } = conversationTickets.state;

  const badgeCount = useMemo(() => {
    return assignedTickets
      .filter(
        (ticket) =>
          (ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE) &&
          ticket.recentAssignment?.status !== 'IDLE',
      )
      .reduce((acc, ticket) => {
        return acc + (ticket.recentAssignment?.unreadCount || 0);
      }, 0);
  }, [assignedTickets]);

  useEffect(() => {
    // FIXME: Temporary disabled Badge count for Admin
    dispatch(
      commonActions.updateLNBMenuItem({
        key: Page.conversation,
        // option: { badgeCount },
        option: { badgeCount: 0 },
      }),
    );
  }, [badgeCount, dispatch]);

  return (
    <AdminContextProvider>
      {children}
      <AgentDetailSidebar />
    </AdminContextProvider>
  );
};
