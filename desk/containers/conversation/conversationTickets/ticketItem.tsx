import { memo, useState, useEffect, useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import copy from 'copy-to-clipboard';
import {
  cssVariables,
  transitionDefault,
  Icon,
  Badge,
  transitions,
  OverflowMenu,
  OverflowMenuProps,
  toast,
} from 'feather';
import { FileMessage, UserMessage, AdminMessage } from 'sendbird';

import { CLOUD_FRONT_URL, DeskMessagesMode, SocialTicketChannelTypes, TicketStatus } from '@constants';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';
import { StyledProps } from '@ui';
import { getRandomNumber, isShallowEqual, getTicketSocialType, getTicketURL } from '@utils';
import { logException } from '@utils/logException';

const TicketCustomerThumbnail = styled.div<{ url: string }>`
  width: 40px;
  min-width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  ${(props) => (props.url ? `background-image: url(${props.url});` : '')}
  background-position: center;
  background-size: cover;
`;

const TicketName = styled.div`
  max-width: 248px;
  flex: 1;
  display: flex;
  align-items: center;
`;

const TicketNameText = styled.div`
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  flex: 1;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const TicketCustomerName = styled.p`
  height: 20px;
  margin-top: 2px;
  padding: 0;
  font-size: 12px;
  line-height: 1.33;
  color: ${cssVariables('neutral-7')};
`;

const TicketMessage = styled.div<{ $isRemoved: boolean }>`
  width: 100%;
  font-size: 14px;
  color: ${({ $isRemoved }) => cssVariables($isRemoved ? 'neutral-6' : 'neutral-10')};
  line-height: 1.43;
  letter-spacing: -0.1px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const LastMessageAt = styled.div`
  text-align: right;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.33;
  color: ${cssVariables('neutral-7')};
`;

const TicketSocialIcon = styled.div`
  margin-right: 8px;
`;

const TicketInformation = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TicketTop = styled.div`
  display: flex;
`;

const BasicInformation = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-right: 16px;
`;

const AdditionalInformation = styled.div`
  min-width: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-direction: column;
  font-size: 14px;
`;

const TicketBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  width: 100%;
  max-width: 100%;
  margin-top: 6px;

  ${Badge} {
    margin-left: 16px;
  }
`;

const StyledTicket = styled.div<StyledProps>`
  position: relative;
  z-index: 10;
  padding: 12px 16px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  transition: ${transitions({
    duration: 0.2,
    properties: ['background', 'border'],
  })};
  cursor: pointer;

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: ${cssVariables('purple-7')};
    transform: translateX(-4px) scale(0);
    transition: transform 0.3s ${transitionDefault};
  }

  &:after {
    content: '';
    display: block;
    position: absolute;
    top: -1px;
    right: 0;
    left: 0;
    width: 100%;
    height: 1px;
    opacity: 0;
    background: ${cssVariables('neutral-1')};
    transition: ${transitions({
      duration: 0.3,
      properties: ['background', 'opacity'],
    })};
  }

  ${(props) =>
    props.isActive
      ? css`
          z-index: 20;
          border-color: ${cssVariables('neutral-2')};
          background: ${cssVariables('neutral-2')};

          &:before {
            transform: translateX(0) scale(1);
          }

          &:after {
            opacity: 1;
          }

          ${TicketName} svg {
            fill: ${cssVariables('purple-7')};
          }

          ${TicketNameText} {
            color: ${cssVariables('purple-7')};
          }
        `
      : ''};
`;

type Props = {
  // state
  isActive: boolean;
  ticket: Ticket;
  agentId: number;

  // actions
  ticketClickHandler: (payload) => void;
};

export const TicketItem = memo<Props>(
  ({ isActive, agentId, ticket, ticketClickHandler }) => {
    const intl = useIntl();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const reloadGroupChannel = useRef<() => void>(() => {});
    const channelUpdateHandler = useRef<(channel: SendBird.GroupChannel) => void>(() => {});
    const [channel, setChannel] = useState<{
      lastMessage: SendBird.UserMessage | SendBird.FileMessage | SendBird.AdminMessage | undefined;
      unreadMessageCount: number;
    }>({ lastMessage: undefined, unreadMessageCount: 0 });

    useEffect(() => {
      reloadGroupChannel.current = async () => {
        const isSendBirdTicket = getTicketSocialType(ticket.channelType) === 'sendbird';
        if (
          isSendBirdTicket &&
          (ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE) &&
          ticket.recentAssignment?.agent.id === agentId
        ) {
          try {
            const gc = await window.dashboardSB.GroupChannel.getChannel(ticket.channelUrl);
            if (gc) {
              setChannel({
                lastMessage: gc.lastMessage,
                unreadMessageCount: gc.unreadMessageCount,
              });
              setIsTyping(gc && gc.getTypingMembers().length > 0);
            }
          } catch (error) {
            logException({ error, context: { ticket, agentId } });
          }
        }
      };
    }, [agentId, ticket]);

    useEffect(() => {
      channelUpdateHandler.current = (updatedChannel) => {
        if (updatedChannel.isGroupChannel() && updatedChannel.url === ticket.channelUrl) {
          const updatedChannelData = {
            lastMessage: updatedChannel.lastMessage,
            unreadMessageCount: updatedChannel.unreadMessageCount,
          };
          if (!isShallowEqual(channel, updatedChannelData)) {
            setChannel(updatedChannelData);
          }
          const memberTyping = updatedChannel.getTypingMembers().length > 0;
          if (memberTyping !== !isTyping) {
            setIsTyping(memberTyping);
          }
        }
      };
    }, [channel, isTyping, ticket.channelUrl]);

    useEffect(() => {
      reloadGroupChannel.current();

      const channelHandler = new window.dashboardSB.ChannelHandler();
      const onChannelUpdated = (channel) => channelUpdateHandler.current(channel);

      /**
       * We don't need to check read receipt on ticket list
       */
      channelHandler.onMessageReceived = onChannelUpdated;
      channelHandler.onChannelChanged = onChannelUpdated;
      channelHandler.onTypingStatusUpdated = onChannelUpdated;
      window.dashboardSB.addChannelHandler(`ticketItem_${ticket.id}_handler`, channelHandler);

      return () => window.dashboardSB.removeChannelHandler(`ticketItem_${ticket.id}_handler`);
    }, [ticket.id]);

    const actions: OverflowMenuProps['items'] = [
      {
        label: intl.formatMessage({
          id: 'desk.tickets.action.lbl.copyUrl',
        }),
        onClick: () => {
          copy(getTicketURL(ticket.id, false));
          toast.success({ message: intl.formatMessage({ id: 'desk.tickets.action.lbl.copyUrl.success' }) });
        },
      },
    ];

    const handleTicketClick = useCallback(() => {
      ticketClickHandler(ticket);
    }, [ticketClickHandler, ticket]);

    const handleImageError = (e) => {
      e.target.src = `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(ticket.channelUrl, 3)}.svg`;
    };

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    const renderLastMessage = () => {
      if (ticket.lastMessageIsRemoved) {
        return intl.formatMessage({ id: 'desk.conversation.ticketList.lastMessage.deleted' });
      }
      if (SocialTicketChannelTypes.includes(ticket.channelType)) {
        return ticket.lastMessage ? ticket.lastMessage : '';
      }
      if (channel && ticket.channelType === DeskMessagesMode.SENDBIRD && channel.lastMessage) {
        if (channel.lastMessage.messageType === 'file') {
          return (channel.lastMessage as FileMessage).name;
        }
        if (channel.lastMessage.messageType === 'user' || channel.lastMessage.messageType === 'admin') {
          return (channel.lastMessage as UserMessage | AdminMessage).message;
        }
      } else {
        return ticket.lastMessage || '';
      }
    };

    const renderMessage = () => {
      if (isTyping) {
        return intl.formatMessage({ id: 'desk.typingIndicator' }, { customerName: ticket.customer.displayName });
      }
      return renderLastMessage();
    };

    const socialIcon = (() => {
      switch (ticket.channelType) {
        case 'FACEBOOK_CONVERSATION':
        case 'FACEBOOK_FEED':
          return <Icon icon="facebook" size={16} color={cssVariables('neutral-6')} />;
        case 'TWITTER_DIRECT_MESSAGE_EVENT':
        case 'TWITTER_STATUS':
          return <Icon icon="twitter" size={16} color={cssVariables('neutral-6')} />;
        case 'INSTAGRAM_COMMENT':
          return <Icon icon="instagram" size={16} color={cssVariables('neutral-6')} />;
        case 'WHATSAPP_MESSAGE':
          return <Icon icon="whatsapp" size={16} color={cssVariables('neutral-7')} />;
        default:
          return null;
      }
    })();

    const formatTimeAgo = useFormatTimeAgo();

    return (
      <StyledTicket
        ref={containerRef}
        onMouseLeave={handleMouseLeave}
        onMouseOver={handleMouseEnter}
        isActive={isActive}
        onClick={handleTicketClick}
        data-test-id="ticketItem"
      >
        <TicketInformation>
          <TicketTop>
            <TicketCustomerThumbnail
              url={
                ticket.customer.photoThumbnailUrl ||
                `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(ticket.channelUrl, 3)}.svg`
              }
              onError={handleImageError}
              data-test-id="ticketItem__thumbnail"
            />
            <BasicInformation>
              <TicketName>
                {socialIcon && <TicketSocialIcon>{socialIcon}</TicketSocialIcon>}
                <TicketNameText>{ticket.channelName}</TicketNameText>
              </TicketName>
              <TicketCustomerName>{ticket.customer.displayName}</TicketCustomerName>
            </BasicInformation>
            <AdditionalInformation>
              {isHovered ? (
                <OverflowMenu
                  items={actions}
                  stopClickEventPropagation={true}
                  popperProps={{
                    modifiers: {
                      flip: {
                        boundariesElement: containerRef.current?.parentElement || undefined,
                      },
                    },
                  }}
                />
              ) : (
                <LastMessageAt>
                  {ticket.lastMessageAt && formatTimeAgo(new Date(ticket.lastMessageAt), { withoutSuffix: true })}
                </LastMessageAt>
              )}
            </AdditionalInformation>
          </TicketTop>
          <TicketBottom>
            <TicketMessage $isRemoved={ticket.lastMessageIsRemoved}>{renderMessage()}</TicketMessage>
            {ticket.recentAssignment && ticket.recentAssignment.unreadCount > 0 ? (
              <Badge count={ticket.recentAssignment.unreadCount} color="red" />
            ) : null}
          </TicketBottom>
        </TicketInformation>
      </StyledTicket>
    );
  },
  (prevProps, nextProps) => {
    let isEqual = true;
    if (JSON.stringify(prevProps.ticket) !== JSON.stringify(nextProps.ticket)) {
      isEqual = false;
    } else if (prevProps.agentId !== nextProps.agentId) {
      isEqual = false;
    } else if (prevProps.isActive !== nextProps.isActive) {
      isEqual = false;
    }
    return isEqual;
  },
);
