import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';

import styled from 'styled-components';

import { cssVariables } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { deskActions } from '@actions';
import { TicketStatus } from '@constants';
import { fetchTickets } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync } from '@hooks';
import { SpinnerFull, TicketListItem, CollapsibleSection } from '@ui/components';
import { getTicketStatus2, getTicketSocialType, logException } from '@utils';

const ticketHistoryOpenChannelHandlerId = 'ticket_history_open_channel_handler';
const getGroupChannelId = (ticket: Ticket) => `ticket_history_${ticket.id}_group_channel_handler`;

type Props = { customerId: Customer['id'] };

const CollapsedContainer = styled(CollapsibleSection)`
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const StyledHistoryTickets = styled.div`
  margin: 0 -16px 16px;
`;

export const HistoryTickets: FC<Props> = ({ customerId }) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { project } = useSelector((state: RootState) => ({ project: state.desk.project }));
  const dispatch = useDispatch();

  const [ticketHistory, setTicketHistory] = useState<Ticket[]>([]);
  const connectedGroupChannelUrls = useRef<Ticket['channelUrl'][]>([]);

  const [stateOfFetchTicketHistory, fetchTicketHistoryCallback] = useAsync(
    (customer: Customer['id']) =>
      fetchTickets(pid, region, {
        offset: 0,
        limit: 10,
        order: '-created_at',
        customer,
        status2: getTicketStatus2(TicketStatus.ALL),
      }),
    [pid, region],
  );

  const handleTicketClick = (ticketItem: Ticket) => (event) => {
    event.preventDefault();
    dispatch(deskActions.setTicketHistoryCurrent(ticketItem));
  };

  const handleGroupChannelMessageReceived = (updatedChannel: SendBird.GroupChannel) => {
    setTicketHistory((ticketHistory) =>
      ticketHistory.map((ticket) => {
        const { url: updatedChannelUrl, lastMessage } = updatedChannel;
        if (isEmpty(lastMessage)) return ticket;
        const updatedTicket: Ticket = { ...ticket, lastMessageAt: new Date(lastMessage.createdAt).toString() };

        if (updatedChannel.isGroupChannel() && ticket.channelUrl === updatedChannelUrl) {
          if (lastMessage.messageType === 'file') {
            return { ...updatedTicket, lastMessage: (lastMessage as SendBird.FileMessage).name };
          }
          if (lastMessage.messageType === 'user' || lastMessage.messageType === 'admin') {
            return {
              ...updatedTicket,
              lastMessage: (lastMessage as SendBird.UserMessage | SendBird.AdminMessage).message,
            };
          }
          return ticket;
        }
        return ticket;
      }),
    );
  };

  const addChannelHandler = useCallback((ticket: Ticket) => {
    const isSBTicket = getTicketSocialType(ticket.channelType) === 'sendbird';
    const isAlreadyConnectedGroupChannel = connectedGroupChannelUrls.current.some(
      (channelUrl) => channelUrl === ticket.channelUrl,
    );

    if (isSBTicket && !isAlreadyConnectedGroupChannel) {
      const groupChannelHandler = new window.dashboardSB.ChannelHandler();
      groupChannelHandler.onMessageReceived = handleGroupChannelMessageReceived;
      groupChannelHandler.onChannelChanged = handleGroupChannelMessageReceived;
      window.dashboardSB.addChannelHandler(getGroupChannelId(ticket), groupChannelHandler);
      connectedGroupChannelUrls.current = [...connectedGroupChannelUrls.current, ticket.channelUrl];
    }
  }, []);

  useEffect(() => {
    fetchTicketHistoryCallback(customerId);
  }, [fetchTicketHistoryCallback, customerId]);

  useEffect(() => {
    const { status, data } = stateOfFetchTicketHistory;
    if (status === 'success' && data?.data != null) {
      setTicketHistory(data.data.results as Ticket[]);
    }
  }, [stateOfFetchTicketHistory]);

  useEffect(() => {
    ticketHistory
      .filter((ticket) => ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE)
      .forEach((ticket) => addChannelHandler(ticket));
  }, [addChannelHandler, ticketHistory]);

  useEffect(() => {
    if (stateOfFetchTicketHistory.status === 'success' && ticketHistory.length > 0) {
      const openChannelHandler = new window.dashboardSB.ChannelHandler();
      openChannelHandler.onMessageReceived = (channel, message) => {
        if (channel.isOpenChannel() && channel.url === project.openChannelUrl) {
          try {
            const deskEvent: { type: DeskEvent; ticket?: Ticket } = JSON.parse(message['message']);
            if (deskEvent?.ticket?.customer.id !== customerId) {
              return;
            }

            switch (deskEvent.type) {
              case 'TICKET_ASSIGN':
              case 'TICKET_REOPEN':
              case 'TICKET_TRANSFER': {
                const { ticket: newTicket } = deskEvent as { ticket: Ticket };
                setTicketHistory((ticketHistory) => {
                  const current = [...ticketHistory];
                  if (ticketHistory.some((ticket) => ticket.id === newTicket.id)) {
                    return current.map((currentTicket) =>
                      currentTicket.id === newTicket.id ? newTicket : currentTicket,
                    );
                  }
                  if (ticketHistory.length === 10) {
                    current.pop();
                  }
                  return [newTicket, ...current];
                });
                addChannelHandler(newTicket);
                break;
              }
              case 'TICKET_CLOSE':
              case 'TICKET_WIP': {
                const { ticket: updatedTicket } = deskEvent as { ticket: Ticket };
                window.dashboardSB.removeChannelHandler(getGroupChannelId(updatedTicket));
                setTicketHistory((ticketHistory) =>
                  ticketHistory.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)),
                );
                break;
              }
              case 'TICKET_ACTIVE':
              case 'TICKET_IDLE': {
                const { ticket: updatedTicket } = deskEvent as { type: DeskEvent; ticket: Ticket };
                setTicketHistory((ticketHistory) =>
                  ticketHistory.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket)),
                );
                break;
              }

              default:
                break;
            }
          } catch (error) {
            logException(error);
          }
        }
      };
      window.dashboardSB.addChannelHandler(ticketHistoryOpenChannelHandlerId, openChannelHandler);
    }
  }, [addChannelHandler, customerId, project.openChannelUrl, stateOfFetchTicketHistory.status, ticketHistory]);

  useEffect(() => {
    return () => {
      window.dashboardSB.removeChannelHandler(ticketHistoryOpenChannelHandlerId);
    };
  }, []);

  useEffect(() => {
    return () => {
      ticketHistory
        .filter((ticket) => ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE)
        .forEach((ticket) => window.dashboardSB.removeChannelHandler(ticket.channelUrl));
    };
  }, [ticketHistory]);

  if (stateOfFetchTicketHistory.status === 'loading') {
    return <SpinnerFull />;
  }
  return ticketHistory.length > 0 ? (
    <div>
      <CollapsedContainer
        title={intl.formatMessage(
          { id: 'desk.tickets.ticketInfoPanel.history.title' },
          { count: ticketHistory.length },
        )}
      >
        <StyledHistoryTickets>
          {ticketHistory.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              ticket={ticket}
              onClick={handleTicketClick(ticket)}
              data-test-id="TicketListItem"
            />
          ))}
        </StyledHistoryTickets>
      </CollapsedContainer>
    </div>
  ) : null;
};
