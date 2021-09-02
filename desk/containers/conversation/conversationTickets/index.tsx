import React, { useEffect, useContext, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Dropdown, cssVariables, transitionDefault, Icon, IconButton } from 'feather';
import orderBy from 'lodash/orderBy';
import moment from 'moment-timezone';

import { TicketStatus, TicketType } from '@constants';
import {
  TicketSearchInput,
  TicketSearchQuery,
  TicketSearchInputType,
  TicketSearchType,
} from '@desk/containers/TicketSearchInput';
import { useShallowEqualSelector, useLatestValue } from '@hooks';
import { StyledProps } from '@ui';

import { DeskChatLayoutContext } from '../../DeskChatLayout';
import { AgentProfileConnection } from './AgentProfileConnection';
import { ConversationContext } from './conversationContext';
import {
  ConversationTicketsContext,
  AgentConversationTicketSortType,
  State as ConversationTicketsState,
} from './conversationTicketsContext';
import { Tickets } from './tickets';
import { usePolling } from './usePolling';
import { useWebSocketEventHandlers } from './useWebSocketEventHandlers';

const ConversationTicketsHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  z-index: 80;
  padding-top: 12px;
`;

// Troubleshooting: https://sendbird.atlassian.net/wiki/spaces/FEND/pages/133234978/Scroll+to+top+issue+in+flexible+layout
const TicketSidebarBodyWrapper = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
`;

const Filter = styled.div<StyledProps>`
  display: flex;
  flex: 1;
  align-items: center;
  opacity: ${(props) => (props.hide ? 0 : 1)};
  pointer-events: ${(props) => (props.hide ? 'none' : '')};
  transition: opacity 0.2s ${transitionDefault};
  will-change: opacity;
`;

const SortWrapper = styled.div<StyledProps>`
  display: flex;
  justify-content: center;
  align-self: center;
  opacity: ${(props) => (props.hide ? 0 : 1)};
  pointer-events: ${(props) => (props.hide ? 'none' : '')};
  transition: opacity 0.2s ${transitionDefault};
  will-change: opacity;
`;

const SortToggle = styled.div<{ isOpen: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  text-align: center;
  font-size: 13px;
  color: ${cssVariables('neutral-6')};

  svg {
    fill: ${(props) => (props.isOpen ? cssVariables('purple-7') : cssVariables('neutral-9'))};
    transition: fill 0.3s ${transitionDefault};
  }
`;

const CurrentFilterText = styled.span`
  padding-right: 4px;
  padding-left: 8px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.15px;
  color: ${cssVariables('neutral-10')};
`;

const StyledTicketSearchInput = styled(TicketSearchInput)<{ isSearchMode: boolean }>`
  opacity: ${({ isSearchMode }) => (isSearchMode ? 1 : 0)};
`;

const TicketSearchInputContainer = styled.div<{ isSearchMode: boolean }>`
  width: 100%;
  background: ${({ isSearchMode }) => (isSearchMode ? 'white' : 'transparent')};
  pointer-events: ${({ isSearchMode }) => (isSearchMode ? 'auto' : 'none')};
`;

type Props = {
  initialSearchQuery: { value: string; type: TicketSearchType };
  onSearch: (queries: TicketSearchQuery[]) => void;
  onResetSearch: () => void;
};

type ConversationFilterOption = {
  labelKey: string;
  value: TicketStatus;
};

interface AgentSortTypeOption {
  label: string;
  value: AgentConversationTicketSortType;
}

const ticketStatusLabelKeySet = {
  [TicketStatus.ACTIVE]: 'ui.ticketStatus.active',
  [TicketStatus.IDLE]: 'ui.ticketStatus.idle',
  [TicketStatus.WIP]: 'ui.ticketStatus.wip',
  [TicketStatus.CLOSED]: 'ui.ticketStatus.closed',
};

const ticketStatusCountKeySet: { [key in string]: keyof ConversationTicketsState['counts'] } = {
  [TicketStatus.ACTIVE]: 'active',
  [TicketStatus.IDLE]: 'idle',
  [TicketStatus.WIP]: 'wip',
};

const conversationFilterOptions: ConversationFilterOption[] = [
  {
    labelKey: ticketStatusLabelKeySet[TicketStatus.ACTIVE],
    value: TicketStatus.ACTIVE,
  },
  {
    labelKey: ticketStatusLabelKeySet[TicketStatus.IDLE],
    value: TicketStatus.IDLE,
  },
  {
    labelKey: ticketStatusLabelKeySet[TicketStatus.WIP],
    value: TicketStatus.WIP,
  },
  {
    labelKey: ticketStatusLabelKeySet[TicketStatus.CLOSED],
    value: TicketStatus.CLOSED,
  },
];

const sortTickets = ({
  sortType,
  tickets,
}: {
  sortType: ConversationTicketsContext['state']['sortType'];
  tickets: ReadonlyArray<Ticket>;
}) => {
  const order = sortType === AgentConversationTicketSortType.OLDEST ? 'asc' : 'desc';
  return orderBy(
    tickets,
    [
      (ticket) => {
        let compareValue = moment(ticket.createdAt).unix() || moment(ticket.issuedAt).unix();
        if (sortType === AgentConversationTicketSortType.RECENTLY_UPDATED) {
          compareValue = moment(ticket.lastMessageAt).unix() || moment(ticket.issuedAt).unix();
        }
        return compareValue;
      },
    ],
    [order],
  );
};

const useAgentInfo = () =>
  useShallowEqualSelector((state) => {
    const { id, connection, email, photoThumbnailUrl, displayName, tier, role } = state.desk.agent;
    return { id, connection, email, photoThumbnailUrl, displayName, tier, role };
  });

export const ConversationTickets = React.memo<Props>(({ initialSearchQuery, onSearch, onResetSearch }) => {
  const intl = useIntl();

  const { conversationTickets: conversationTicketsContext } = useContext(ConversationContext);

  useWebSocketEventHandlers();
  usePolling();

  const { id: agentId } = useAgentInfo();

  const {
    state: {
      isSearchMode,
      isSearched,
      filter,
      sortType,
      counts,
      searchedTickets,
      currentTickets,
      currentPagination,
      searchQuery,
      isFetching,
    },
    updateIsSearchMode,
    updateCurrentPagination,
    resetCurrentTickets,
    fetchCurrentTickets,
    resetSearch,
    fetchSearchTickets,
    fetchAssignedTickets,
    fetchAssignedTicketsCounts,
  } = conversationTicketsContext;

  const latestFilter = useLatestValue(filter);

  const tickets = useMemo(
    () => (isSearchMode ? [...searchedTickets] : sortTickets({ sortType, tickets: currentTickets })),
    [currentTickets, isSearchMode, searchedTickets, sortType],
  );

  useEffect(() => {
    // if agentId changes, reload ticket counts
    fetchAssignedTicketsCounts({ agentId });
  }, [agentId, fetchAssignedTicketsCounts]);

  useEffect(() => {
    // if the number of active/idle ticket changes, reload assigned tickets
    fetchAssignedTickets({ agentId });
  }, [agentId, counts.active, counts.idle, fetchAssignedTickets]);

  useEffect(() => {
    // when agentId changed, fetch tickets (only if isSearchMode = false)
    if (!isSearchMode) {
      fetchCurrentTickets({ agentId, filter: latestFilter.current, offset: 0 });
    }
  }, [agentId, fetchCurrentTickets, isSearchMode, latestFilter]);

  const handleFilterChange = (nextFilter) => {
    // when filter changed, fetch tickets
    updateCurrentPagination({ page: 1 });
    fetchCurrentTickets({ agentId, filter: nextFilter, offset: 0 });
  };

  const handleSortItemChange = useCallback(
    (sortType: AgentSortTypeOption) => {
      fetchCurrentTickets({ agentId, sortType: sortType.value, offset: 0 });
      updateCurrentPagination({ page: 1 });
    },
    [agentId, fetchCurrentTickets, updateCurrentPagination],
  );

  const handleSearchButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e && e.preventDefault();
    if (!isSearchMode) {
      updateIsSearchMode(true);
      resetCurrentTickets();
    }
  };

  const handleSearchBackButtonClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e && e.preventDefault();
    resetSearch();
    onResetSearch();
  };

  const handleTicketsLoadMore = useCallback(() => {
    const { page, pageSize } = currentPagination;
    const total = isSearchMode ? counts.search : counts[filter.value.toLowerCase()];
    if (page * pageSize < total) {
      updateCurrentPagination({ page: page + 1 });
      if (isSearchMode) {
        fetchSearchTickets({
          offset: page * pageSize,
          isLoadMore: true,
          query: searchQuery,
          ticketType: TicketType.CUSTOMER_CHAT,
        });
      } else {
        fetchCurrentTickets({
          agentId,
          offset: page * pageSize,
          isLoadMore: true,
        });
      }
    }
  }, [
    currentPagination,
    isSearchMode,
    counts,
    filter.value,
    updateCurrentPagination,
    fetchSearchTickets,
    searchQuery,
    fetchCurrentTickets,
    agentId,
  ]);

  const handleSearchResetButtonClick: (event: React.MouseEvent<HTMLElement>) => void = (event) => {
    event.preventDefault();
    resetSearch({ shouldReset: { isSearchMode: false } });
    onResetSearch();
  };

  const currentCounts = currentPagination.page * currentPagination.pageSize;
  const total = isSearchMode ? counts.search : counts[filter.value.toLowerCase()];
  const isLoadMore = currentCounts < total;
  const sortTypeOptions = [
    {
      label: intl.formatMessage({ id: 'desk.conversation.sorter.label.newest' }),
      value: AgentConversationTicketSortType.NEWEST,
    },
    {
      label: intl.formatMessage({ id: 'desk.conversation.sorter.label.oldest' }),
      value: AgentConversationTicketSortType.OLDEST,
    },
    {
      label: intl.formatMessage({ id: 'desk.conversation.sorter.label.recentlyUpdated' }),
      value: AgentConversationTicketSortType.RECENTLY_UPDATED,
    },
  ];

  return (
    <DeskChatLayoutContext.Consumer>
      {({ TicketSidebarHeaderGridItem, TicketSidebarBodyGridItem, TicketSidebarFooterGridItem }) => (
        <>
          <TicketSidebarHeaderGridItem
            styles={css`
              padding: 0 8px;
            `}
          >
            <ConversationTicketsHeaderWrapper>
              {isSearchMode ? (
                <TicketSearchInputContainer isSearchMode={isSearchMode}>
                  <StyledTicketSearchInput
                    inputType={TicketSearchInputType.Inline}
                    placeholder={intl.formatMessage({ id: 'desk.tickets.search.placeholder.collapsed' })}
                    initialSearchQuery={initialSearchQuery}
                    isSearchMode={isSearchMode}
                    showResetButton={searchQuery.length > 0}
                    backButtonProps={{ icon: 'list-back', onClick: handleSearchBackButtonClick }}
                    onSearch={onSearch}
                    onResetButtonClick={handleSearchResetButtonClick}
                  />
                </TicketSearchInputContainer>
              ) : (
                <>
                  <Filter hide={isSearchMode} data-test-id="ConversationTicketsFilter">
                    <Dropdown<ConversationFilterOption>
                      items={conversationFilterOptions}
                      itemToString={(item) => intl.formatMessage({ id: item.labelKey })}
                      itemToElement={(item) =>
                        `${intl.formatMessage({ id: ticketStatusLabelKeySet[item.value] })} ${
                          item.value === TicketStatus.CLOSED ? '' : `(${counts[ticketStatusCountKeySet[item.value]]})`
                        }`
                      }
                      toggleRenderer={({ selectedItem }) =>
                        selectedItem && (
                          <CurrentFilterText>
                            {intl.formatMessage({ id: selectedItem.labelKey })}{' '}
                            {selectedItem.value !== TicketStatus.CLOSED &&
                              `(${counts[ticketStatusCountKeySet[selectedItem.value]]})`}
                          </CurrentFilterText>
                        )
                      }
                      placement="bottom-start"
                      showArrow={true}
                      variant="inline"
                      size="small"
                      selectedItem={filter}
                      onChange={handleFilterChange}
                    />
                  </Filter>
                  <SortWrapper hide={isSearchMode}>
                    <Dropdown<AgentSortTypeOption>
                      placement="bottom-end"
                      items={sortTypeOptions}
                      itemToString={(item) => item.label}
                      itemToElement={(item) => item.label}
                      toggleRenderer={({ isOpen }) => (
                        <SortToggle isOpen={isOpen}>
                          <Icon icon="list-sorting" size={20} />
                        </SortToggle>
                      )}
                      variant="inline"
                      size="small"
                      selectedItem={sortTypeOptions.find((item) => item.value === sortType)}
                      onChange={handleSortItemChange}
                    />
                  </SortWrapper>
                  <IconButton
                    data-test-id="SearchIconButton"
                    buttonType="secondary"
                    icon="search"
                    size="small"
                    onClick={handleSearchButtonClick}
                  />
                </>
              )}
            </ConversationTicketsHeaderWrapper>
          </TicketSidebarHeaderGridItem>
          <TicketSidebarBodyGridItem>
            <TicketSidebarBodyWrapper>
              <Tickets
                tickets={tickets}
                isSearchMode={isSearchMode}
                isSearched={isSearched}
                isLoadMore={isLoadMore}
                isFetching={isFetching}
                query={searchQuery}
                onLoadMore={handleTicketsLoadMore}
              />
            </TicketSidebarBodyWrapper>
          </TicketSidebarBodyGridItem>
          <TicketSidebarFooterGridItem
            styles={`
              display: flex;
              align-items: center;
              position: relative;
              z-index: 30;
              padding: 0 16px;
            `}
          >
            <AgentProfileConnection />
          </TicketSidebarFooterGridItem>
        </>
      )}
    </DeskChatLayoutContext.Consumer>
  );
});
