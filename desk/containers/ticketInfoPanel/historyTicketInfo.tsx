import React from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Headings, IconButton } from 'feather';

import { TicketStatusLozenge } from '@ui/components';

type Props = {
  socialIcon: React.ReactNode;
  ticket: Ticket;
  onCloseButtonClick?: React.MouseEventHandler;
};

const TicketInfo = styled.div`
  padding: 10px 16px;
  position: relative;
  background-color: ${cssVariables('neutral-1')};
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  border-bottom: 1px solid ${cssVariables('neutral-2')};
`;

const TicketNameRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TicketName = styled.div`
  ${Headings['heading-01']}
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  color: ${cssVariables('neutral-10')};
`;

const TicketSocialIcon = styled.div`
  margin-right: 6px;
  height: 16px;
`;

const TicketIssuedAt = styled.div`
  width: 100%;
  flex-shrink: 0;
  font-size: 12px;
  line-height: 16px;
  margin-top: 8px;
  color: ${cssVariables('neutral-7')};
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 8px;
  right: 8px;
`;

export const HistoryTicketInfo: React.FC<Props> = ({ socialIcon, ticket, onCloseButtonClick }) => {
  const intl = useIntl();
  return (
    <TicketInfo>
      <TicketNameRow>
        {socialIcon && <TicketSocialIcon>{socialIcon}</TicketSocialIcon>}
        <TicketName>{ticket.channelName}</TicketName>
        <TicketStatusLozenge
          ticketStatus={ticket.status2}
          css={`
            margin-right: 24px;
            margin-left: 4px;
          `}
        />
      </TicketNameRow>
      <TicketIssuedAt>
        {intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.history.ticketIssuedAt' })}
      </TicketIssuedAt>
      <CloseButton buttonType="tertiary" size="small" icon="close" onClick={onCloseButtonClick} />
    </TicketInfo>
  );
};
