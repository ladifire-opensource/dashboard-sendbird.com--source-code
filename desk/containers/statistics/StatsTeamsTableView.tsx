import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Table, TableProps, TableColumnProps, Link, LinkVariant } from 'feather';
import numbro from 'numbro';

import { DEFAULT_PAGE_SIZE_OPTIONS, EMPTY_TEXT, SortOrder, StatsTeamsSortBy } from '@constants';
import { QueryParamsWithUpdate } from '@hooks/useQueryString';
import { Paginator, TicketCSAT, InfoTooltip } from '@ui/components';
import { renderTimestring } from '@utils';

import { SearchParams } from './StatsTeams';

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-left: 4px;
  }
`;

const StyledPaginator = styled(Paginator)`
  margin-left: auto;
`;

type Props = {
  page: number;
  pageSize: PerPage;
  updateParams: QueryParamsWithUpdate<SearchParams>['updateParams'];
  items: FetchStatsByTeamsResponse['results'];
  count: number;
  isFetching: boolean;
  sortBy: SearchParams['sortBy'];
  sortOrder: SearchParams['sortOrder'];
};

const TeamStatsTable = styled((props: TableProps<TeamStatsItem>) => Table<TeamStatsItem>(props))`
  flex: 1;
`;

export const StatsTeamTableView: React.FC<Props> = ({
  page,
  pageSize,
  updateParams,
  items,
  count,
  isFetching,
  sortOrder,
  sortBy,
}) => {
  const intl = useIntl();

  const handlePageChange = useCallback(
    (page: number, pageSize: PerPage) => {
      updateParams({ page, pageSize });
    },
    [updateParams],
  );

  const handleItemsPerPageChange = useCallback(
    (page: number, pageSize: PerPage) => {
      updateParams({
        page,
        pageSize,
      });
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (column?: TableColumnProps<TeamStatsItem>, order?: SortOrder) => {
      if (column && order) {
        updateParams({ sortBy: column.key as StatsTeamsSortBy, sortOrder: order ?? SortOrder.DESCEND });
      }
    },
    [updateParams],
  );

  const getDefaultSortedOrder = useCallback(
    (key: StatsTeamsSortBy) => {
      return sortBy === key ? sortOrder : undefined;
    },
    [sortBy, sortOrder],
  );

  return (
    <>
      <TeamStatsTable
        rowKey="id"
        columns={[
          {
            key: StatsTeamsSortBy.NAME,
            dataIndex: 'groupName',
            title: intl.formatMessage({ id: 'desk.statistics.teams.table.name' }),
            defaultSortOrder: getDefaultSortedOrder(StatsTeamsSortBy.NAME),
            sorter: true,
            render: (record) => (
              <Link variant={LinkVariant.Neutral} useReactRouter={true} href={`?view=chart&team=${record.groupId}`}>
                {record.groupName}
              </Link>
            ),
          },
          {
            key: StatsTeamsSortBy.ASSIGNED_TICKETS,
            dataIndex: 'groupAssignedTickets',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.teams.table.receivedTickets' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.teams.table.receivedTickets.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsTeamsSortBy.ASSIGNED_TICKETS),
            sorter: true,
            render: ({ groupAssignedTickets }) => numbro(groupAssignedTickets).format('0,0'),
          },
          {
            key: StatsTeamsSortBy.CLOSED_TICKETS,
            dataIndex: 'closedTicket',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.teams.table.closedTickets' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.teams.table.closedTickets.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsTeamsSortBy.CLOSED_TICKETS),
            sorter: true,
            render: ({ closedTicket }) => numbro(closedTicket).format('0,0'),
          },
          {
            key: StatsTeamsSortBy.CSAT,
            dataIndex: 'avgCustomerSatisfactionScore',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.teams.table.csat' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.teams.table.csat.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsTeamsSortBy.CSAT),
            sorter: true,
            render: ({ avgCustomerSatisfactionScore: score }) => <TicketCSAT score={score} />,
          },
          {
            key: StatsTeamsSortBy.RESPONSE_TIME,
            dataIndex: 'avgResponseTime',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.teams.table.firstResponseTime' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.teams.table.firstResponseTime.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsTeamsSortBy.RESPONSE_TIME),
            sorter: true,
            render: ({ avgResponseTime }) => (avgResponseTime ? renderTimestring(avgResponseTime) : EMPTY_TEXT),
          },
          {
            key: StatsTeamsSortBy.RESOLUTION_TIME,
            dataIndex: 'avgResolutionTime',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.teams.table.resolutionTime' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.teams.table.resolutionTime.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsTeamsSortBy.RESOLUTION_TIME),
            sorter: true,
            render: ({ avgResolutionTime }) => (avgResolutionTime ? renderTimestring(avgResolutionTime) : EMPTY_TEXT),
          },
        ]}
        dataSource={items}
        loading={isFetching}
        showScrollbars={true}
        onSortByUpdated={handleSortChange}
        footer={
          <StyledPaginator
            current={page}
            total={count}
            pageSize={pageSize}
            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
            onChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        }
      />
    </>
  );
};
