import { useReducer, useMemo, useCallback, Dispatch, useEffect, useRef } from 'react';

import { toast } from 'feather';
import find from 'lodash/find';
import uniqby from 'lodash/uniqBy';

import { TicketStatus, TicketType } from '@constants';
import { fetchTickets, fetchAgentTicketCounts } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

export type State = {
  counts: {
    search: number;
    active: number;
    idle: number;
    wip: MonitorState['currentWipTicketCount'];
    closed: number;
  };
  sortType: AgentConversationTicketSortType;
  filter: {
    labelKey: string;
    value: TicketStatus;
  };
  isFetching: boolean;
  isSearchMode: boolean;
  isSearched: boolean;
  assignedTickets: ReadonlyArray<Ticket>; // all assigned (ACTIVE, IDLE) tickets
  searchQuery: string;
  searchedTickets: ReadonlyArray<Ticket>;
  currentTickets: ReadonlyArray<Ticket>; // filtered ticket list
  currentChannels: CurrentChannels | undefined;
  currentPagination: {
    page: number;
    pageSize: PerPage | 30;
  };
};

type Action = { [P in keyof State]?: State[P] };

export enum AgentConversationTicketSortType {
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
  RECENTLY_UPDATED = 'RECENTLY_UPDATED',
}

interface UpdateTickets {
  (params: { ticket: Ticket }): void;
}

interface ResetCurrentTickets {
  (): void;
}

interface UpdateTicketsAssignment {
  ({ assignment }: { assignment: Assignment }): void;
}

interface CurrentChannels {
  [key: string]: SendBird.GroupChannel;
}

interface GetCurrentChannels {
  ({ tickets }: { tickets: ReadonlyArray<Ticket> }): Promise<CurrentChannels>;
}

interface InitCurrentChannels {
  ({ tickets }: { tickets: ReadonlyArray<Ticket> }): void;
}

interface ToggleIsSearchMode {
  (): void;
}

interface UpdateIsSearchMode {
  (isSearchMode: boolean): void;
}

interface UpdateIsSearched {
  (isSearched: boolean): void;
}

interface UpdateSearchQuery {
  (query: string): void;
}

interface UpdateCounts {
  (counts: { search?: number; active?: number; idle?: number; wip?: number; closed?: number }): void;
}

interface UpdateCurrentPagination {
  (currentPagination: { page: number; pageSize?: number }): void;
}

interface FetchCurrentTickets {
  (payload: {
    agentId?: Agent['id'];
    filter?: State['filter'];
    sortType?: State['sortType'];
    order?: string;
    limit?: number;
    offset?: number;
    isLoadMore?: boolean;
  }): void;
}

interface ResetSearch {
  (options?: { shouldReset?: Partial<Record<'isSearchMode' | 'isSearched', boolean>> }): void;
}

interface FetchSearchTickets {
  (payload: { limit?: number; offset?: number; query: string; isLoadMore?: boolean; ticketType?: TicketType }): void;
}

interface FetchAssignedTickets {
  (payload: { limit?: number; offset?: number; order?: string; agentId: Agent['id'] }): void;
}

interface FetchAssignedTicketsCounts {
  (payload: { agentId: Agent['id'] }): void;
}

export type ConversationTicketsContext = {
  state: State;
  setState: Dispatch<Action>;
  toggleIsSearchMode: ToggleIsSearchMode;
  updateIsSearchMode: UpdateIsSearchMode;
  updateIsSearched: UpdateIsSearched;
  updateSearchQuery: UpdateSearchQuery;
  updateFilter: (filter?: State['filter']) => void;
  updateSortType: (sortType?: State['sortType']) => void;
  updateCounts: UpdateCounts;
  updateCurrentPagination: UpdateCurrentPagination;
  initCurrentChannels: InitCurrentChannels;
  addTickets: UpdateTickets;
  updateTickets: UpdateTickets;
  updateTicketsAssignment: UpdateTicketsAssignment;
  removeFromCurrentTickets: UpdateTickets;
  resetCurrentTickets: ResetCurrentTickets;
  resetSearch: ResetSearch;
  fetchCurrentTickets: FetchCurrentTickets;
  fetchSearchTickets: FetchSearchTickets;
  fetchAssignedTickets: FetchAssignedTickets;
  fetchAssignedTicketsCounts: FetchAssignedTicketsCounts;
};

export const initialState: State = {
  counts: {
    search: 0,
    active: 0,
    idle: 0,
    wip: 0,
    closed: 0,
  },
  sortType: AgentConversationTicketSortType.NEWEST,
  filter: {
    labelKey: 'ui.ticketStatus.active',
    value: TicketStatus.ACTIVE,
  },
  isFetching: false,
  isSearchMode: false,
  isSearched: false,
  assignedTickets: [],
  searchQuery: '',
  searchedTickets: [],
  currentTickets: [],
  currentChannels: undefined,
  currentPagination: {
    page: 1,
    pageSize: 30,
  },
};

interface GetOrderBySortType {
  (sortType: AgentConversationTicketSortType): string;
}

export const getOrderBySortType: GetOrderBySortType = (sortTypeValue) => {
  switch (sortTypeValue) {
    case AgentConversationTicketSortType.NEWEST:
      return '-created_at';

    case AgentConversationTicketSortType.OLDEST:
      return 'created_at';

    case AgentConversationTicketSortType.RECENTLY_UPDATED:
      return '-last_message_at';

    default:
      return '-created_at';
  }
};

const reducer: Reducer<State, Action> = (prevState, updatedProperty) => ({
  ...prevState,
  ...updatedProperty,
});

export const useConversationTickets = (): ConversationTicketsContext => {
  const [state, setState] = useReducer(reducer, initialState);
  const prevState = useRef(state);

  useEffect(() => {
    prevState.current = state;
  }, [state]);

  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const updateFilter = useCallback(
    (filter: State['filter']) => {
      if (state.filter.labelKey !== filter.labelKey && state.filter.value !== filter.value) {
        setState({ filter });
      }
    },
    [state.filter],
  );

  const updateSortType = useCallback(
    (sortType: State['sortType']) => {
      if (state.sortType !== sortType) {
        setState({ sortType });
      }
    },
    [state.sortType],
  );

  const updateCounts: UpdateCounts = useCallback(({ search, active, idle, wip, closed }) => {
    setState({
      counts: {
        search: search !== undefined && search > -1 ? search : prevState.current.counts.search,
        active: active !== undefined && active > -1 ? active : prevState.current.counts.active,
        idle: idle !== undefined && idle > -1 ? idle : prevState.current.counts.idle,
        wip: wip !== undefined && wip > -1 ? wip : prevState.current.counts.wip,
        closed: closed !== undefined && closed > -1 ? closed : prevState.current.counts.closed,
      },
    });
  }, []);

  const toggleIsSearchMode: ToggleIsSearchMode = useCallback(() => {
    setState({
      isSearchMode: !prevState.current.isSearchMode,
    });
  }, []);

  const updateIsSearchMode: UpdateIsSearchMode = useCallback((isSearchMode) => {
    if (prevState.current.isSearchMode !== isSearchMode) {
      setState({
        isSearchMode,
      });
    }
  }, []);

  const updateIsSearched: UpdateIsSearched = useCallback((isSearched) => {
    setState({ isSearched });
  }, []);

  const updateSearchQuery: UpdateSearchQuery = useCallback((query) => {
    setState({
      searchQuery: query,
    });
  }, []);

  const updateCurrentPagination: UpdateCurrentPagination = useCallback(({ page, pageSize }) => {
    setState({
      currentPagination: {
        page: page || prevState.current.currentPagination.page,
        pageSize: (pageSize as PerPage) || prevState.current.currentPagination.pageSize,
      },
    });
  }, []);

  const getCurrentChannels: GetCurrentChannels = async ({ tickets }) => {
    const channelsList = await Promise.all(
      tickets
        .filter(
          (ticket) =>
            (ticket.channelType === 'SENDBIRD' ||
              ticket.channelType === 'SENDBIRD_JAVASCRIPT' ||
              ticket.channelType === 'SENDBIRD_IOS' ||
              ticket.channelType === 'SENDBIRD_ANDROID') &&
            ticket.status2 !== TicketStatus.CLOSED,
        )
        .map(
          (ticket) =>
            new Promise<SendBird.GroupChannel | undefined>((resolve) => {
              window.dashboardSB.GroupChannel.getChannel(ticket.channelUrl)
                .then(resolve)
                .catch(() => resolve(undefined));
            }),
        ),
    );

    return channelsList
      .filter((channel): channel is SendBird.GroupChannel => channel != null)
      .reduce<CurrentChannels>((acc, channel) => {
        acc[channel.url] = channel;
        return acc;
      }, {});
  };

  const initCurrentChannels: InitCurrentChannels = useCallback(async ({ tickets }) => {
    setState({ currentChannels: await getCurrentChannels({ tickets }) });
  }, []);

  const addTickets: UpdateTickets = useCallback(({ ticket }) => {
    if (!find(prevState.current.currentTickets, ['id', ticket.id])) {
      setState({
        currentTickets: prevState.current.currentTickets.concat(ticket),
      });
    }
    if (!find(prevState.current.assignedTickets, ['id', ticket.id])) {
      setState({
        assignedTickets: prevState.current.assignedTickets.concat(ticket),
      });
    }
  }, []);

  const updateTickets: UpdateTickets = useCallback(({ ticket }) => {
    setState({
      currentTickets: prevState.current.currentTickets.map((prevCurrentTicket) => {
        if (prevCurrentTicket.id === ticket.id) {
          return ticket;
        }
        return prevCurrentTicket;
      }),
      assignedTickets: prevState.current.assignedTickets.map((prevAssignedTicket) => {
        if (prevAssignedTicket.id === ticket.id) {
          return ticket;
        }
        return prevAssignedTicket;
      }),
    });
  }, []);

  const updateTicketsAssignment: UpdateTicketsAssignment = useCallback(({ assignment }) => {
    setState({
      currentTickets: prevState.current.currentTickets.map((prevCurrentTicket) => {
        if (prevCurrentTicket.id === assignment.assignedTicket) {
          return { ...prevCurrentTicket, recentAssignment: assignment };
        }
        return prevCurrentTicket;
      }),
      assignedTickets: prevState.current.assignedTickets.map((prevAssignedTicket) => {
        if (prevAssignedTicket.id === assignment.assignedTicket) {
          return { ...prevAssignedTicket, recentAssignment: assignment };
        }
        return prevAssignedTicket;
      }),
    });
  }, []);

  const removeFromCurrentTickets: UpdateTickets = useCallback(({ ticket }) => {
    setState({
      currentTickets: prevState.current.currentTickets.filter((prevCurrentTicket) => {
        return prevCurrentTicket.id !== ticket.id;
      }),
    });
  }, []);

  const resetCurrentTickets: ResetCurrentTickets = useCallback(() => {
    setState({
      currentTickets: [],
      currentPagination: {
        ...prevState.current.currentPagination,
        page: 1,
      },
      counts: {
        ...prevState.current.counts,
        search: 0,
      },
    });
  }, []);

  const fetchCurrentTickets: FetchCurrentTickets = useCallback(
    async (payload) => {
      const offset =
        typeof payload.offset === 'number' && payload.offset > -1
          ? payload.offset
          : (prevState.current.currentPagination.page - 1) * prevState.current.currentPagination.pageSize;
      const limit = payload.limit || prevState.current.currentPagination.pageSize;
      const order = payload.sortType
        ? getOrderBySortType(payload.sortType)
        : getOrderBySortType(prevState.current.sortType);
      const filter = (payload.filter && payload.filter.value) || prevState.current.filter.value;

      const parameters = {
        limit,
        offset,
        status2:
          filter === TicketStatus.ALL
            ? [TicketStatus.ACTIVE, TicketStatus.IDLE, TicketStatus.PENDING, TicketStatus.WIP, TicketStatus.CLOSED]
            : filter,
        order,
      };
      if (payload.agentId && filter !== TicketStatus.WIP) {
        parameters['agent'] = payload.agentId;
      }

      setState({ isFetching: true });

      try {
        const { data } = await fetchTickets(pid, region, parameters);
        const responsedChannels = await getCurrentChannels({ tickets: data.results });
        const countKey = filter === TicketStatus.WIP ? 'wip' : filter.toLowerCase();

        setState({
          isFetching: false,
          isSearched: false,
          counts: {
            ...prevState.current.counts,
            [countKey]: data.count,
          },
          filter: payload.filter || prevState.current.filter,
          sortType: payload.sortType || prevState.current.sortType,
          currentTickets: payload.isLoadMore
            ? uniqby([...prevState.current.currentTickets, ...data.results], 'id')
            : data.results,
          currentChannels: payload.isLoadMore
            ? Object.assign(prevState.current.currentTickets, responsedChannels)
            : responsedChannels,
        });
      } catch (error) {
        setState({
          isFetching: false,
          isSearched: false,
        });
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, pid, region],
  );

  const resetSearch: ResetSearch = useCallback((options) => {
    const targets = { isSearchMode: true, isSearched: true, ...options?.shouldReset };
    setState(
      Object.keys(targets).reduce((state, key) => (targets[key] ? { ...state, [key]: initialState[key] } : state), {
        searchQuery: '',
        searchedTickets: [],
      }),
    );
  }, []);

  const fetchSearchTickets: FetchSearchTickets = useCallback(
    async ({ limit, offset = 0, query, isLoadMore, ticketType }) => {
      const offsetParam =
        typeof offset === 'number' && offset > -1
          ? offset
          : (prevState.current.currentPagination.page - 1) * prevState.current.currentPagination.pageSize;
      const limitParam = limit || prevState.current.currentPagination.pageSize;
      const parameters = {
        limit: limitParam,
        offset: offsetParam,
        order: '-created_at',
        q: query,
        status2: [TicketStatus.ACTIVE, TicketStatus.IDLE, TicketStatus.PENDING, TicketStatus.WIP, TicketStatus.CLOSED],
        ticket_type: ticketType,
      };

      setState({ isFetching: true });
      try {
        const { data } = await fetchTickets(pid, region, parameters);
        const responsedChannels = await getCurrentChannels({ tickets: data.results });
        setState({
          counts: {
            ...prevState.current.counts,
            search: data.count,
          },
          searchQuery: query,
          isFetching: false,
          isSearched: true,
          searchedTickets: isLoadMore ? [...prevState.current.searchedTickets, ...data.results] : data.results,
          currentChannels: isLoadMore
            ? Object.assign(prevState.current.searchedTickets, responsedChannels)
            : responsedChannels,
        });
      } catch (error) {
        setState({
          isFetching: false,
          isSearched: false,
        });
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, pid, region],
  );

  const fetchAssignedTickets: FetchAssignedTickets = useCallback(
    async ({ limit = 0, offset = 0, agentId }) => {
      try {
        const { data } = await fetchTickets(pid, region, {
          limit,
          offset,
          order: 'created_at',
          agent: agentId,
          status2: [TicketStatus.ACTIVE, TicketStatus.IDLE],
        });
        setState({
          isFetching: false,
          assignedTickets: data.results,
        });
      } catch (error) {
        setState({
          isFetching: false,
        });
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, pid, region],
  );

  const fetchAssignedTicketsCounts: FetchAssignedTicketsCounts = useCallback(
    async ({ agentId }) => {
      try {
        const {
          data: { active, idle },
        } = await fetchAgentTicketCounts(pid, region, { agentId });
        setState({
          counts: {
            ...prevState.current.counts,
            active,
            idle,
          },
        });
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, pid, region],
  );

  return useMemo(
    () => ({
      state,
      setState,

      toggleIsSearchMode,
      updateIsSearchMode,
      updateIsSearched,
      updateSearchQuery,
      updateFilter,
      updateSortType,
      updateCounts,
      updateCurrentPagination,

      initCurrentChannels,

      addTickets,
      updateTickets,
      updateTicketsAssignment,
      removeFromCurrentTickets,
      resetCurrentTickets,
      fetchCurrentTickets,
      resetSearch,
      fetchSearchTickets,
      fetchAssignedTickets,
      fetchAssignedTicketsCounts,
    }),
    [
      state,
      setState,

      toggleIsSearchMode,
      updateIsSearchMode,
      updateIsSearched,
      updateSearchQuery,
      updateFilter,
      updateSortType,
      updateCounts,
      updateCurrentPagination,

      initCurrentChannels,

      addTickets,
      updateTickets,
      updateTicketsAssignment,
      removeFromCurrentTickets,
      resetCurrentTickets,
      fetchCurrentTickets,
      resetSearch,
      fetchSearchTickets,
      fetchAssignedTickets,
      fetchAssignedTicketsCounts,
    ],
  );
};
