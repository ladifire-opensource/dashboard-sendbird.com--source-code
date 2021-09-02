import { memo } from 'react';

import styled, { css } from 'styled-components';

import { TextWithOverflowTooltip } from '../TextWithOverflowTooltip';

const TicketChannelNameEllipsis = styled(TextWithOverflowTooltip).attrs({
  tooltipDisplay: 'inline-block',
  tooltipStyle: css`
    vertical-align: bottom;
  `,
})`
  max-width: 200px;
`;

export enum TicketActions {
  ASSIGNED = 'ASSIGNED',
  TRANSFERRED_TO_AGENT = 'TRANSFERRED_TO_AGENT',
  TRANSFERRED_TO_TEAM = 'TRANSFERRED_TO_TEAM',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export const ticketActionIntlKeys: Record<TicketActions, string> = {
  [TicketActions.ASSIGNED]: 'desk.ticket.update.message.ticketAssigned',
  [TicketActions.CLOSED]: 'desk.ticket.update.message.ticketClosed',
  [TicketActions.REOPENED]: 'desk.ticket.update.message.ticketReopened',
  [TicketActions.TRANSFERRED_TO_AGENT]: 'desk.ticket.update.message.ticketTransferred',
  [TicketActions.TRANSFERRED_TO_TEAM]: 'desk.ticket.update.message.transferToAgentGroup',
};

type Props = {
  action: TicketActions;
  ticketChannelName: Ticket['channelName'];
  teamName?: AgentGroup['name'];
};

export const TicketActionToastMessage = memo<Props>(({ action, ticketChannelName, teamName }) => {
  /**
   * This component is used on Dialog and the Dialog component is not wrapped with ConnectedIntlProvider.
   * Therefore, useIntl is not accessible here.
   * */
  const { intl } = window;
  return (
    <>
      {intl.formatMessage(
        { id: ticketActionIntlKeys[action] },
        {
          ticketChannelName: <TicketChannelNameEllipsis>{ticketChannelName}</TicketChannelNameEllipsis>,
          teamName,
        },
      )}
    </>
  );
});
