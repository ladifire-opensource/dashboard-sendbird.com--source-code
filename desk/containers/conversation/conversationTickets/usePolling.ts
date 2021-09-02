import { useEffect, useRef, useContext, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import moment from 'moment-timezone';
import { interval, timer, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { commonActions } from '@actions';
import { TicketStatus } from '@constants';
import { useTypedSelector, useLatestValue, useAppId } from '@hooks';
import { checkIfDesktopNotificationGranted } from '@utils';
import { logException } from '@utils/logException';

import { ConversationContext } from './conversationContext';

const useConversationTickets = () => useContext(ConversationContext).conversationTickets;

const useTicketRefresher = () => {
  const agentId = useTypedSelector((state) => state.desk.agent.id);
  const conversationTickets = useConversationTickets();
  const { fetchCurrentTickets, fetchAssignedTickets } = conversationTickets;
  const { page, pageSize } = conversationTickets.state.currentPagination;

  const latestContext = useLatestValue({ agentId, fetchCurrentTickets, fetchAssignedTickets, page, pageSize });

  const updateAllCurrentTickets = useCallback(() => {
    latestContext.current.fetchCurrentTickets({
      agentId: latestContext.current.agentId,
      offset: 0,
      limit: latestContext.current.page * latestContext.current.pageSize,
    });
  }, [latestContext]);

  const fetchAllAssignedTickets = useCallback(() => {
    latestContext.current.fetchAssignedTickets({
      agentId: latestContext.current.agentId,
    });
  }, [latestContext]);

  return { updateAllCurrentTickets, fetchAllAssignedTickets };
};

const usePollingState = () => {
  const { conversationTickets } = useContext(ConversationContext);
  const { assignedTickets } = conversationTickets.state;
  const agentId = useTypedSelector((state) => state.desk.agent.id);
  return { assignedTickets, agentId };
};

export const usePolling = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const history = useHistory();

  const appId = useAppId();
  const { isSearchMode } = useConversationTickets().state;

  const state = usePollingState();
  const latestState = useLatestValue(state);
  const { updateAllCurrentTickets, fetchAllAssignedTickets } = useTicketRefresher();

  const ticketResponseCheckerSubscription = useRef<Subscription | null>(null);
  const ticketRefresherSubscription = useRef<Subscription | null>(null);

  const ticketResponseChecker$ = useRef(
    timer(5000, 30000).pipe(
      tap(() => {
        const { assignedTickets, agentId } = latestState.current;
        assignedTickets.forEach((ticket) => {
          const isActiveTicket = ticket.status2 === TicketStatus.ACTIVE;
          const isCurrentAgentOwnTheTicket = ticket.recentAssignment && ticket.recentAssignment.agent.id === agentId;
          const isCustomerWaitingMoreThanOneMinute =
            ticket.lastMessageSender === 'CUSTOMER' && moment().diff(moment(ticket.lastMessageAt)) >= 60000;

          if (
            isActiveTicket &&
            isCurrentAgentOwnTheTicket &&
            isCustomerWaitingMoreThanOneMinute &&
            checkIfDesktopNotificationGranted()
          ) {
            dispatch(
              commonActions.addDesktopNotificationsRequest({
                title: intl.formatMessage({ id: 'desk.desktopNotification.waitingTicket.title' }),
                body: intl.formatMessage({ id: 'desk.desktopNotification.waitingTicket.body' }),
                callback: () => {
                  try {
                    window.parent.focus();
                    window.focus();
                    history.push(`/${appId}/desk/conversation/${ticket.id}`);
                  } catch (error) {
                    logException({ error });
                  }
                },
              }),
            );
          }
        });
      }),
    ),
  );

  const ticketRefresher$ = useRef(
    interval(30000).pipe(
      tap(() => {
        updateAllCurrentTickets();
        fetchAllAssignedTickets();
      }),
    ),
  );

  const subscribe = () => {
    if (process.env.NODE_ENV !== 'DEVELOPMENT' && ticketResponseCheckerSubscription.current == null) {
      ticketResponseCheckerSubscription.current = ticketResponseChecker$.current.subscribe();
    }
    if (ticketRefresherSubscription.current == null) {
      ticketRefresherSubscription.current = ticketRefresher$.current.subscribe();
    }
  };

  const unsubscribe = () => {
    [ticketResponseCheckerSubscription, ticketRefresherSubscription]
      .filter((ref) => ref.current)
      .forEach((ref) => {
        ref.current?.unsubscribe();
        ref.current = null;
      });
  };

  useEffect(() => {
    subscribe();
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isSearchMode) {
      unsubscribe();
    } else {
      subscribe();
    }
  }, [isSearchMode]);
};
