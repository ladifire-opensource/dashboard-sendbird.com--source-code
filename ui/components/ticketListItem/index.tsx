import React from 'react';

import styled from 'styled-components';

import { transitionDefault, cssVariables, Lozenge, Icon } from 'feather';

import useFormatTimeAgo from '@hooks/useFormatTimeAgo';
import { getTicketSocialType } from '@utils';

import { TicketStatusLozenge } from '../ticketStatusLozenge';

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ${transitionDefault};

  &:hover {
    background-color: ${cssVariables('neutral-1')};
  }

  ${Lozenge} {
    flex: 0 0 auto;
    margin-right: 8px;
  }
`;

const ChannelName = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 24px;
  letter-spacing: 0.25px;
  color: ${cssVariables('neutral-10')};
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;

  ${Icon} {
    margin-right: 8px;
  }
`;

const LastMessage = styled.div`
  width: 100%;
  display: flex;
  flex-flow: row-reverse wrap;
  margin-top: 8px;

  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};

  .last-message__at {
    flex: 0 0 auto;
    margin-left: 8px;
  }

  .last-message__message {
    flex: 1;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
`;

type Props = {
  ticket: Ticket;
  className?: string;
  onClick?: (e?: React.MouseEvent) => void;
};

export const TicketListItem: React.FC<Props> = ({ ticket, className, onClick, ...others }) => {
  const formatTimeAgo = useFormatTimeAgo();
  const socialIcon = (() => {
    const socialType = getTicketSocialType(ticket.channelType);
    switch (socialType) {
      case 'facebook':
        return <Icon icon="facebook" size={16} color={cssVariables('neutral-6')} data-test-id="SocialIcon" />;
      case 'twitter':
        return <Icon icon="twitter" size={16} color={cssVariables('neutral-6')} data-test-id="SocialIcon" />;
      case 'instagram':
        return <Icon icon="instagram" size={16} color={cssVariables('neutral-6')} data-test-id="SocialIcon" />;
      case 'whatsapp':
        return <Icon icon="whatsapp" size={16} color={cssVariables('neutral-6')} data-test-id="SocialIcon" />;
      default:
        return null;
    }
  })();

  return (
    <Container className={className} onClick={onClick} {...others}>
      <TicketStatusLozenge ticketStatus={ticket.status2} />
      <ChannelName>
        {socialIcon}
        {ticket.channelName}
      </ChannelName>
      <LastMessage>
        <span className="last-message__at">
          {ticket.lastMessageAt && formatTimeAgo(new Date(ticket.lastMessageAt), { withoutSuffix: true })}
        </span>
        <span className="last-message__message">{ticket.lastMessage}</span>
      </LastMessage>
    </Container>
  );
};
