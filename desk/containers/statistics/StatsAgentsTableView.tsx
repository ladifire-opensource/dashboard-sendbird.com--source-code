import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Table, TableProps, TableColumnProps, cssVariables, Link, LinkVariant } from 'feather';
import numbro from 'numbro';

import { EMPTY_TEXT, DEFAULT_PAGE_SIZE_OPTIONS, StatsAgentsSortBy, SortOrder } from '@constants';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import { QueryParamsWithUpdate } from '@hooks/useQueryString';
import { Paginator, TicketCSAT, InfoTooltip } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { renderTimestring } from '@utils';

import { SearchParams } from './StatsAgents';

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

const Percentage = styled.span`
  color: ${cssVariables('neutral-7')};
  margin-left: 5px;
`;

type Props = {
  page: number;
  pageSize: PerPage;
  updateParams: QueryParamsWithUpdate<SearchParams>['updateParams'];
  agentsData: FetchStatsByAgentsResponse | undefined;
  isFetching: boolean;
  sortBy: SearchParams['sortBy'];
  sortOrder: SearchParams['sortOrder'];
};

export interface AgentStatsRecord extends Omit<AgentStatsItem, 'agent'> {
  id: Agent['id'];
  email: Agent['email'];
  name: Agent['displayName'];
  photoThumbnailUrl: Agent['photoThumbnailUrl'];
}

const AgentStatsTable = styled((props: TableProps<AgentStatsRecord>) => Table<AgentStatsRecord>(props))`
  flex: 1;
`;

export const StatesAgentsTableView: React.FC<Props> = ({
  page,
  pageSize,
  updateParams,
  agentsData,
  isFetching,
  sortBy,
  sortOrder,
}) => {
  const intl = useIntl();

  const dataSources = agentsData?.results.map(
    ({ agent, ...item }) =>
      ({
        ...item,
        id: agent.id,
        name: agent.displayName,
        photoThumbnailUrl: agent.photoThumbnailUrl,
        email: agent.email,
      } as AgentStatsRecord),
  );

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
    (column?: TableColumnProps<AgentStatsRecord>, order?: SortOrder) => {
      if (column && order) {
        updateParams({ sortBy: column.key as StatsAgentsSortBy, sortOrder: order ?? SortOrder.DESCEND });
      }
    },
    [updateParams],
  );

  const getDefaultSortedOrder = useCallback(
    (key: StatsAgentsSortBy) => {
      return sortBy === key ? sortOrder : undefined;
    },
    [sortBy, sortOrder],
  );

  return (
    <>
      <AgentStatsTable
        rowKey="id"
        columns={[
          {
            key: StatsAgentsSortBy.NAME,
            dataIndex: 'name',
            title: intl.formatMessage({ id: 'desk.statistics.agents.table.name' }),
            defaultSortOrder: getDefaultSortedOrder(StatsAgentsSortBy.NAME),
            sorter: true,
            flex: 2,
            render: (record) => (
              <Link variant={LinkVariant.Neutral} useReactRouter={true} href={`?view=chart&agent=${record.id}`}>
                <DeskAgentAvatar profileID={record.email} imageUrl={record.photoThumbnailUrl || undefined} size={32} />
                {record.name}
              </Link>
            ),
            styles: css`
              ${DeskAgentAvatar} {
                margin: -6px 0;
                margin-right: 12px;
              }
            `,
          },
          {
            key: StatsAgentsSortBy.ASSIGNMENTS,
            dataIndex: 'numberOfAssignments',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.agents.table.assignments' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.agents.table.assignments.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(StatsAgentsSortBy.ASSIGNMENTS),
            render: ({ numberOfAssignments }) =>
              numberOfAssignments ? (
                <>
                  {numbro(numberOfAssignments).format({ thousandSeparated: true, mantissa: 0 })}
                  <Percentage>
                    (
                    {numbro(
                      agentsData?.assignmentsTotalCount
                        ? Number(numberOfAssignments) / agentsData?.assignmentsTotalCount
                        : 0,
                    ).format('0.000%')}
                    )
                  </Percentage>
                </>
              ) : (
                EMPTY_TEXT
              ),
          },
          {
            key: StatsAgentsSortBy.ASSIGNED_TICKETS,
            dataIndex: 'numberOfAssignedTickets',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.agents.table.receivedTickets' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.agents.table.receivedTickets.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsAgentsSortBy.ASSIGNED_TICKETS),
            sorter: true,
          },
          {
            key: StatsAgentsSortBy.CLOSED_TICKETS,
            dataIndex: 'numberOfClosedTickets',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.agents.table.ticketClosed' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.agents.table.ticketClosed.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsAgentsSortBy.CLOSED_TICKETS),
            sorter: true,
          },
          {
            key: StatsAgentsSortBy.CSAT,
            dataIndex: 'averageCustomerSatisfactionScore',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.agents.table.csat' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.agents.table.csat.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(StatsAgentsSortBy.CSAT),
            render: ({ averageCustomerSatisfactionScore: score }) => <TicketCSAT score={score} />,
          },
          {
            key: StatsAgentsSortBy.RESPONSE_TIME,
            dataIndex: 'averageResponseTime',
            title: (
              <TableHeader>
                {intl.formatMessage({ id: 'desk.statistics.agents.table.firstResponseTime' })}
                <InfoTooltip
                  content={intl.formatMessage({ id: 'desk.statistics.agents.table.firstResponseTime.tooltip' })}
                  placement="top"
                />
              </TableHeader>
            ),
            defaultSortOrder: getDefaultSortedOrder(StatsAgentsSortBy.RESPONSE_TIME),
            sorter: true,
            render: ({ averageResponseTime: value }) => (value ? renderTimestring(value) : EMPTY_TEXT),
          },
        ]}
        dataSource={dataSources}
        loading={isFetching}
        showScrollbars={true}
        onSortByUpdated={handleSortChange}
        emptyView={
          <CenteredEmptyState
            icon="no-data"
            title={intl.formatMessage({
              id: 'desk.statistics.agents.table.noItem',
            })}
            description={intl.formatMessage({
              id: 'desk.statistics.agents.table.noItem.desc',
            })}
          />
        }
        footer={
          <StyledPaginator
            current={page}
            total={agentsData?.count ?? 0}
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
