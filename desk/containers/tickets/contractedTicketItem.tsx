import React, { useState, useCallback, useRef, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import copy from 'copy-to-clipboard';
import { cssVariables, transitionDefault, Icon, OverflowMenu, OverflowMenuProps, Tag, toast } from 'feather';

import { CLOUD_FRONT_URL, TicketStatus, EMPTY_TEXT } from '@constants';
import { TicketSortBy } from '@constants/desk';
import DeskCustomerAvatar from '@desk/components/DeskCustomerAvatar';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';
import { TicketStatusLozenge, PriorityBadge } from '@ui/components';
import { getRandomNumber, getTicketURL } from '@utils';

type Props = {
  ticket: Ticket;
  isActive: boolean;
  handleTicketClick: (ticket) => (e) => void;
  handleTicketItemActionChange: (payload: { action: TicketHeaderActionType; ticket: Ticket; agent?: Agent }) => void;
  selectedFilter: TicketSortBy;
};

const ProfileImage = styled(DeskCustomerAvatar)`
  flex: none;
  margin-right: 12px;
`;

const TicketInformation = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const TicketTop = styled.div`
  display: flex;
`;

const AdditionalInformation = styled.div`
  min-width: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-direction: column;
  font-size: 14px;
`;

const BasicInformation = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  padding-right: 16px;
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

const SocialIcon = styled.div`
  width: 16px;
  margin-right: 8px;
`;

const TicketCustomer = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
  height: 20px;
`;

const TicketBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  width: 100%;
  max-width: 100%;
  margin-top: 6px;
`;

const TicketLastMessage = styled.div<{ $isRemoved: boolean }>`
  flex: 1;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${({ $isRemoved }) => cssVariables($isRemoved ? 'neutral-6' : 'neutral-10')};
  margin-right: 12px;
  min-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const LastUpdatedAt = styled.div`
  display: flex;
  align-items: center;
  flex: none;
  height: 20px;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-7')};
`;

const TicketAction = styled.div`
  position: absolute;
  top: 12px;
  right: 16px;
`;

const AssigneeName = styled.div`
  font-size: 12px;
`;

const SelectedItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 20px;
`;

const StyledContractedTicketItem = styled.div<{ isActive: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  max-width: 100%;
  height: 88px;
  padding: 12px 16px 10px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  transition: 0.2s ${transitionDefault};
  transition-property: background-color, box-shadow;

  &:hover {
    cursor: pointer;
    background-color: ${cssVariables('neutral-2')};
  }
  ${(props) =>
    props.isActive &&
    css`
      background-color: ${cssVariables('neutral-1')};
      box-shadow: inset 2px 0 ${cssVariables('purple-7')}, 0 -1px 0 0 ${cssVariables('neutral-1')};
      border-bottom: 0;

      ${TicketName} svg {
        fill: ${cssVariables('purple-7')};
      }

      ${TicketNameText} {
        color: ${cssVariables('purple-7')};
        font-weight: 600;
      }
    `};
  &:last-child {
    border-bottom: none;
  }
`;

const PriorityWrapper = styled.div`
  display: flex;
  align-items: center;
  height: 20px;
  font-size: 12px;
`;

const CSATContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
`;

const Star = styled(Icon)`
  margin-right: 4px;
`;

export const ContractedTicketItem: React.FC<Props> = ({
  ticket,
  isActive = false,
  handleTicketClick,
  handleTicketItemActionChange,
  selectedFilter,
}) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const actions: OverflowMenuProps['items'] = useMemo(() => {
    const items: OverflowMenuProps['items'] = [];
    const commonItems: OverflowMenuProps['items'] = [
      {
        label: intl.formatMessage({
          id: 'desk.tickets.action.lbl.exportToCSV',
        }),
        onClick: () => {
          handleTicketItemActionChange({ action: 'EXPORT_TICKET', ticket });
        },
      },
      {
        label: intl.formatMessage({
          id: 'desk.tickets.action.lbl.copyUrl',
        }),
        onClick: () => {
          copy(getTicketURL(ticket.id, true));
          toast.success({ message: intl.formatMessage({ id: 'desk.tickets.action.lbl.copyUrl.success' }) });
        },
      },
    ];

    if (ticket.status2 === TicketStatus.CLOSED) {
      items.push({
        label: intl.formatMessage({
          id: 'label.reopenTicket',
        }),
        onClick: () => {
          handleTicketItemActionChange({ action: 'REOPEN_TICKET', ticket });
        },
      });
    } else {
      if (ticket.recentAssignment) {
        items.push({
          label: intl.formatMessage({
            id: 'desk.tickets.action.transfer.lbl.toAgent',
          }),
          onClick: () => {
            handleTicketItemActionChange({
              action: 'TRANSFER_TO_AGENT',
              ticket,
            });
          },
        });
      } else {
        items.push({
          label: intl.formatMessage({
            id: 'desk.tickets.action.assign.lbl.toAgent',
          }),
          onClick: () => {
            handleTicketItemActionChange({
              action: 'ASSIGN_TO_AGENT',
              ticket,
            });
          },
        });
      }

      if (ticket.group) {
        items.push({
          label: intl.formatMessage({
            id: 'desk.tickets.action.group.lbl.transferToGroup',
          }),
          onClick: () => {
            handleTicketItemActionChange({ action: 'TRANSFER_TO_GROUP', ticket });
          },
        });
      }

      items.push(OverflowMenu.divider);

      if (ticket.status2 === TicketStatus.ACTIVE || ticket.status2 === TicketStatus.IDLE) {
        items.push({
          label: intl.formatMessage({
            id: 'label.closeTicket',
          }),
          onClick: () => {
            handleTicketItemActionChange({ action: 'CLOSE_TICKET', ticket });
          },
        });
      }
    }

    return [...items, ...commonItems];
  }, [handleTicketItemActionChange, intl, ticket]);

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

  const ticketLastMessage = useMemo(() => {
    if (ticket.lastMessageIsRemoved) {
      return intl.formatMessage({ id: 'desk.conversation.ticketList.lastMessage.deleted' });
    }
    return ticket.lastMessage;
  }, [intl, ticket.lastMessage, ticket.lastMessageIsRemoved]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const selectedData = useMemo(() => {
    switch (selectedFilter) {
      case TicketSortBy.PRIORITY:
        return (
          <PriorityWrapper>
            <PriorityBadge priority={ticket.priority} showLabel={true} />
          </PriorityWrapper>
        );
      case TicketSortBy.CSAT:
        return ticket.customerSatisfactionScore ? (
          <CSATContainer>
            <Star key="base_star" icon="star-filled" size={12} color={cssVariables('yellow-5')} />
            <div>{ticket.customerSatisfactionScore}</div>
          </CSATContainer>
        ) : (
          EMPTY_TEXT
        );
      case TicketSortBy.ASSIGNEE:
        return ticket.recentAssignment?.agent ? (
          <AssigneeName>{ticket.recentAssignment.agent.displayName}</AssigneeName>
        ) : (
          <span>{EMPTY_TEXT}</span>
        );
      case TicketSortBy.TEAM:
        return ticket.group ? <Tag maxWidth={120}>{ticket.group.name}</Tag> : <span>{EMPTY_TEXT}</span>;
      default:
        return null;
    }
  }, [selectedFilter, ticket]);

  const formatTimeAgo = useFormatTimeAgo();

  return (
    <StyledContractedTicketItem
      ref={containerRef}
      onMouseLeave={handleMouseLeave}
      onMouseOver={handleMouseEnter}
      isActive={isActive}
      onClick={handleTicketClick(ticket)}
    >
      <TicketInformation>
        <TicketTop>
          <ProfileImage
            size="xmedium"
            profileID={ticket.customer.id}
            imageUrl={
              ticket.customer.photoThumbnailUrl ||
              `${CLOUD_FRONT_URL}/desk/thumbnail-member-0${getRandomNumber(ticket.channelUrl, 3)}.svg`
            }
          />
          <BasicInformation>
            <TicketName>
              {socialIcon ? <SocialIcon>{socialIcon}</SocialIcon> : ''}
              <TicketNameText title={ticket.channelName}>{ticket.channelName}</TicketNameText>
            </TicketName>
            <TicketCustomer>{ticket.customer.displayName}</TicketCustomer>
          </BasicInformation>
          <AdditionalInformation>
            {isHovered ? (
              <TicketAction>
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
              </TicketAction>
            ) : (
              <>
                <LastUpdatedAt>
                  {ticket.lastMessageAt && formatTimeAgo(new Date(ticket.lastMessageAt), { withoutSuffix: true })}
                </LastUpdatedAt>
                <SelectedItem>{selectedData}</SelectedItem>
              </>
            )}
          </AdditionalInformation>
        </TicketTop>
        <TicketBottom>
          <TicketLastMessage $isRemoved={ticket.lastMessageIsRemoved}>{ticketLastMessage}</TicketLastMessage>
          <TicketStatusLozenge ticketStatus={ticket.status2} />
        </TicketBottom>
      </TicketInformation>
    </StyledContractedTicketItem>
  );
};
