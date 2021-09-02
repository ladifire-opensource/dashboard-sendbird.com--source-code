import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Dropdown, DropdownSection } from 'feather';

import { TicketStatus, SocialTicketChannelTypes } from '@constants';
import { TicketStatusLozenge } from '@ui/components';
import { getTicketStatusLabelKey } from '@utils';

import { TicketCloseStatusEnum } from '../conversation/constants';

const TicketHeaderActionWrapper = styled.div`
  margin-left: 8px;

  button {
    border: 1px solid transparent;
  }
`;

const ActionToggle = styled.div`
  margin: 0 8px 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
`;

type ActionItem = {
  action: TicketHeaderActionType;
  node: React.ReactNode;
};

type Props = {
  ticket: Ticket;
  agent: AgentDetail;
  isAdmin: boolean;
  closeTicketWithoutConfirmation: boolean;
  handleActionChange: ({ action: TicketHeaderActionType }) => void;
};

export const TicketHeaderAction = React.memo<Props>(
  ({ ticket, agent, isAdmin, closeTicketWithoutConfirmation, handleActionChange }) => {
    const intl = useIntl();

    const isAgent = !isAdmin;

    const isTicketWip = ticket.status2 === TicketStatus.WIP;
    const isTicketClosed = ticket.status2 === TicketStatus.CLOSED;
    const isTicketAssigned = ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE;

    const isTicketClosedByCustomer =
      ticket.closeStatus === TicketCloseStatusEnum.CLOSED_BY_CUSTOMER ||
      ticket.closeStatus === TicketCloseStatusEnum.CONFIRMED;

    const isAssignedToCurrentAgent = ticket.recentAssignment && ticket.recentAssignment.agent.id === agent.id;

    const isSocialTicket = ticket.channelType && SocialTicketChannelTypes.includes(ticket.channelType);
    const isSendBirdTicket =
      ticket.channelType === 'SENDBIRD' ||
      ticket.channelType === 'SENDBIRD_JAVASCRIPT' ||
      ticket.channelType === 'SENDBIRD_IOS' ||
      ticket.channelType === 'SENDBIRD_ANDROID';

    const handleItemSelected = (item: ActionItem | null) => {
      if (item == null) {
        return;
      }
      handleActionChange({ action: item.action });
    };

    const canCloseTicket =
      isTicketAssigned &&
      !isTicketClosed &&
      (isAdmin ||
        (isAgent && closeTicketWithoutConfirmation) ||
        (isAgent && isTicketClosedByCustomer) ||
        (isAssignedToCurrentAgent && isSocialTicket));

    const getAdminActions = useCallback(() => {
      const statusSection: { items: ActionItem[] } = { items: [] };
      const footerSection: { items: ActionItem[] } = { items: [] };
      const items: DropdownSection[] = [];
      const canSendConfirmation =
        isAssignedToCurrentAgent && isSendBirdTicket && !isTicketWip && !isTicketClosed && !isTicketClosedByCustomer;
      switch (ticket.status2) {
        case TicketStatus.ACTIVE: {
          if (ticket.recentAssignment) {
            if (isAssignedToCurrentAgent) {
              statusSection.items.push({
                node: <TicketStatusLozenge ticketStatus={TicketStatus.WIP} />,
                action: 'MOVE_TO_IN_PROGRESS',
              });
            }
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.IDLE} />,
              action: 'MOVE_TO_IDLE',
            });
          }

          if (canSendConfirmation) {
            footerSection.items.push({
              node: intl.formatMessage({ id: 'desk.tickets.header.action.sendConfirmation' }),
              action: 'INQUIRE_TICKET_CLOSURE',
            });
          }
          statusSection.items.push({
            node: <TicketStatusLozenge ticketStatus={TicketStatus.CLOSED} />,
            action: 'CLOSE_TICKET',
          });
          break;
        }
        case TicketStatus.IDLE: {
          if (isAssignedToCurrentAgent) {
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.WIP} />,
              action: 'MOVE_TO_IN_PROGRESS',
            });
          }

          if (canSendConfirmation) {
            footerSection.items.push({
              node: intl.formatMessage({ id: 'desk.tickets.header.action.sendConfirmation' }),
              action: 'INQUIRE_TICKET_CLOSURE',
            });
          }
          statusSection.items.push({
            node: <TicketStatusLozenge ticketStatus={TicketStatus.CLOSED} />,
            action: 'CLOSE_TICKET',
          });
          break;
        }
        case TicketStatus.WIP: {
          statusSection.items.push({
            node: intl.formatMessage({ id: 'desk.tickets.header.action.assignToMyself' }),
            action: 'ASSIGN_TICKET_TO_MYSELF',
          });
          statusSection.items.push({
            node: intl.formatMessage({ id: 'desk.tickets.header.action.assignToAgent' }),
            action: 'ASSIGN_TO_AGENT',
          });
          break;
        }
        default:
          break;
      }
      items.push(statusSection);
      footerSection.items.length > 0 && items.push(footerSection);
      return items;
    }, [
      intl,
      isAssignedToCurrentAgent,
      isSendBirdTicket,
      isTicketClosed,
      isTicketClosedByCustomer,
      isTicketWip,
      ticket.recentAssignment,
      ticket.status2,
    ]);

    const getAgentActions = useCallback(() => {
      const statusSection: { items: ActionItem[] } = { items: [] };
      const footerSection: { items: ActionItem[] } = { items: [] };
      const items: DropdownSection[] = [];
      const canSendConfirmation = isSendBirdTicket && !isTicketWip && !isTicketClosed && !isTicketClosedByCustomer;
      switch (ticket.status2) {
        case TicketStatus.ACTIVE: {
          if (!isAssignedToCurrentAgent) {
            break;
          }
          if (ticket.recentAssignment) {
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.WIP} />,
              action: 'MOVE_TO_IN_PROGRESS',
            });
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.IDLE} />,
              action: 'MOVE_TO_IDLE',
            });
          }

          if (canCloseTicket) {
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.CLOSED} />,
              action: 'CLOSE_TICKET',
            });
          }

          if (canSendConfirmation) {
            footerSection.items.push({
              node: intl.formatMessage({ id: 'desk.tickets.header.action.sendConfirmation' }),
              action: 'INQUIRE_TICKET_CLOSURE',
            });
          }
          break;
        }
        case TicketStatus.IDLE: {
          if (!isAssignedToCurrentAgent) {
            break;
          }
          if (ticket.recentAssignment) {
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.WIP} />,
              action: 'MOVE_TO_IN_PROGRESS',
            });
          }
          if (canCloseTicket) {
            statusSection.items.push({
              node: <TicketStatusLozenge ticketStatus={TicketStatus.CLOSED} />,
              action: 'CLOSE_TICKET',
            });
          }
          if (canSendConfirmation) {
            footerSection.items.push({
              node: intl.formatMessage({ id: 'desk.tickets.header.action.sendConfirmation' }),
              action: 'INQUIRE_TICKET_CLOSURE',
            });
          }
          break;
        }

        case TicketStatus.WIP: {
          statusSection.items.push({
            node: intl.formatMessage({ id: 'desk.tickets.header.action.assignToMyself' }),
            action: 'ASSIGN_TICKET_TO_MYSELF',
          });
          break;
        }
        default:
          break;
      }
      items.push(statusSection);
      footerSection.items.length > 0 && items.push(footerSection);
      return items;
    }, [
      canCloseTicket,
      intl,
      isAssignedToCurrentAgent,
      isSendBirdTicket,
      isTicketClosed,
      isTicketClosedByCustomer,
      isTicketWip,
      ticket.recentAssignment,
      ticket.status2,
    ]);

    const items = isAdmin ? getAdminActions() : getAgentActions();
    if (items.flatMap((item) => item?.items ?? item).length === 0) {
      return null;
    }

    return (
      <TicketHeaderActionWrapper>
        <Dropdown<ActionItem>
          size="small"
          selectedItem={{
            node: '' as React.ReactNode,
            action: '' as any,
          }}
          items={items}
          itemsType="section"
          itemToElement={(item) => item.node}
          placeholder="action"
          placement="bottom-end"
          toggleRenderer={() => (
            <ActionToggle data-test-id="ActionToggle">
              {intl.formatMessage({ id: getTicketStatusLabelKey(ticket.status2) })}
            </ActionToggle>
          )}
          toggleTheme={{
            contentColor: 'white',
            hoverContentColor: 'white',
            pressedContentColor: 'white',
            bgColor: cssVariables('purple-7'),
            activeBgColor: cssVariables('purple-7'),
            hoverBgColor: cssVariables('purple-8'),
            pressedBgColor: cssVariables('purple-7'),
          }}
          onItemSelected={handleItemSelected}
        />
      </TicketHeaderActionWrapper>
    );
  },
);
