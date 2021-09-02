import React, { createContext, useState, useMemo, useCallback } from 'react';

import { DateRange, DateRangePickerValue } from 'feather';
import moment from 'moment-timezone';

import { TicketStatus, LIST_LIMIT, TicketSortBy, SortOrder } from '@constants';

import { TicketSearchType } from '../TicketSearchInput';

type StateAndStateUpdater<T, SK extends string, UK extends string> = { [key in SK]: T } &
  { [key in UK]: (value: T) => void };

type Team = AgentGroup<'listItem'>;
type Assignee = { agent?: Agent; team?: Team };

export type TicketsContextValue = StateAndStateUpdater<boolean, 'isFetching', 'setIsFetching'> &
  StateAndStateUpdater<TicketStatus, 'ticketStatus', 'setTicketStatus'> &
  StateAndStateUpdater<Assignee | undefined, 'assignee', 'setAssignee'> &
  StateAndStateUpdater<TicketChannelType[], 'channelTypes', 'setChannelTypes'> &
  StateAndStateUpdater<TicketTag[], 'tags', 'setTags'> &
  StateAndStateUpdater<Priority | undefined, 'priority', 'setPriority'> &
  StateAndStateUpdater<{ range: DateRange; value: DateRangePickerValue } | undefined, 'dateRange', 'setDateRange'> &
  StateAndStateUpdater<readonly Ticket[], 'tickets', 'setTickets'> &
  StateAndStateUpdater<string, 'searchQuery', 'setSearchQuery'> &
  StateAndStateUpdater<Omit<LimitOffsetPagination, 'count'>, 'pagination', 'setPagination'> &
  StateAndStateUpdater<number, 'ticketCount', 'setTicketCount'> &
  StateAndStateUpdater<Sorter<TicketSortBy>, 'ticketSorter', 'setTicketSorter'> &
  StateAndStateUpdater<boolean, 'isSearchMode', 'setIsSearchMode'> & {
    isSearched: boolean;
    getSorterParams: (sorter: TicketSortBy, sortOrder: SortOrder) => string;
    updateTicketInList: (ticket: Ticket, payload?: Partial<Ticket>) => void;
    resetSearch: () => void;
  } & StateAndStateUpdater<TicketSearchType | null, 'currentSearchedType', 'setCurrentSearchedType'>;

const initValue: TicketsContextValue = {
  isFetching: false,
  ticketStatus: TicketStatus.ALL,
  assignee: undefined,
  channelTypes: [],
  tags: [],
  priority: undefined,
  dateRange: {
    range: { startDate: moment().subtract(29, 'days'), endDate: moment() },
    value: DateRangePickerValue.Last30Days,
  },
  tickets: [],
  searchQuery: '',
  currentSearchedType: null,
  pagination: {
    limit: LIST_LIMIT,
    offset: 0,
    page: 1,
  },
  ticketCount: 0,
  ticketSorter: {
    sortBy: TicketSortBy.CREATED,
    order: SortOrder.DESCEND,
  },
  isSearchMode: false,
  isSearched: false,

  setIsFetching: () => {},
  setTicketStatus: () => {},
  setAssignee: () => {},
  setChannelTypes: () => {},
  setTags: () => {},
  setPriority: () => {},
  setDateRange: () => {},
  setTickets: () => {},
  setSearchQuery: () => {},
  setCurrentSearchedType: () => {},
  setPagination: () => {},
  setTicketCount: () => {},
  setTicketSorter: () => {},
  setIsSearchMode: () => {},
  getSorterParams: () => '',
  updateTicketInList: () => {},
  resetSearch: () => {},
};

export const TicketsContext = createContext<TicketsContextValue>(initValue);

export const TicketsContextProvider: React.FC<{ value?: Partial<TicketsContextValue> }> = ({ children, value }) => {
  const [isFetching, setIsFetching] = useState<TicketsContextValue['isFetching']>(initValue.isFetching);
  const [ticketStatus, setTicketStatus] = useState<TicketsContextValue['ticketStatus']>(initValue.ticketStatus);
  const [assignee, setAssignee] = useState<TicketsContextValue['assignee']>(initValue.assignee);
  const [channelTypes, setChannelTypes] = useState<TicketsContextValue['channelTypes']>(initValue.channelTypes);
  const [tags, setTags] = useState<TicketsContextValue['tags']>(initValue.tags);
  const [priority, setPriority] = useState<TicketsContextValue['priority']>(initValue.priority);
  const [dateRange, setDateRange] = useState<TicketsContextValue['dateRange']>(initValue.dateRange);
  const [defaultTickets, setDefaultTickets] = useState<TicketsContextValue['tickets']>(initValue.tickets);
  const [searchedTickets, setSearchedTickets] = useState<TicketsContextValue['tickets']>(initValue.tickets);
  const [searchQuery, setSearchQuery] = useState<TicketsContextValue['searchQuery']>(initValue.searchQuery);
  const [currentSearchedType, setCurrentSearchedType] = useState<TicketsContextValue['currentSearchedType']>(
    initValue.currentSearchedType,
  );
  const [defaultPagination, setDefaultPagination] = useState<TicketsContextValue['pagination']>(initValue.pagination);
  const [searchPagination, setSearchPagination] = useState<TicketsContextValue['pagination']>(initValue.pagination);
  const [defaultTicketCount, setDefaultTicketCount] = useState<TicketsContextValue['ticketCount']>(
    initValue.ticketCount,
  );
  const [searchedTicketCount, setSearchedTicketCount] = useState<TicketsContextValue['ticketCount']>(
    initValue.ticketCount,
  );
  const [ticketSorter, setTicketSorter] = useState<TicketsContextValue['ticketSorter']>(initValue.ticketSorter);
  const [isSearchMode, setIsSearchMode] = useState<TicketsContextValue['isSearchMode']>(initValue.isSearchMode);

  const isSearched = useMemo(() => isSearchMode && searchQuery !== '', [isSearchMode, searchQuery]);

  const tickets = useMemo(() => (isSearchMode ? searchedTickets : defaultTickets), [
    isSearchMode,
    searchedTickets,
    defaultTickets,
  ]);

  const setTickets = useMemo(() => (isSearched ? setSearchedTickets : setDefaultTickets), [isSearched]);

  const ticketCount = useMemo(() => (isSearchMode ? searchedTicketCount : defaultTicketCount), [
    isSearchMode,
    searchedTicketCount,
    defaultTicketCount,
  ]);
  const setTicketCount = useMemo(() => (isSearched ? setSearchedTicketCount : setDefaultTicketCount), [isSearched]);

  const pagination = useMemo(() => (isSearched ? searchPagination : defaultPagination), [
    isSearched,
    defaultPagination,
    searchPagination,
  ]);
  const setPagination = useMemo(() => (isSearched ? setSearchPagination : setDefaultPagination), [isSearched]);

  const updateTicketInList = useCallback(
    (ticket: Ticket, payload?: Partial<Ticket>) => {
      const idx = tickets.findIndex((item) => item.id === ticket.id);
      if (idx !== -1) {
        setTickets([...tickets.slice(0, idx), { ...ticket, ...payload }, ...tickets.slice(idx + 1)]);
      }
    },
    [setTickets, tickets],
  );

  const getSorterParams = useCallback(
    (sorter: TicketSortBy, sortOrder: SortOrder) => (sortOrder === SortOrder.ASCEND ? String(sorter) : `-${sorter}`),
    [],
  );

  const resetSearch = useCallback(() => {
    setSearchQuery('');
    setSearchedTickets(initValue.tickets);
    setSearchedTicketCount(initValue.ticketCount);
    setSearchPagination({ ...initValue.pagination, limit: pagination.limit });
  }, [pagination.limit]);

  return (
    <TicketsContext.Provider
      value={{
        isFetching,
        ticketStatus,
        assignee,
        channelTypes,
        tags,
        priority,
        dateRange,
        tickets,
        searchQuery,
        currentSearchedType,
        pagination,
        ticketCount,
        ticketSorter,
        isSearchMode,
        isSearched,

        setIsFetching,
        setTicketStatus,
        setAssignee,
        setChannelTypes,
        setTags,
        setPriority,
        setDateRange,
        setTickets,
        setSearchQuery,
        setCurrentSearchedType,
        setPagination,
        setTicketCount,
        setTicketSorter,
        setIsSearchMode,

        getSorterParams,
        updateTicketInList,
        resetSearch,
        ...value,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
};
