import { useCallback, useState, useEffect, useMemo, memo } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { cssVariables, ScrollBar, Button } from 'feather';
import qs from 'qs';

import { IS_INTEGER_REGEX } from '@constants';
import { TicketSearchURLQuery } from '@desk/containers/TicketSearchInput';
import { useAppId } from '@hooks';
import { SpinnerFull } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { TicketItem } from './ticketItem';

const TicketsLoadMore = styled.div`
  margin: 8px;
`;

const TicketsLoadMoreButton = styled(Button)`
  width: 100%;
`;

const EmptyTable = styled.div`
  display: table;
  overflow: hidden;
  width: 100%;
  height: 100%;
`;

const EmptyTableCell = styled.div`
  display: table-cell;
  padding: 0 8px;
  vertical-align: middle;
  text-align: center;
`;

const NoTicketHeader = styled.div`
  font-size: 16px;
  color: ${cssVariables('neutral-8')};
  margin-bottom: 8px;
`;

const NoTicketDescription = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-6')};
`;

const mapStateToProps = (state: RootState, ownProps: { tickets: Ticket[] }) => {
  return {
    agent: state.desk.agent,
    conversation: state.conversation,
    tickets: ownProps.tickets,
  };
};

type OwnProps = {
  isSearchMode: boolean;
  isSearched: boolean;
  isLoadMore: boolean;
  isFetching: boolean;
  query?: string;
  onLoadMore: () => void;
};

type StoreProps = ReturnType<typeof mapStateToProps>;

type Props = OwnProps & StoreProps;

const TicketsComponent: React.FC<Props> = memo(
  ({ agent, isLoadMore, isSearchMode, isSearched, conversation, tickets, onLoadMore, isFetching }) => {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const appId = useAppId();
    const [currentQuery, setCurrentQuery] = useState<TicketSearchURLQuery[keyof TicketSearchURLQuery][] | string>([]);

    const noMatchDescription = useMemo(() => {
      if (typeof currentQuery === 'string') {
        return intl.formatMessage({ id: 'desk.tickets.search.manual.noMatch.description' }, { query: currentQuery });
      }
      if (Array.isArray(currentQuery) && currentQuery.length === 1) {
        return intl.formatMessage({ id: 'desk.tickets.search.singleFilter.noMatch.description' });
      }
      return intl.formatMessage({ id: 'desk.tickets.search.multiFilters.noMatch.description' });
    }, [currentQuery, intl]);

    const { ticket: conversationTicket } = conversation;
    const conversationTicketId = conversationTicket && conversationTicket.id;

    const ticketClickHandler = useCallback(
      (ticket: Ticket) => {
        const url = `/${appId}/desk/conversation/${ticket.id}${location.search}`;

        history.push(url, {
          forceReload: ticket.id === conversationTicketId, // reload iframe only same ticket
        });
      },
      [appId, location.search, history, conversationTicketId],
    );

    let ticketItems: React.ReactNode | React.ReactNode[];
    if (tickets.length > 0) {
      ticketItems = tickets.map((ticket) =>
        ticket ? (
          <TicketItem
            key={`conversation_ticket_${ticket.id}`}
            ticket={ticket}
            agentId={agent.id}
            isActive={ticket.id === conversationTicketId}
            ticketClickHandler={ticketClickHandler}
          />
        ) : (
          ''
        ),
      );
    } else if (isSearchMode) {
      ticketItems = isSearched ? (
        <CenteredEmptyState
          icon="no-search"
          title={intl.formatMessage({ id: 'desk.tickets.search.noMatch.title' })}
          description={noMatchDescription}
        />
      ) : (
        <CenteredEmptyState
          icon="tickets"
          title={intl.formatMessage({ id: 'desk.tickets.search.title' })}
          description={intl.formatMessage({ id: 'desk.tickets.search.description' }, { break: <br /> })}
        />
      );
    } else {
      ticketItems = (
        <EmptyTable>
          <EmptyTableCell>
            <NoTicketHeader>{intl.formatMessage({ id: 'desk.conversation.ticketList.noItem' })}</NoTicketHeader>
            <NoTicketDescription>
              {intl.formatMessage({ id: 'desk.conversation.ticketList.noItem.desc' })}
            </NoTicketDescription>
          </EmptyTableCell>
        </EmptyTable>
      );
    }

    useEffect(() => {
      if (location.search !== '') {
        const { q } = qs.parse(location.search, { ignoreQueryPrefix: true });
        const urlQuery: TicketSearchURLQuery = qs.parse(q);
        if (Object.keys(urlQuery).some((queryId) => IS_INTEGER_REGEX.test(queryId.trim()))) {
          setCurrentQuery(Object.values(urlQuery));
        } else {
          setCurrentQuery(q);
        }
      }
    }, [location.search]);

    return (
      <ScrollBar options={{ suppressScrollX: true }}>
        {isFetching && <SpinnerFull transparent={true} />}
        {ticketItems}
        {isLoadMore && tickets.length > 0 ? (
          <TicketsLoadMore>
            <TicketsLoadMoreButton buttonType="tertiary" size="small" onClick={onLoadMore}>
              {intl.formatMessage({ id: 'desk.conversation.ticketList.loadMore.button' })}
            </TicketsLoadMoreButton>
          </TicketsLoadMore>
        ) : null}
      </ScrollBar>
    );
  },
);

export const Tickets = connect(mapStateToProps)(TicketsComponent);
