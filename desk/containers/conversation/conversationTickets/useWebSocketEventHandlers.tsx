import { useEffect, useContext, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { toast } from 'feather';
import capitalize from 'lodash/capitalize';
import has from 'lodash/has';
import * as SendBird from 'sendbird';

import { commonActions, deskActions } from '@actions';
import { TicketStatus } from '@constants';
import { useWindowFocusSubscription } from '@core/containers/app/useWindowFocusSubscription';
import { useShallowEqualSelector, useTypedSelector, useLatestValue, useAppId } from '@hooks';
import {
  useDeskProjectFileEncryptionPermission,
  getDeskEncryptedFileAccessPermission,
} from '@hooks/useDeskEncryptedFileAccessPermission';
import { TicketActionToastMessage, TicketActions } from '@ui/components/TicketActionToastMessage';
import { camelCaseKeys, checkIfDesktopNotificationGranted, ClientStorage } from '@utils';
import { logException } from '@utils/logException';

import { ConversationContext } from './conversationContext';
import { useExitFromCurrentTicket } from './useExitFromCurrentTicket';

type TicketEvent = DeskEventPayload<{ ticket: Ticket }>;
type AssignmentEvent = DeskEventPayload<{ assignment: Assignment }>;
type AgentEvent = DeskEventPayload<{ agent: Agent }>;

type TicketAssignEvent = TicketEvent;
type TicketActiveEvent = TicketEvent;
type TicketCloseEvent = TicketEvent;
type TicketConfirmedEvent = TicketEvent;
type TicketIdleEvent = TicketEvent;
type TicketReopenEvent = TicketEvent;
type TicketWipEvent = TicketEvent;
type TicketCsatUpdatedEvent = TicketEvent;
type TicketTeamTransferEvent = TicketEvent;
type TicketLastSeenAtUpdatedEvent = TicketEvent;
type TicketPriorityValueUpdatedEvent = TicketEvent;
type AssignmentResponsedEvent = AssignmentEvent;
type AssignmentUpdatedEvent = AssignmentEvent;
type AgentConnectionEvent = AgentEvent;
type AgentRoleEvent = AgentEvent;
type AgentStatusEvent = AgentEvent;
type TicketTransferEvent = DeskEventPayload<{ ticket: Ticket; transfer: Transfer }>;
type TicketFacebookPageFeedUpdatedEvent = DeskEventPayload<{
  facebookPageFeedTicket: { facebookPageFeed: FacebookFeedType; ticket: FacebookTicket<'FACEBOOK_FEED'> };
}>;
type TicketFacebookPageMessageUpdatedEvent = DeskEventPayload<{ facebookPageMessage: FacebookPageMessage }>;
type TicketTwitterDirectMessageEventUpdatedEvent = DeskEventPayload<{
  twitterDirectMessageEvent: TwitterDirectMessageEvent;
}>;
type TicketTwitterStatusTicketUpdatedEvent = DeskEventPayload<{ twitterStatusTicket: TwitterStatusTicket }>;
type TicketWhatsappMessageUpdatedEvent = DeskEventPayload<{ nexmoWhatsappMessage: WhatsAppMessageType }>;
type TicketDeleteMessageEvent = TicketEvent;

const useConversationTickets = () => useContext(ConversationContext).conversationTickets;

const useCurrentTicketListUpdater = () => {
  const agentId = useTypedSelector((state) => state.desk.agent.id);
  const conversationTickets = useConversationTickets();
  const { fetchAssignedTicketsCounts, addTickets, removeFromCurrentTickets, fetchCurrentTickets } = conversationTickets;
  const {
    currentPagination: { page, pageSize },
  } = conversationTickets.state;

  const latestContext = useLatestValue({
    agentId,
    fetchAssignedTicketsCounts,
    fetchCurrentTickets,
    addTickets,
    removeFromCurrentTickets,
    page,
    pageSize,
  });

  const addToCurrentTicketsList = useCallback(
    (ticket: Ticket) => {
      latestContext.current.addTickets({ ticket });
      latestContext.current.fetchAssignedTicketsCounts({ agentId: latestContext.current.agentId });
    },
    [latestContext],
  );

  const removeFromCurrentTicketsList = useCallback(
    (ticket: Ticket) => {
      latestContext.current.removeFromCurrentTickets({ ticket });
      latestContext.current.fetchAssignedTicketsCounts({ agentId: latestContext.current.agentId });
    },
    [latestContext],
  );

  const updateAllCurrentTickets = useCallback(() => {
    latestContext.current.fetchCurrentTickets({
      agentId: latestContext.current.agentId,
      offset: 0,
      limit: latestContext.current.page * latestContext.current.pageSize,
    });
  }, [latestContext]);

  return { addToCurrentTicketsList, removeFromCurrentTicketsList, updateAllCurrentTickets };
};

const convertTicketsByChannel = (tickets: readonly Ticket[]) => {
  return tickets.reduce((acc, ticket) => {
    acc[ticket.channelUrl] = ticket;
    return acc;
  }, {} as { [key: string]: Ticket });
};

const convertTicketsById = (tickets: readonly Ticket[]) => {
  return tickets.reduce((acc, ticket) => {
    acc[ticket.id] = ticket;
    return acc;
  }, {} as { [key: string]: Ticket });
};

const useCheckIfCanShowDesktopNotification = () => {
  const isWindowFocused = useWindowFocusSubscription();
  return useCallback(() => !isWindowFocused() && checkIfDesktopNotificationGranted(), [isWindowFocused]);
};

const useWebSocketEventHandlerContext = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const appId = useAppId();

  const reduxState = useShallowEqualSelector((state) => {
    const { id: agentId, status: agentStatus, sendbirdId: agentSendbirdId } = state.desk.agent;
    const { openChannelUrl } = state.desk.project;
    const conversationTicketId = state.conversation.ticket?.id;

    return { agentId, agentStatus, agentSendbirdId, conversationTicketId, openChannelUrl };
  });

  const checkIfCanShowDesktopNotification = useCheckIfCanShowDesktopNotification();
  const exitFromCurrentTicket = useExitFromCurrentTicket();

  const {
    updateTickets,
    updateCounts,
    fetchAssignedTicketsCounts,
    removeFromCurrentTickets,
    updateTicketsAssignment,
    resetCurrentTickets,
    state: { isSearchMode, filter, currentTickets, assignedTickets },
  } = useConversationTickets();

  const currentTicketsById = useMemo(() => convertTicketsById(currentTickets), [currentTickets]);
  const assignedTicketsByChannel = useMemo(() => convertTicketsByChannel(assignedTickets), [assignedTickets]);
  const deskProjectFileEncryptionPermission = useDeskProjectFileEncryptionPermission();

  return {
    intl,
    dispatch,
    updateTickets,
    updateCounts,
    updateTicketsAssignment,
    fetchAssignedTicketsCounts,
    removeFromCurrentTickets,
    resetCurrentTickets,
    exitFromCurrentTicket,
    checkIfCanShowDesktopNotification,
    isSearchMode,
    filter,
    currentTicketsById,
    assignedTicketsByChannel,
    deskProjectFileEncryptionPermission,
    appId,
    ...reduxState,
    ...useCurrentTicketListUpdater(),
  };
};

type WebSocketEventHandlerContext = ReturnType<typeof useWebSocketEventHandlerContext>;

const ticketAssignEventHandler = (
  { ticket }: TicketAssignEvent,
  {
    intl,
    conversationTicketId,
    agentId,
    isSearchMode,
    filter,
    currentTicketsById,
    checkIfCanShowDesktopNotification,
    dispatch,
    addToCurrentTicketsList,
    removeFromCurrentTicketsList,
  }: WebSocketEventHandlerContext,
) => {
  const isTicketOnMyList = Object.prototype.hasOwnProperty.call(currentTicketsById, ticket.id);
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;
  const isTicketActiveOrIdle = ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE;
  const isTicketListFilterActive = filter.value === TicketStatus.ACTIVE;

  const showDesktopNotification = () => {
    dispatch(
      commonActions.addDesktopNotificationsRequest({
        title: intl.formatMessage({ id: 'desk.desktopNotification.newIncomingChat.title' }),
        body: intl.formatMessage(
          { id: 'desk.desktopNotification.newIncomingChat.body' },
          { customerName: ticket.customer.displayName },
        ),
        callback: () => {
          dispatch(deskActions.fetchConversationSuccess(ticket));
        },
      }),
    );
  };

  const showToastSuccessMessage = () => {
    toast.success({
      message: (
        <div>
          <p>
            <strong>{intl.formatMessage({ id: 'desk.desktopNotification.newTransferredChat.title' })}</strong>
          </p>
          <p>
            {intl.formatMessage(
              { id: 'desk.desktopNotification.newIncomingChat.body' },
              { customerName: ticket.customer.displayName },
            )}
          </p>
        </div>
      ),
    });
  };

  // Business logic
  if (ticket.id === conversationTicketId) {
    dispatch(deskActions.fetchConversationSuccess(ticket));
  }

  if (!isTicketActiveOrIdle) {
    return;
  }

  if (isTicketAssignedToMe) {
    if (!isSearchMode) {
      if (isTicketListFilterActive && !isTicketOnMyList) {
        /**
         * If an agent is watching active ticket list but the ticket is not on his/her list,
         * it should be added as it is assigned to the agent.
         */
        addToCurrentTicketsList(ticket);
      }

      if (!isTicketListFilterActive && isTicketOnMyList) {
        /**
         * It means agent is watching ticket list with non-active filter value (= IDLE, WIP or CLOSED).
         * When ticket is assigned, the value of ticket.status2 always become ACTIVE,
         * and therefore it should be removed if the ticket is on current ticket list.
         * */
        removeFromCurrentTicketsList(ticket);
      }
    }

    if (checkIfCanShowDesktopNotification()) {
      showDesktopNotification();
    }

    showToastSuccessMessage();
    return;
  }

  // If a ticket is assigned to other agent, but it has been on my list, then remove it from my list
  if (!isSearchMode && isTicketOnMyList) {
    removeFromCurrentTicketsList(ticket);
  }
};

const ticketTransferEventHandler = (
  { ticket, transfer }: TicketTransferEvent,
  {
    intl,
    conversationTicketId,
    agentId,
    isSearchMode,
    filter,
    currentTicketsById,
    exitFromCurrentTicket,
    checkIfCanShowDesktopNotification,
    dispatch,
    addToCurrentTicketsList,
    removeFromCurrentTicketsList,
  }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketTransferredToMe = transfer.toAssignment.agent.id === agentId;
  const isTicketTransferredToOtherAgent = transfer.fromAssignment.agent.id === agentId;
  const isTicketOnMyList = Object.prototype.hasOwnProperty.call(currentTicketsById, ticket.id);
  const isTicketListFilterActive = filter.value === TicketStatus.ACTIVE;

  const showToastSuccessMessageTransferredToMe = () => {
    toast.success({
      message: (
        <div>
          <p>
            <strong>{intl.formatMessage({ id: 'desk.desktopNotification.newIncomingChat.title' })}</strong>
          </p>
          <p>
            {intl.formatMessage(
              { id: 'desk.desktopNotification.newIncomingChat.body' },
              { customerName: ticket.customer.displayName },
            )}
          </p>
        </div>
      ),
    });
  };

  const showDesktopNotification = () => {
    dispatch(
      commonActions.addDesktopNotificationsRequest({
        title: intl.formatMessage({ id: 'desk.desktopNotification.newTransferredChat.title' }),
        body: intl.formatMessage(
          { id: 'desk.desktopNotification.newIncomingChat.body' },
          { customerName: ticket.customer.displayName },
        ),
        callback: () => {
          dispatch(deskActions.fetchConversationSuccess(ticket));
        },
      }),
    );
  };

  if (isTicketTransferredToMe && !isSearchMode) {
    showToastSuccessMessageTransferredToMe();

    if (isTicketListFilterActive && !isTicketOnMyList) {
      addToCurrentTicketsList(ticket);
    }

    if (!isTicketListFilterActive && isTicketOnMyList) {
      removeFromCurrentTicketsList(ticket);
    }

    if (checkIfCanShowDesktopNotification()) {
      showDesktopNotification();
    }

    return;
  }

  if (isTicketTransferredToOtherAgent) {
    toast.success({
      message: (
        <TicketActionToastMessage action={TicketActions.TRANSFERRED_TO_AGENT} ticketChannelName={ticket.channelName} />
      ),
    });

    if (!isSearchMode && isTicketOnMyList) {
      removeFromCurrentTicketsList(ticket);
    }

    if (isWatchingTicketDetail) {
      exitFromCurrentTicket();
    }
  }
};

const ticketCloseEventHandler = (
  { ticket }: TicketCloseEvent,
  {
    intl,
    conversationTicketId,
    agentId,
    isSearchMode,
    currentTicketsById,
    checkIfCanShowDesktopNotification,
    dispatch,
    removeFromCurrentTicketsList,
  }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;
  const isTicketOnMyList = Object.prototype.hasOwnProperty.call(currentTicketsById, ticket.id);

  if (isWatchingTicketDetail) {
    dispatch(deskActions.fetchConversationSuccess(ticket));
  }

  if (isTicketAssignedToMe) {
    if (!isSearchMode && isTicketOnMyList) {
      removeFromCurrentTicketsList(ticket);
    }

    if (isWatchingTicketDetail) {
      dispatch(deskActions.setConversationAssignment(ticket.recentAssignment));
    }

    if (checkIfCanShowDesktopNotification()) {
      dispatch(
        commonActions.addDesktopNotificationsRequest({
          title: intl.formatMessage(
            { id: 'desk.ticket.update.message.ticketClosed' },
            { ticketChannelName: ticket.channelName },
          ),
          body: '',
        }),
      );
    }

    toast.success({
      message: <div>{intl.formatMessage({ id: 'desk.conversation.events.ticketClosed.success' })}</div>,
    });
  }
};

const ticketReopenEventHandler = (
  { ticket }: TicketReopenEvent,
  { agentId, conversationTicketId, filter, dispatch, addToCurrentTicketsList }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;
  const isTicketListFilterActive = filter.value === TicketStatus.ACTIVE;

  if (isWatchingTicketDetail) {
    dispatch(deskActions.fetchConversationSuccess(ticket));
  }

  if (isTicketAssignedToMe && isTicketListFilterActive) {
    addToCurrentTicketsList(ticket);
  }
};

const ticketConfirmedEventHandler = (
  { ticket }: TicketConfirmedEvent,
  { dispatch, conversationTicketId }: WebSocketEventHandlerContext,
) => {
  if (ticket.id === conversationTicketId) {
    dispatch(deskActions.fetchConversationSuccess(ticket));
  }
};

const ticketActiveEventHandler = (
  { ticket }: TicketActiveEvent,
  {
    appId,
    agentId,
    isSearchMode,
    filter,
    currentTicketsById,
    conversationTicketId,
    dispatch,
    addToCurrentTicketsList,
    removeFromCurrentTicketsList,
  }: WebSocketEventHandlerContext,
) => {
  const isTicketOnMyList = Object.prototype.hasOwnProperty.call(currentTicketsById, ticket.id);
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;
  const isTicketListFilterActive = filter.value === TicketStatus.ACTIVE;

  if (!ticket.recentAssignment) {
    logException({
      error: 'No recentAssignment',
      context: { appId, ticketId: ticket.id, name: 'TICKET_ACTIVE' },
    });
  }

  if (isTicketAssignedToMe) {
    if (!isSearchMode) {
      if (!isTicketListFilterActive && isTicketOnMyList) {
        removeFromCurrentTicketsList(ticket);
      }

      if (isTicketListFilterActive && !isTicketOnMyList) {
        addToCurrentTicketsList(ticket);
      }
    }

    if (ticket.id === conversationTicketId) {
      dispatch(deskActions.fetchConversationSuccess(ticket));
    }
  }
};

const ticketWipEventHandler = (
  { ticket }: TicketWipEvent,
  {
    conversationTicketId,
    isSearchMode,
    currentTicketsById,
    filter,
    dispatch,
    addToCurrentTicketsList,
    removeFromCurrentTicketsList,
  }: WebSocketEventHandlerContext,
) => {
  const isFilterWIP = filter.value === TicketStatus.WIP;
  const isTicketOnMyList = Object.prototype.hasOwnProperty.call(currentTicketsById, ticket.id);

  if (!isSearchMode && !isFilterWIP && isTicketOnMyList) {
    removeFromCurrentTicketsList(ticket);
  }

  if (!isSearchMode && isFilterWIP) {
    addToCurrentTicketsList(ticket);
  }

  if (ticket.id === conversationTicketId) {
    dispatch(deskActions.fetchConversationSuccess(ticket));
  }
};

const ticketIdleEventHandler = (
  { ticket }: TicketIdleEvent,
  {
    conversationTicketId,
    agentId,
    appId,
    filter,
    isSearchMode,
    currentTicketsById,
    dispatch,
    addToCurrentTicketsList,
    removeFromCurrentTicketsList,
  }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketOnMyList = Object.prototype.hasOwnProperty.call(currentTicketsById, ticket.id);
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;
  const isFilterIdle = filter.value === TicketStatus.IDLE;

  if (!ticket.recentAssignment) {
    logException({
      error: 'No recentAssignment',
      context: { appId, ticketId: ticket.id, name: 'TICKET_IDLE' },
    });
  }

  if (isTicketAssignedToMe) {
    if (!isSearchMode) {
      if (!isFilterIdle && isTicketOnMyList) {
        removeFromCurrentTicketsList(ticket);
      }

      if (isFilterIdle && !isTicketOnMyList) {
        addToCurrentTicketsList(ticket);
      }
    }

    if (isWatchingTicketDetail) {
      dispatch(deskActions.fetchConversationSuccess(ticket));
    }
  }
};

const ticketCsatUpdatedEventHandler = (
  { ticket }: TicketCsatUpdatedEvent,
  { conversationTicketId, dispatch, agentId, deskProjectFileEncryptionPermission }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketClosed = ticket.status2 === TicketStatus.CLOSED;

  if (isWatchingTicketDetail && isTicketClosed) {
    /**
     * Refetch previous messages to show CSAT in the closed ticket.
     */
    const { shouldAuthenticateToAccessFiles, fileEncryptionPermission } = deskProjectFileEncryptionPermission;
    const isEncryptedFileAccessPermitted = getDeskEncryptedFileAccessPermission({
      ticket,
      agentId,
      shouldAuthenticateToAccessFiles,
      fileEncryptionPermission,
    });

    dispatch(
      deskActions.fetchConversationMessagesRequest({
        types: 'initial',
        channelUrl: ticket.channelUrl,
        messageTs: new Date().valueOf(),
        prevLimit: 50,
        nextLimit: 0,
        presignedFileUrl: isEncryptedFileAccessPermitted,
      }),
    );
  }
};

const ticketTeamTransferEventHandler = (
  { ticket }: TicketTeamTransferEvent,
  {
    conversationTicketId,
    agentId,
    updateTickets,
    assignedTicketsByChannel,
    removeFromCurrentTickets,
    dispatch,
  }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;

  if (ticket.recentAssignment === null) {
    removeFromCurrentTickets({ ticket });
    return;
  }

  // FIXME: check whether it is necessary to check assignedTicketsByChannel
  if (has(assignedTicketsByChannel, ticket.channelUrl) && isTicketAssignedToMe) {
    updateTickets({ ticket });
  }

  if (isWatchingTicketDetail) {
    dispatch(deskActions.fetchConversationSuccess(ticket));
  }
};

const assignmentResponsedEventHandler = (
  { assignment }: AssignmentResponsedEvent,
  { conversationTicketId, agentId, dispatch, updateTicketsAssignment }: WebSocketEventHandlerContext,
) => {
  if (assignment.agent.id === agentId) {
    updateTicketsAssignment({ assignment });
    if (assignment && assignment.assignedTicket === conversationTicketId) {
      // Only update current ticket's assignment
      dispatch(deskActions.setConversationAssignment(assignment));
    }
  }
};

const assignmentUpdatedEventHandler = (
  { assignment }: AssignmentUpdatedEvent,
  { conversationTicketId, agentId, dispatch, updateTicketsAssignment }: WebSocketEventHandlerContext,
) => {
  if (assignment.agent.id === agentId) {
    updateTicketsAssignment({ assignment });

    if (assignment && assignment.assignedTicket === conversationTicketId) {
      // Only update current ticket's assignment
      dispatch(deskActions.setConversationAssignment(assignment));
    }
  }
};

const agentConnectionEventHandler = (
  { agent }: AgentConnectionEvent,
  { agentId, dispatch, updateAllCurrentTickets, exitFromCurrentTicket }: WebSocketEventHandlerContext,
) => {
  if (agent.id === agentId) {
    dispatch(deskActions.setDeskAgent(agent));
    exitFromCurrentTicket();
    if (agent.status !== 'INACTIVE') {
      updateAllCurrentTickets();
    }
  }
};

const agentRoleEventHandler = (
  { agent }: AgentRoleEvent,
  { agentId, dispatch, exitFromCurrentTicket }: WebSocketEventHandlerContext,
) => {
  if (agent.id === agentId) {
    dispatch(deskActions.setDeskAgent(agent));
    exitFromCurrentTicket();
  }
};

const agentStatusEventHandler = (
  { agent }: AgentStatusEvent,
  {
    agentId,
    agentStatus: currentAgentStatus,
    resetCurrentTickets,
    exitFromCurrentTicket,
  }: WebSocketEventHandlerContext,
) => {
  if (agent.id === agentId && agent.status === 'INACTIVE' && currentAgentStatus === 'ACTIVE') {
    exitFromCurrentTicket();
    resetCurrentTickets();
    ClientStorage.remove('deskApiToken');
  }
};

const ticketLastSeenAtUpdatedEventHandler = (
  { ticket }: TicketLastSeenAtUpdatedEvent,
  { conversationTicketId, agentId, updateTickets, dispatch }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;
  const isTicketAssignedToMe = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;

  if (!ticket.recentAssignment) {
    logException({
      error: 'No recentAssignment',
      context: { ticketId: ticket.id, name: 'TICKET_LAST_SEEN_AT_UPDATED' },
    });
  }

  if (isTicketAssignedToMe) {
    updateTickets({
      ticket,
    });

    if (isWatchingTicketDetail) {
      // only update current ticket
      dispatch(deskActions.fetchConversationSuccess(ticket));
    }
  }
};

const ticketPriorityValueUpdatedEventHandler = (
  { ticket }: TicketPriorityValueUpdatedEvent,
  { intl, conversationTicketId, dispatch }: WebSocketEventHandlerContext,
) => {
  const isWatchingTicketDetail = ticket.id === conversationTicketId;

  if (isWatchingTicketDetail) {
    toast.info({
      message: intl.formatMessage(
        { id: 'desk.tickets.ticketInfoPanel.toast.changePriority.success' },
        { changedPriority: capitalize(ticket.priority) },
      ),
    });

    // FIXME: The ticket from server will be changed to camelCase, then remove camelCaseKeys function.
    dispatch(deskActions.fetchConversationSuccess(camelCaseKeys(ticket)));
  }
};

const isAssignedToAgent = (ticket: Ticket, agentId: number) => ticket.recentAssignment?.agent.id === agentId;

// social
/**
 * Triggered when new item added or edited to exist ticket.
 */
const ticketFacebookPageMessageUpdatedEventHandler = (
  { facebookPageMessage }: TicketFacebookPageMessageUpdatedEvent,
  { agentId, updateTickets }: WebSocketEventHandlerContext,
) => {
  if (isAssignedToAgent(facebookPageMessage.ticket, agentId)) {
    updateTickets({ ticket: facebookPageMessage.ticket });
  }
};

const ticketFacebookPageFeedUpdatedEventHandler = (
  { facebookPageFeedTicket }: TicketFacebookPageFeedUpdatedEvent,
  { agentId, updateTickets }: WebSocketEventHandlerContext,
) => {
  if (isAssignedToAgent(facebookPageFeedTicket.ticket, agentId)) {
    updateTickets({ ticket: facebookPageFeedTicket.ticket });
  }
};

const ticketTwitterDirectMessageEventUpdatedEventHandler = (
  { twitterDirectMessageEvent }: TicketTwitterDirectMessageEventUpdatedEvent,
  { agentId, updateTickets }: WebSocketEventHandlerContext,
) => {
  if (isAssignedToAgent(twitterDirectMessageEvent.ticket, agentId)) {
    updateTickets({ ticket: twitterDirectMessageEvent.ticket });
  }
};

const ticketTwitterStatusTicketUpdatedEventHandler = (
  { twitterStatusTicket }: TicketTwitterStatusTicketUpdatedEvent,
  { agentId, updateTickets }: WebSocketEventHandlerContext,
) => {
  if (isAssignedToAgent(twitterStatusTicket.ticket, agentId)) {
    updateTickets({ ticket: twitterStatusTicket.ticket });
  }
};

const ticketWhatsappMessageUpdatedEventHandler = (
  { nexmoWhatsappMessage }: TicketWhatsappMessageUpdatedEvent,
  { agentId, updateTickets }: WebSocketEventHandlerContext,
) => {
  if (isAssignedToAgent(nexmoWhatsappMessage.ticket, agentId)) {
    updateTickets({ ticket: nexmoWhatsappMessage.ticket });
  }
};

const ticketDeleteMessageEventHandler = (
  { ticket }: TicketDeleteMessageEvent,
  { agentId, updateTickets }: WebSocketEventHandlerContext,
) => {
  if (isAssignedToAgent(ticket, agentId)) {
    updateTickets({ ticket }); // to update ticket last message
  }
};

const deskEventHandlers = {
  TICKET_ASSIGN: ticketAssignEventHandler,
  TICKET_TRANSFER: ticketTransferEventHandler,
  TICKET_CLOSE: ticketCloseEventHandler,
  TICKET_REOPEN: ticketReopenEventHandler,
  TICKET_CONFIRMED: ticketConfirmedEventHandler,
  TICKET_ACTIVE: ticketActiveEventHandler,
  TICKET_WIP: ticketWipEventHandler,
  TICKET_IDLE: ticketIdleEventHandler,
  TICKET_CSAT_UPDATED: ticketCsatUpdatedEventHandler,
  TICKET_TEAM_TRANSFER: ticketTeamTransferEventHandler,
  ASSIGNMENT_RESPONSED: assignmentResponsedEventHandler,
  ASSIGNMENT_UPDATED: assignmentUpdatedEventHandler,
  AGENT_CONNECTION: agentConnectionEventHandler,
  AGENT_ROLE: agentRoleEventHandler,
  AGENT_STATUS: agentStatusEventHandler,
  TICKET_LAST_SEEN_AT_UPDATED: ticketLastSeenAtUpdatedEventHandler,
  TICKET_PRIORITY_VALUE_UPDATED: ticketPriorityValueUpdatedEventHandler,
  TICKET_FACEBOOK_PAGE_MESSAGE_UPDATED: ticketFacebookPageMessageUpdatedEventHandler,
  TICKET_FACEBOOK_PAGE_FEED_UPDATED: ticketFacebookPageFeedUpdatedEventHandler,
  TICKET_TWITTER_DIRECT_MESSAGE_EVENT_UPDATED: ticketTwitterDirectMessageEventUpdatedEventHandler,
  TICKET_TWITTER_STATUS_TICKET_UPDATED: ticketTwitterStatusTicketUpdatedEventHandler,
  TICKET_WHATSAPP_MESSAGE_UPDATED: ticketWhatsappMessageUpdatedEventHandler,
  TICKET_DELETE_MESSAGE: ticketDeleteMessageEventHandler,
};

const webSocketReconnectionHandler = ({ updateAllCurrentTickets }: WebSocketEventHandlerContext) => {
  updateAllCurrentTickets();
};

export const useDesktopNotification = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const showDesktopNotification = useCallback(
    (message: SendBird.AdminMessage | SendBird.UserMessage | SendBird.FileMessage, onClick: () => void) => {
      let body = '';
      if (message.isUserMessage() || message.isAdminMessage()) {
        body = (message as SendBird.UserMessage | SendBird.AdminMessage).message;
      } else if (message.isFileMessage()) {
        if (message['type'] && message['type'].match(/^image.+$/i)) {
          body = '(image)';
        }
      }
      dispatch(
        commonActions.addDesktopNotificationsRequest({
          title: intl.formatMessage(
            { id: 'desk.desktopNotification.newMessage.title' },
            { nickname: (message as SendBird.UserMessage | SendBird.FileMessage).sender.nickname },
          ),
          body,
          callback: onClick,
        }),
      );
    },
    [dispatch, intl],
  );
  return showDesktopNotification;
};

export const useWebSocketEventHandlers = () => {
  const dispatch = useDispatch();
  const context = useWebSocketEventHandlerContext();
  const latestContext = useLatestValue(context);
  const showDesktopNotification = useDesktopNotification();

  useEffect(() => {
    if (window.dashboardSB == null) {
      return;
    }

    const channelHandler = new window.dashboardSB.ChannelHandler();

    channelHandler.onMessageReceived = (channel, message) => {
      const currentContext = latestContext.current;

      if (channel.isOpenChannel() && channel.url === currentContext.openChannelUrl) {
        try {
          const deskEvent = JSON.parse(message['message']);
          if (typeof deskEventHandlers[deskEvent.type] === 'function') {
            deskEventHandlers[deskEvent.type](deskEvent, currentContext);
          }
        } catch (error) {
          logException({
            error,
            context: { channel, message },
          });
        }
      } else if (currentContext.checkIfCanShowDesktopNotification() && channel.isGroupChannel()) {
        if (
          (message.isUserMessage() || message.isFileMessage()) &&
          (message as SendBird.UserMessage | SendBird.FileMessage).sender.userId !== currentContext.agentSendbirdId
        ) {
          if (has(currentContext.assignedTicketsByChannel, message.channelUrl)) {
            const ticket = currentContext.assignedTicketsByChannel[message.channelUrl];
            showDesktopNotification(message, () => {
              dispatch(deskActions.fetchConversationSuccess(ticket));
            });
          }
        }
      }
    };

    const connectionHandler = new window.dashboardSB.ConnectionHandler();
    connectionHandler.onReconnectSucceeded = () => {
      webSocketReconnectionHandler(latestContext.current);
    };

    window.dashboardSB.addChannelHandler('CONVERSATION_TICKETS_CHANNEL_HANDLER', channelHandler);
    window.dashboardSB.addConnectionHandler('AGENT_CONNECTION_HANDLER', connectionHandler);

    return () => {
      window.dashboardSB?.removeChannelHandler('CONVERSATION_TICKETS_CHANNEL_HANDLER');
      window.dashboardSB?.removeConnectionHandler('AGENT_CONNECTION_HANDLER');
    };
  }, [dispatch, latestContext, showDesktopNotification]);
};
