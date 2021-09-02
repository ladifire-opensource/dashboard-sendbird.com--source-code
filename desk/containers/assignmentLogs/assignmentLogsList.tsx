import { memo, useCallback, useMemo, ComponentProps } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Table, TableColumnProps, TableProps, DateRangePickerValue } from 'feather';
import moment from 'moment-timezone';

import { EMPTY_TEXT, AssignmentLogsSortBy, SortOrder, ISO_DATE_FORMAT, TicketStatus } from '@constants';
import { useAppId, useLocaleKO } from '@hooks';
import {
  TicketStatusLozenge,
  Paginator,
  TicketSubject,
  TicketAgent,
  TicketFormattedTime,
  allChannelTypes,
} from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { renderTimestring } from '@utils';

import { AssignmentLogsState, AssignmentLogsQueryString } from '.';
import { getDefaultTicketSearchQueryParam, DefaultFilterItemId } from '../TicketSearchInput';

type Props = {
  state: AssignmentLogsState;
  isAgent: boolean;
  queryString: AssignmentLogsQueryString;
};

const TicketListPagination = styled(Paginator)`
  margin-left: auto;
`;

const StyledTable = styled((props: TableProps<AssignmentLog>) => Table<AssignmentLog>(props))`
  flex: 1;
`;

const dateRangePickerValueMap = {
  7: DateRangePickerValue.Last7Days,
  14: DateRangePickerValue.Last14Days,
  30: DateRangePickerValue.Last30Days,
  90: DateRangePickerValue.Last90Days,
};

const getDateRangePickerValue = (startDate: string | undefined, endDate: string | undefined) => {
  if (!startDate || !endDate) {
    return DateRangePickerValue.AllDates;
  }

  const startDateMoment = moment(startDate);
  const endDateMoment = moment(endDate);

  const startDateFormatted = startDateMoment.format(ISO_DATE_FORMAT);
  const endDateFormatted = endDateMoment.format(ISO_DATE_FORMAT);
  const todayMoment = moment();
  const todayFormatted = todayMoment.format(ISO_DATE_FORMAT);
  if (startDateFormatted === endDateFormatted && startDateFormatted === todayFormatted) {
    return DateRangePickerValue.Today;
  }

  if (startDateFormatted === endDateFormatted && todayMoment.diff(startDateFormatted, 'days') === 1) {
    return DateRangePickerValue.Yesterday;
  }

  const pickerValue = dateRangePickerValueMap[endDateMoment.diff(startDateMoment, 'days') + 1];
  if (startDateMoment && endDateMoment && !pickerValue) {
    return DateRangePickerValue.Custom;
  }
  return pickerValue;
};

export const AssignmentLogsList = memo<Props>(({ state, isAgent, queryString }) => {
  const intl = useIntl();
  const isLocaleKo = useLocaleKO();
  const appId = useAppId();

  const { assignmentLogs, assignmentLogsCount, isFetching } = state;
  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    channelTypes,
    ticketStatus,
    updateParams,
  } = queryString;

  const isDefaultDateRange = useMemo(() => {
    return getDateRangePickerValue(startDate, endDate) === dateRangePickerValueMap[7];
  }, [endDate, startDate]);

  const isDefaultChannelTypes = !channelTypes || allChannelTypes.every((type) => channelTypes.includes(type));

  const isFiltered = useMemo(() => {
    return ticketStatus !== TicketStatus.ALL || !isDefaultChannelTypes || !isDefaultDateRange;
  }, [ticketStatus, isDefaultChannelTypes, isDefaultDateRange]);

  const handlePaginationChange = useCallback<ComponentProps<typeof Paginator>['onChange']>(
    (nextPage, nextPageSize) => {
      updateParams({ page: nextPage, pageSize: nextPageSize });
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (column?: TableColumnProps<AssignmentLog>, order?: SortOrder) => {
      if (column && order) {
        updateParams({ sortBy: column.key as AssignmentLogsSortBy, sortOrder: order || SortOrder.DESCEND });
      }
    },
    [updateParams],
  );

  const getDefaultSortedOrder = useCallback(
    (key: AssignmentLogsSortBy) => {
      return sortBy === key ? sortOrder : undefined;
    },
    [sortBy, sortOrder],
  );

  const columns: TableColumnProps<AssignmentLog>[] = useMemo(
    () => [
      {
        title: intl.messages['desk.assignmentLogs.list.column.assignedOn'],
        key: AssignmentLogsSortBy.ASSIGNED_AT,
        dataIndex: 'assignedAt',
        defaultSortOrder: getDefaultSortedOrder(AssignmentLogsSortBy.ASSIGNED_AT),
        sorter: true,
        render: ({ assignedAt }) => <TicketFormattedTime timestamp={assignedAt} format="lll" />,
      },
      {
        title: intl.messages['desk.assignmentLogs.list.column.subject'],
        key: AssignmentLogsSortBy.SUBJECT,
        defaultSortOrder: getDefaultSortedOrder(AssignmentLogsSortBy.SUBJECT),
        sorter: true,
        render: (record) => {
          const ticket = record.assignedTicket;
          const queryParam = getDefaultTicketSearchQueryParam(DefaultFilterItemId.TicketID, ticket.id.toString());
          return (
            <TicketSubject
              ticket={ticket}
              subjectLinkTo={`/${appId}/desk/${isAgent ? 'conversation' : 'tickets'}/${ticket.id}?${queryParam}`}
              isAgent={isAgent}
            />
          );
        },
      },
      {
        title: intl.messages['desk.assignmentLogs.list.column.responseTime'],
        key: AssignmentLogsSortBy.RESPONSE_TIME,
        dataIndex: 'responseTime',
        defaultSortOrder: getDefaultSortedOrder(AssignmentLogsSortBy.RESPONSE_TIME),
        sorter: true,
        render: ({ responseTime }) => {
          return responseTime ? renderTimestring(responseTime, isLocaleKo) : EMPTY_TEXT;
        },
      },
      {
        title: intl.messages['desk.assignmentLogs.list.column.ticketStatus'],
        dataIndex: 'status',
        render: (record) => {
          return <TicketStatusLozenge ticketStatus={record.assignedTicket.status2} />;
        },
      },
      {
        title: intl.messages['desk.assignmentLogs.list.column.endedOn'],
        key: AssignmentLogsSortBy.ENDED_AT,
        dataIndex: 'endedAt',
        defaultSortOrder: getDefaultSortedOrder(AssignmentLogsSortBy.ENDED_AT),
        sorter: true,
        render: ({ endedAt }) => <TicketFormattedTime timestamp={endedAt} format="lll" />,
      },
      {
        title: intl.messages['desk.assignmentLogs.list.column.closedOn'],
        key: AssignmentLogsSortBy.CLOSED_AT,
        defaultSortOrder: getDefaultSortedOrder(AssignmentLogsSortBy.CLOSED_AT),
        sorter: true,
        render: (record) => <TicketFormattedTime timestamp={record.assignedTicket.closedAt} format="lll" />,
      },
    ],
    [appId, getDefaultSortedOrder, intl.messages, isAgent],
  );

  if (!isAgent && !columns.find((column) => column.key === AssignmentLogsSortBy.AGENT)) {
    columns
      .splice(2, 0, {
        title: intl.messages['desk.assignmentLogs.list.column.agent'],
        key: AssignmentLogsSortBy.AGENT,
        dataIndex: 'agent',
        defaultSortOrder: getDefaultSortedOrder(AssignmentLogsSortBy.AGENT),
        sorter: true,
        render: (record) => <TicketAgent agent={record.agent} />,
      })
      .join();
  }

  return (
    <StyledTable
      rowKey="id"
      dataSource={assignmentLogs}
      loading={isFetching}
      showScrollbars={true}
      onSortByUpdated={handleSortChange}
      columns={columns}
      emptyView={
        isFiltered ? (
          <CenteredEmptyState
            icon="no-search"
            title={intl.messages['desk.assignmentLogs.list.noResult.title']}
            description={intl.messages['desk.assignmentLogs.list.noResult.desc']}
          />
        ) : (
          <CenteredEmptyState
            icon="archive"
            title={intl.messages['desk.assignmentLogs.list.noItem.title']}
            description={intl.messages['desk.assignmentLogs.list.noItem.desc']}
          />
        )
      }
      footer={
        <TicketListPagination
          current={page}
          total={assignmentLogsCount}
          pageSize={pageSize}
          onChange={handlePaginationChange}
          onItemsPerPageChange={handlePaginationChange}
        />
      }
    />
  );
});
