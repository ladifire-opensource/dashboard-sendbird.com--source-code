import React, { useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Route, Switch, useRouteMatch, useHistory } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import qs from 'qs';

import { commonActions, deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SortOrder } from '@constants';
import { useTickets, usePrevious, useLatestValue } from '@hooks';
import { useQueryString } from '@hooks/useQueryString';

import { DeskChatLayout } from '../DeskChatLayout';
import {
  TicketSearchQuery,
  getTicketSearchQueryString,
  getTicketSearchURLQueryString,
  TicketSearchType,
} from '../TicketSearchInput';
import { TicketDetail } from '../ticketDetail';
import { ContractedTicketList } from './contractedTicketList';
import { TicketsContext } from './ticketsContext';
import { TicketsWrapper } from './ticketsWrapper';
import { ProjectTagsProvider } from './useProjectTags';

interface handleTicketItemActionChangeProps {
  action: TicketHeaderActionType;
  ticket: Ticket;
  agent?: Agent;
  group?: AgentGroup<'listItem'>;
}

// Compare only tag IDs
const isTicketTagsEqual = (a?: TicketTag[], b?: TicketTag[]) => {
  if (a == null || b == null) {
    return (a == null) === (b == null);
  }
  const numberOfIds = new Set([...a.map((v) => v.id), ...b.map((v) => v.id)]).size;
  return numberOfIds === a.length && numberOfIds === b.length;
};

export const Tickets: React.FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const match = useRouteMatch();
  const history = useHistory();
  const { q, updateParams, clearParams } = useQueryString<{ q: string }>({ q: '' });

  const { fetchTickets } = useTickets();
  const { showDialogsRequest } = commonActions;
  const { moveTicketToIdleRequest } = deskActions;
  const {
    isFetching,
    ticketStatus,
    assignee,
    channelTypes,
    tags,
    priority,
    dateRange,
    searchQuery,
    currentSearchedType,
    pagination,
    ticketSorter,
    isSearchMode,

    setTickets,
    setSearchQuery,
    setIsSearchMode,
    setCurrentSearchedType,
    setIsFetching,
    setTicketCount,
    setPagination,
    getSorterParams,
    updateTicketInList,
  } = useContext(TicketsContext);

  const { agent, team } = assignee ?? {};

  const prevStatus = usePrevious(ticketStatus);
  const prevAgent = usePrevious(agent);
  const prevTeam = usePrevious(team);
  const prevChannelTypes = usePrevious(channelTypes);
  const prevTags = usePrevious(tags);
  const prevDateRange = usePrevious(dateRange);
  const prevPriority = usePrevious(priority);

  const isFilterChanged = useLatestValue(
    [
      prevStatus !== ticketStatus,
      prevAgent !== agent,
      prevTeam !== team,
      !isEqual(prevChannelTypes, channelTypes),
      !isTicketTagsEqual(prevTags, tags),
      prevDateRange !== dateRange,
      prevPriority !== priority,
    ].some((item) => item),
  );

  const isSearchModeRef = useRef(isSearchMode);
  const isFetchingRef = useRef(isFetching);
  const [isShownExportNotification, setIsShownExportNotification] = useState(false);

  useEffect(() => {
    isSearchModeRef.current = isSearchMode;
  }, [isSearchMode]);

  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const handleFetchTickets = useCallback(async () => {
    if (isFilterChanged.current) {
      // It will execute this method again due to 'pagination' dependency.
      return setPagination({
        offset: 0,
        page: 1,
        limit: pagination.limit,
      });
    }
    setIsFetching(true);
    try {
      const fetchResult = await fetchTickets({
        offset: pagination.offset,
        limit: pagination.limit,
        order: getSorterParams(ticketSorter.sortBy, ticketSorter.order as SortOrder),
        query: searchQuery,
        startDate: dateRange?.range.startDate,
        endDate: dateRange?.range.endDate,
        agentId: agent?.id,
        groupId: team?.id,
        ticketStatus,
        channelTypes,
        tags: tags.map((v) => v.id),
        priority,
        isSearchMode: isSearchModeRef.current,
      });
      setTicketCount(fetchResult?.count || 0);
      setTickets(fetchResult?.results || []);
    } catch (err) {
      // ignore error
    }

    setIsFetching(false);
  }, [
    setIsFetching,
    setPagination,
    pagination,
    fetchTickets,
    getSorterParams,
    ticketSorter.sortBy,
    ticketSorter.order,
    searchQuery,
    dateRange,
    agent,
    team,
    ticketStatus,
    channelTypes,
    tags,
    priority,
    setTicketCount,
    setTickets,
    isFilterChanged,
  ]);

  const handleSearch = (queries: TicketSearchQuery[] | string) => {
    setPagination({ page: 1, offset: 0, limit: pagination.limit });
    if (typeof queries === 'string') {
      setSearchQuery(queries);
      setCurrentSearchedType(TicketSearchType.IntegratedSearch);
      updateParams({ q: queries });
      return;
    }
    setSearchQuery(getTicketSearchQueryString(queries));
    setCurrentSearchedType(TicketSearchType.TagsSearch);
    updateParams({ q: getTicketSearchURLQueryString(queries) });
  };

  const handleResetSearch = () => {
    clearParams();
  };

  useEffect(() => {
    handleFetchTickets();
  }, [handleFetchTickets]);

  useEffect(() => {
    setIsShownExportNotification(false);
  }, [history.location.pathname]);

  useEffect(() => {
    const queryParam = qs.parse(location.search, { ignoreQueryPrefix: true, parseArrays: false });

    if (!isEmpty(queryParam)) {
      setIsSearchMode(true);
      setCurrentSearchedType(TicketSearchType.TagsSearch);
      updateParams({ q: qs.stringify(queryParam['q']) });
    }
    // This "useEffect" function should only be called once, but is called several times by "updateParam".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentSearchedType, setIsSearchMode]);

  const handleTicketItemActionChange = useCallback(
    ({ action, ticket, agent }: handleTicketItemActionChangeProps) => {
      const origin = 'tickets';

      switch (action) {
        case 'TRANSFER_TO_AGENT':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.AssignTransferTicketToAgent,
              dialogProps: {
                mode: 'TRANSFER',
                ticket,
                agent,
                origin,
                onSuccess: (assignment: Assignment) => {
                  updateTicketInList(ticket, { recentAssignment: assignment });
                },
              },
            }),
          );
          break;
        case 'ASSIGN_TO_AGENT':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.AssignTransferTicketToAgent,
              dialogProps: {
                mode: 'ASSIGN',
                ticket,
                agent,
                origin,
                onSuccess: (updatedTicket: Ticket) => {
                  updateTicketInList(updatedTicket);
                },
              },
            }),
          );
          break;
        case 'MOVE_TO_IDLE':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.Confirm,
              dialogProps: {
                title: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle' }),
                description: '',
                confirmText: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle.button.confirm' }),
                cancelText: intl.formatMessage({ id: 'desk.tickets.ticketHeader.dialog.title.idle.button.cancel' }),
                onConfirm: () => {
                  dispatch(
                    moveTicketToIdleRequest({
                      ticket,
                      origin: 'tickets',
                      onSuccess: (assignment) => {
                        updateTicketInList(ticket, { recentAssignment: assignment });
                      },
                    }),
                  );
                },
              },
            }),
          );
          break;
        case 'CLOSE_TICKET':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.CloseTicket,
              dialogProps: {
                ticket,
                origin,
                onSuccess: (updatedTicket) => {
                  updateTicketInList(updatedTicket);
                },
              },
            }),
          );
          break;
        case 'REOPEN_TICKET':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.ReopenTicket,
              dialogProps: {
                ticket,
                onSuccess: (updatedTicket) => {
                  updateTicketInList(updatedTicket);
                },
              },
            }),
          );
          break;
        case 'TRANSFER_TO_GROUP':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.AssignTransferTicketToGroup,
              dialogProps: {
                mode: 'TRANSFER',
                ticket,
                origin,
                onSuccess: (updatedTicket) => {
                  updateTicketInList(updatedTicket);
                },
              },
            }),
          );
          break;
        case 'EXPORT_TICKET':
          dispatch(
            showDialogsRequest({
              dialogTypes: DialogType.ExportTicket,
              dialogProps: {
                ticketID: ticket.id,
                onSuccess: () => {
                  setIsShownExportNotification(true);
                },
              },
            }),
          );
          break;
        default:
          return;
      }
    },
    [dispatch, intl, moveTicketToIdleRequest, showDialogsRequest, updateTicketInList],
  );

  const handleRefresh = useCallback(() => {
    if (!isFetchingRef.current) {
      handleFetchTickets();
    }
  }, [handleFetchTickets]);

  const matchUrl = match?.url;
  const handleTicketClick = useCallback(
    (ticket) => () => {
      if (matchUrl) {
        history.push(`${matchUrl}/${ticket.id}${location.search}`);
      }
    },
    [history, matchUrl],
  );

  const initialSearchQuery = {
    value: q,
    type: currentSearchedType,
  };

  const renderTicketsDetail = ({ match }) => {
    return (
      <DeskChatLayout>
        <ContractedTicketList
          initialSearchQuery={initialSearchQuery}
          onSearch={handleSearch}
          onResetSearch={handleResetSearch}
          handleRefresh={handleRefresh}
          handleTicketItemActionChange={handleTicketItemActionChange}
          handleTicketClick={handleTicketClick}
        />
        <TicketDetail
          ticketId={match.params.ticketId}
          isShownExportNotification={isShownExportNotification}
          setIsShownExportNotification={setIsShownExportNotification}
        />
      </DeskChatLayout>
    );
  };

  const renderTicketsWrapper = () => {
    return (
      <TicketsWrapper
        isShownExportNotification={isShownExportNotification}
        initialSearchQuery={initialSearchQuery}
        onSearch={handleSearch}
        onResetSearch={handleResetSearch}
        handleRefresh={handleRefresh}
        handleTicketItemActionChange={handleTicketItemActionChange}
        setIsShownExportNotification={setIsShownExportNotification}
      />
    );
  };

  return (
    <ProjectTagsProvider>
      {match && (
        <Switch>
          <Route path={`${match.url}/:ticketId`} render={renderTicketsDetail} />
          <Route path={`${match.url}`} render={renderTicketsWrapper} />
        </Switch>
      )}
    </ProjectTagsProvider>
  );
};
