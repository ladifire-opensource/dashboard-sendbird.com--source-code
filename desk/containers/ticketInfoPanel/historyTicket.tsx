import { FC, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { cssVariables, Icon } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { deskActions } from '@actions';
import { useShallowEqualSelector } from '@hooks';
import { StyledProps } from '@ui';
import { transitionDefault } from '@ui/styles';

import { HistoryTicketMessages } from './HistoryTicketMessages';
import { HistoryTicketInfo } from './historyTicketInfo';

const StyledHistoryTicket = styled.div<StyledProps>`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: white;
  opacity: ${(props) => (props.isActive ? '1' : '0')};
  transform: scale(${(props) => (props.isActive ? '1' : '0')});
  transition: transform 0.2s ${transitionDefault}, opacity 0.2s ${transitionDefault};
`;

type Props = { ticket: Ticket };

export const HistoryTicket: FC<Props> = ({ ticket }) => {
  const { current } = useShallowEqualSelector((state) => state.ticketHistory);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      dispatch(deskActions.resetTicketHistoryCurrent());
    };
  }, [ticket.id, dispatch]);

  const close = () => {
    dispatch(deskActions.resetTicketHistoryCurrent());
  };

  const socialIcon = (() => {
    switch (ticket.channelType) {
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
        return <Icon icon="facebook" size={16} color={cssVariables('neutral-9')} />;
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
        return <Icon icon="twitter" size={16} color={cssVariables('neutral-9')} />;
      case 'INSTAGRAM_COMMENT':
        return <Icon icon="instagram" size={16} color={cssVariables('neutral-6')} />;
      case 'WHATSAPP_MESSAGE':
        return <Icon icon="whatsapp" size={16} color={cssVariables('neutral-7')} />;
      default:
        return null;
    }
  })();

  return (
    <StyledHistoryTicket isActive={!isEmpty(current)}>
      {current && (
        <>
          <HistoryTicketInfo ticket={current} socialIcon={socialIcon} onCloseButtonClick={close} />
          <HistoryTicketMessages ticket={current} />
        </>
      )}
    </StyledHistoryTicket>
  );
};
