import { memo, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Table, TableProps, TableColumnProps, cssVariables, Link, LinkVariant, Avatar, AvatarType } from 'feather';
import numbro from 'numbro';

import { EMPTY_TEXT, DEFAULT_PAGE_SIZE_OPTIONS, SortOrder } from '@constants';
import { QueryParamsWithUpdate } from '@hooks/useQueryString';
import { Paginator, TicketCSAT, InfoTooltip } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { renderTimestring } from '@utils';

import { StatsBotsSortBy } from '../../../constants/desk';
import { SearchParams } from './StatsBots';

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    margin-left: 4px;
  }
`;

const BotAvatar = styled(Avatar)`
  margin: -6px 0;
  margin-right: 12px;
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
  botsData: FetchStatsByBotsResponse | undefined;
  isFetching: boolean;
  sortBy: SearchParams['sortBy'];
  sortOrder: SearchParams['sortOrder'];
};

export interface BotStatsRecord extends Omit<BotStatsItem, 'agent__bot__id' | 'agent__bot__name'> {
  id: DeskBot['id'];
  name: DeskBot['name'];
  photoUrl: DeskBot['photoUrl'];
}

const BotStatsTable = styled((props: TableProps<BotStatsRecord>) => Table<BotStatsRecord>(props))`
  flex: 1;
`;

export const StatesBotsTableView = memo<Props>(
  ({ page, pageSize, updateParams, botsData, isFetching, sortBy, sortOrder }) => {
    const intl = useIntl();
    const dataSources: BotStatsRecord[] =
      botsData?.results.map((bot) => ({
        ...bot,
        id: bot.agent__bot__id,
        name: bot.agent__bot__name,
        photoUrl: bot.bot.photoUrl,
      })) ?? [];

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
      (column?: TableColumnProps<BotStatsRecord>, order?: SortOrder) => {
        if (column && order) {
          updateParams({ sortBy: column.key as StatsBotsSortBy, sortOrder: order ?? SortOrder.DESCEND });
        }
      },
      [updateParams],
    );

    const getDefaultSortedOrder = useCallback(
      (key: StatsBotsSortBy) => {
        return sortBy === key ? sortOrder : undefined;
      },
      [sortBy, sortOrder],
    );

    return (
      <>
        <BotStatsTable
          rowKey="id"
          columns={[
            {
              key: StatsBotsSortBy.NAME,
              dataIndex: 'name',
              title: intl.formatMessage({ id: 'desk.statistics.bots.table.name' }),
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.NAME),
              sorter: true,
              flex: 3,
              render: (record) => {
                return (
                  <Link variant={LinkVariant.Neutral} useReactRouter={true} href={`?view=chart&bot=${record.bot.id}`}>
                    <BotAvatar
                      profileID={record.id}
                      imageUrl={record.photoUrl || undefined}
                      type={AvatarType.Bot}
                      size={32}
                    />
                    {record.name}
                  </Link>
                );
              },
            },
            {
              key: StatsBotsSortBy.ASSIGNMENTS,
              dataIndex: 'numberOfAssignments',
              title: (
                <TableHeader>
                  {intl.formatMessage({ id: 'desk.statistics.bots.table.assignments' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'desk.statistics.bots.table.assignments.tooltip' })}
                    placement="top"
                  />
                </TableHeader>
              ),
              sorter: true,
              flex: 2,
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.ASSIGNMENTS),
              render: ({ numberOfAssignments }) =>
                numberOfAssignments ? (
                  <>
                    {numbro(numberOfAssignments).format({ thousandSeparated: true, mantissa: 0 })}
                    <Percentage>
                      (
                      {numbro(
                        botsData?.assignmentsTotalCount
                          ? Number(numberOfAssignments) / botsData?.assignmentsTotalCount
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
              key: StatsBotsSortBy.CLOSED_TICKETS,
              dataIndex: 'numberOfClosedTickets',
              title: (
                <TableHeader>
                  {intl.formatMessage({ id: 'desk.statistics.bots.table.closedTickets' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'desk.statistics.bots.table.closedTickets.tooltip' })}
                    placement="top"
                  />
                </TableHeader>
              ),
              flex: 2,
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.CLOSED_TICKETS),
              sorter: true,
            },
            {
              key: StatsBotsSortBy.CLOSING_RATE,
              dataIndex: 'averageAssignmentClosingRate',
              title: (
                <TableHeader>
                  {intl.formatMessage({ id: 'desk.statistics.bots.table.closedAssignmentRate' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'desk.statistics.bots.table.closedAssignmentRate.tooltip' })}
                    placement="top"
                  />
                </TableHeader>
              ),
              flex: 2,
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.CLOSING_RATE),
              sorter: true,
            },
            {
              key: StatsBotsSortBy.CLOSING_TIME,
              dataIndex: 'averageClosingAssignedTime',
              title: (
                <TableHeader>
                  {intl.formatMessage({ id: 'desk.statistics.bots.table.closingTime' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'desk.statistics.bots.table.closingTime.tooltip' })}
                    placement="top"
                  />
                </TableHeader>
              ),
              flex: 2,
              sorter: true,
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.CLOSING_TIME),
              render: ({ averageClosingAssignedTime: value }) => (value ? renderTimestring(value) : EMPTY_TEXT),
            },
            {
              key: StatsBotsSortBy.HANDOVER,
              dataIndex: 'averageHandoverAssignedTime',
              title: (
                <TableHeader>
                  {intl.formatMessage({ id: 'desk.statistics.bots.table.handover' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'desk.statistics.bots.table.handover.tooltip' })}
                    placement="top"
                  />
                </TableHeader>
              ),
              flex: 2,
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.HANDOVER),
              sorter: true,
              render: ({ averageHandoverAssignedTime: value }) => (value ? renderTimestring(value) : EMPTY_TEXT),
            },
            {
              key: StatsBotsSortBy.CSAT,
              dataIndex: 'averageCustomerSatisfactionScore',
              title: (
                <TableHeader>
                  {intl.formatMessage({ id: 'desk.statistics.bots.table.csat' })}
                  <InfoTooltip
                    content={intl.formatMessage({ id: 'desk.statistics.bots.table.csat.tooltip' })}
                    placement="top"
                  />
                </TableHeader>
              ),
              flex: 2,
              defaultSortOrder: getDefaultSortedOrder(StatsBotsSortBy.CSAT),
              sorter: true,
              render: ({ averageCustomerSatisfactionScore }) => <TicketCSAT score={averageCustomerSatisfactionScore} />,
            },
          ]}
          dataSource={dataSources}
          loading={isFetching}
          showScrollbars={true}
          onSortByUpdated={handleSortChange}
          emptyView={
            <CenteredEmptyState
              icon="reports-filled"
              title={intl.formatMessage({
                id: 'desk.statistics.bots.table.noItem',
              })}
              description={intl.formatMessage({ id: 'desk.statistics.bots.table.noItem.desc' })}
            />
          }
          footer={
            <StyledPaginator
              current={page}
              total={botsData?.count ?? 0}
              pageSize={pageSize}
              pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
              onChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          }
        />
      </>
    );
  },
);
