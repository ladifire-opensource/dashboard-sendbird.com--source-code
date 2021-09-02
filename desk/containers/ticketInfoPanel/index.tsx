import { useEffect, createRef, useContext, FC, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { ScrollBar, ScrollBarRef } from 'feather';

import { deskActions } from '@actions';
import { usePrevious } from '@hooks/usePrevious';
import { CustomFieldsInformation, CustomerSideProfile } from '@ui/components';

import { HistoryTickets } from './HistoryTickets';
import { RelatedChat } from './RelatedChat';
import { RelatedChatContextProvider, RelatedChatContext } from './RelatedChat/RelatedChatContext';
import { HistoryTicket } from './historyTicket';
import { TicketInformation } from './ticketInformation';

type Props = {
  ticket: Ticket;
  hasLinkToDetail: boolean;
};

const TicketInfoPanelComponent: FC<Props> = memo(({ ticket, hasLinkToDetail }) => {
  const { twitter } = useSelector<RootState, { twitter: TwitterState }>((state) => ({ twitter: state.twitter }));
  const dispatch = useDispatch();
  const scrollBarRef = createRef<ScrollBarRef>();
  const { id: ticketId, customer, twitterUser: agentTwitterUser, channelType } = ticket;
  const { twitterUser: customerTwitterUser = null } = twitter || {};
  const { isOpen, close } = useContext(RelatedChatContext);
  const prevTicketId = usePrevious(ticket.id);

  useEffect(() => {
    dispatch(deskActions.fetchTicketFieldsRequest({ offset: 0, limit: 50 }));
    dispatch(deskActions.fetchCustomerFieldsRequest({ offset: 0, limit: 50 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(deskActions.getTicketFieldDataListRequest({ id: ticketId }));
    dispatch(deskActions.getCustomerFieldDataListRequest({ id: customer.id }));
  }, [dispatch, ticketId, customer.id]);

  useEffect(() => {
    const isTwitterTicket = channelType === 'TWITTER_DIRECT_MESSAGE_EVENT' || channelType === 'TWITTER_STATUS';

    if (isTwitterTicket && agentTwitterUser) {
      const twitterUserIdDivider = '//';
      const customerTwitterUserId = customer.sendbirdId.split(twitterUserIdDivider)[1];
      dispatch(
        deskActions.fetchTwitterUserDetailRequest({
          agentTwitterUserId: agentTwitterUser.id,
          customerTwitterUserId,
        }),
      );
    }
  }, [dispatch, agentTwitterUser, customer, channelType]);

  useEffect(() => {
    if (ticket.id !== prevTicketId && isOpen) {
      close();
    }
  }, [close, isOpen, prevTicketId, ticket.id]);

  return (
    <>
      <ScrollBar style={{ height: '100%' }} ref={scrollBarRef}>
        <CustomerSideProfile
          agentTwitter={agentTwitterUser}
          customerTwitter={customerTwitterUser}
          customer={customer}
          hasLinkToDetail={hasLinkToDetail}
        >
          <TicketInformation ticket={ticket} />
          <CustomFieldsInformation ticket={ticket} scrollBarRef={scrollBarRef} />
          <HistoryTickets customerId={customer.id} />
        </CustomerSideProfile>
      </ScrollBar>
      <HistoryTicket ticket={ticket} />
      {isOpen && <RelatedChat />}
    </>
  );
});

const withRelatedChatContextProvider = (Component: typeof TicketInfoPanelComponent) => (props: Props) => (
  <RelatedChatContextProvider>
    <Component {...props} />
  </RelatedChatContextProvider>
);

export const TicketInfoPanel = withRelatedChatContextProvider(TicketInfoPanelComponent);
