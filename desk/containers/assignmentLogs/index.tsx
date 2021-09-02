import { memo, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { toast } from 'feather';
import moment from 'moment-timezone';

import { useDeskAuth } from '@authorization/useDeskAuth';
import {
  TicketStatus,
  AssignmentLogsSortBy,
  DEFAULT_PAGE_SIZE_OPTIONS,
  ISO_DATE_FORMAT,
  LIST_LIMIT,
  SortOrder,
  ISO_DATE_FORMAT_REGEX,
} from '@constants';
import { fetchAssignmentLogs } from '@desk/api';
import { validateChannelTypes } from '@desk/utils/validationParams';
import { useAuthorization } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString } from '@hooks/useQueryString';
import { AutoRefreshDropdown, PageHeader, TablePageContainer } from '@ui/components';
import { getChannelTypesArray } from '@ui/components/TicketChannelTypesFilter/utils';
import { getSorterParams, getTicketStatus2 } from '@utils/desk';

import { AssignmentLogsFilters } from './assignmentLogsFilters';
import { AssignmentLogsList } from './assignmentLogsList';

export type AssignmentLogsState = {
  isFetching: boolean;
  assignmentLogs: AssignmentLog[];
  assignmentLogsCount: number;
};

export type AssignmentLogsQueryString = {
  page: number;
  pageSize: PerPage;
  sortBy: AssignmentLogsSortBy;
  sortOrder: SortOrder;
  startDate: string | undefined;
  endDate: string | undefined;
  ticketStatus: TicketStatus;
  channelTypes: TicketChannelType[];
  agentId: Agent['id'] | undefined;
  updateParams: (params: Partial<AssignmentLogsQueryString>) => void;
};

const AssignmentLogsContainer = styled(TablePageContainer)`
  position: relative;
  justify-content: stretch;

  ${PageHeader} + * {
    margin-top: 24px;
  }
`;

const defaultQueryString = {
  page: 1,
  pageSize: LIST_LIMIT as PerPage,
  sortBy: AssignmentLogsSortBy.ASSIGNED_AT,
  sortOrder: SortOrder.DESCEND,
  startDate: moment().subtract(6, 'day').format(ISO_DATE_FORMAT),
  endDate: moment().format(ISO_DATE_FORMAT),
  ticketStatus: TicketStatus.ALL,
  channelTypes: [],
  agentId: undefined,
};

export const AssignmentLogs = memo(() => {
  useDeskAuth();
  const { getErrorMessage } = useDeskErrorHandler();
  const { isPermitted } = useAuthorization();
  const isAgent = isPermitted(['desk.agent']);

  const intl = useIntl();
  const { pid, region, agentId: agentIdAsAgent } = useSelector((state: RootState) => ({
    region: state.applicationState.data?.region ?? '',
    pid: state.desk.project.pid,
    agentId: state.desk.agent.id,
  }));

  const [state, setState] = useState<AssignmentLogsState>({
    isFetching: false,
    assignmentLogs: [],
    assignmentLogsCount: 0,
  });

  const stateRef = useRef(state);

  const queryString = useQueryString<Omit<AssignmentLogsQueryString, 'updateParams'>>(
    isAgent ? defaultQueryString : Object.assign(defaultQueryString, { agentId: -1 }),
    {
      page: (page) => {
        const pageNumber = Number(page);
        return Number.isInteger(pageNumber) && pageNumber > 0;
      },
      pageSize: (pageSize) => {
        const pageSizeNumber = Number(pageSize);
        return (
          Number.isInteger(pageSizeNumber) &&
          pageSizeNumber > 0 &&
          DEFAULT_PAGE_SIZE_OPTIONS.some((size) => size === pageSizeNumber)
        );
      },
      sortBy: (sortBy) => {
        if (sortBy) {
          const sortableKeys = [
            AssignmentLogsSortBy.AGENT,
            AssignmentLogsSortBy.ASSIGNED_AT,
            AssignmentLogsSortBy.CLOSED_AT,
            AssignmentLogsSortBy.ENDED_AT,
            AssignmentLogsSortBy.RESPONSE_TIME,
            AssignmentLogsSortBy.SUBJECT,
          ];
          const isValid = sortableKeys.some((key) => key === sortBy);
          return isValid;
        }
        return false;
      },
      sortOrder: (sortOrder) => {
        if (sortOrder) {
          const orders = [SortOrder.ASCEND, SortOrder.DESCEND];
          const isValid = orders.some((item) => item === sortOrder);
          return isValid;
        }
        return false;
      },
      startDate: (startDate, params) => {
        if (Array.isArray(startDate)) return false;
        if (!startDate && !params.endDate) {
          return true;
        }

        if (startDate) {
          const isValidFormat = ISO_DATE_FORMAT_REGEX.test(startDate);
          const startMoment = moment(startDate, ISO_DATE_FORMAT);
          const endMoment = moment(params.endDate, ISO_DATE_FORMAT);
          const isValidMoment = startMoment.isValid();
          const isBeforeFromEnd = startMoment.isBefore(endMoment);
          const isSameFromEnd = startMoment.isSame(endMoment);

          if (!isValidFormat || !isValidMoment || (!isSameFromEnd && !isBeforeFromEnd)) {
            return false;
          }

          return true;
        }

        return false;
      },
      endDate: (endDate, params) => {
        if (Array.isArray(endDate)) return false;

        if (!endDate && !params.startDate) {
          return true;
        }

        if (endDate) {
          const isValidFormat = ISO_DATE_FORMAT_REGEX.test(endDate);
          const startMoment = moment(params.startDate, ISO_DATE_FORMAT);
          const endMoment = moment(endDate, ISO_DATE_FORMAT);
          const isValidMoment = endMoment.isValid();
          const isAfterFromStart = endMoment.isAfter(startMoment);
          const isSameFromStart = endMoment.isSame(startMoment);

          if (!isValidFormat || !isValidMoment || (!isSameFromStart && !isAfterFromStart)) {
            return false;
          }

          return true;
        }

        return false;
      },
      ticketStatus: (ticketStatus) => {
        if (ticketStatus) {
          const ticketStatusKeys = [
            TicketStatus.ALL,
            TicketStatus.ACTIVE,
            TicketStatus.CLOSED,
            TicketStatus.IDLE,
            TicketStatus.PENDING,
            TicketStatus.WIP,
          ];
          const isValid = ticketStatusKeys.some((item) => item === ticketStatus);
          return isValid;
        }
        return false;
      },
      channelTypes: (query) => validateChannelTypes(query),
      agentId: (agentId) => {
        const agentIdNumber = Number(agentId);
        return Number.isInteger(agentIdNumber);
      },
    },
  );
  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    ticketStatus,
    channelTypes: rawChannelTypes,
    agentId,
  } = queryString;

  const channelTypes = useMemo(() => getChannelTypesArray(rawChannelTypes), [rawChannelTypes]);

  const getAgentByRole = useCallback(() => {
    if (isAgent) {
      return agentIdAsAgent;
    }

    return agentId === -1 ? undefined : agentId;
  }, [agentId, agentIdAsAgent, isAgent]);

  const fetchAssignmentLogsRequest = useCallback(
    async ({ limit, offset, sortBy, sortOrder, startDate, endDate, ticketStatus, channelTypes, agentId }) => {
      setState({ ...stateRef.current, isFetching: true });
      try {
        const {
          data: { results, count },
        } = await fetchAssignmentLogs(pid, region, {
          agent: agentId,
          limit,
          offset,
          order: getSorterParams(sortBy, sortOrder),
          startDate,
          endDate,
          ticketChannelType: channelTypes,
          ticketStatus2: getTicketStatus2(ticketStatus),
        });
        setState({
          isFetching: false,
          assignmentLogs: results,
          assignmentLogsCount: count,
        });
      } catch (err) {
        setState({ ...stateRef.current, isFetching: false });
        toast.error({ message: getErrorMessage(err) });
      }
    },
    [getErrorMessage, pid, region],
  );

  const fetchData = useCallback(() => {
    fetchAssignmentLogsRequest({
      limit: pageSize as PerPage,
      offset: (page - 1) * pageSize,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      ticketStatus,
      channelTypes,
      agentId: getAgentByRole(),
    });
  }, [
    channelTypes,
    endDate,
    fetchAssignmentLogsRequest,
    getAgentByRole,
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    ticketStatus,
  ]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <AssignmentLogsContainer>
      <PageHeader>
        <PageHeader.Title>
          {intl.formatMessage({ id: 'desk.assignmentLogs.header.lbl' })}
          <AutoRefreshDropdown css="margin-left: 8px;" onRefreshTriggered={fetchData} />
        </PageHeader.Title>
      </PageHeader>
      <AssignmentLogsFilters isFetching={state.isFetching} queryString={{ ...queryString, channelTypes }} />
      <AssignmentLogsList state={state} isAgent={isAgent} queryString={{ ...queryString, channelTypes }} />
    </AssignmentLogsContainer>
  );
});
