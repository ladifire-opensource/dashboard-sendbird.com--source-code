import { useContext, useCallback, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import styled, { css } from 'styled-components';

import copy from 'copy-to-clipboard';
import { Table, TableProps, TableColumnProps, Tag, OverflowMenu, toast } from 'feather';
import moment from 'moment-timezone';
import qs from 'qs';

import { TicketStatus, TicketSortBy, EMPTY_TEXT, SortOrder, IS_INTEGER_REGEX } from '@constants';
import { useAppId } from '@hooks';
import {
  Paginator,
  TicketStatusLozenge,
  PriorityBadge,
  TicketSubject,
  TicketCustomer,
  TicketAgent,
  TicketCSAT,
} from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { getTicketURL } from '@utils';

import { TicketSearchURLQuery } from '../TicketSearchInput';
import { TicketsContext } from './ticketsContext';

type OwnProps = {
  timezone: string;

  // actions
  handleActionChange: any;
};
export const drawerID = 'agent';

type Props = OwnProps;

const TicketListPagination = styled(Paginator)`
  margin-left: auto;
`;

const TicketListTable = styled((props: TableProps<Ticket>) => Table<Ticket>(props))`
  flex: 1;
  border: 0;
`;

export const TicketsList: React.FC<Props> = ({ timezone, handleActionChange }) => {
  const intl = useIntl();
  const {
    tickets,
    pagination,
    setPagination,
    ticketCount,
    isFetching,
    isSearchMode,
    ticketSorter,
    setTicketSorter,
    isSearched,
  } = useContext(TicketsContext);
  const location = useLocation();
  const appId = useAppId();
  const [currentQuery, setCurrentQuery] = useState<TicketSearchURLQuery[keyof TicketSearchURLQuery][] | string>([]);

  const handleSortChange = useCallback(
    (sortColumn?: TableColumnProps<Ticket>, sortOrder?: SortOrder) => {
      if (sortColumn && sortOrder) {
        setTicketSorter({
          sortBy: sortColumn.key as TicketSortBy,
          order: sortOrder,
        });
      }
    },
    [setTicketSorter],
  );

  const handlePageChange = (page: number, pageSize: PerPage) => {
    const offset = page === 1 ? 0 : page - 1;
    setPagination({
      offset: offset * pageSize,
      limit: pageSize,
      page,
    });
  };

  const handleItemsPerPageChange = (page: number, pageSize: PerPage) => {
    setPagination({
      offset: 0,
      limit: pageSize,
      page,
    });
  };

  const getDefaultSortedOrder = useCallback(
    (key: TicketSortBy) => {
      return ticketSorter.sortBy === key ? ticketSorter.order : undefined;
    },
    [ticketSorter],
  );

  const triggerHandleActionChange = (action, ticket) => {
    setTimeout(() => {
      handleActionChange({ action, ticket });
    }, 150);
  };

  const rowActions = (record: Ticket) => {
    let actions;
    if (record.status === TicketStatus.CLOSED) {
      actions = [
        {
          label: intl.formatMessage({
            id: 'label.reopenTicket',
          }),
          onClick: () => {
            triggerHandleActionChange('REOPEN_TICKET', record);
          },
        },
      ];
    } else {
      if (record.recentAssignment) {
        actions = [
          {
            label: intl.formatMessage({
              id: 'desk.tickets.action.transfer.lbl.toAgent',
            }),
            onClick: () => {
              triggerHandleActionChange('TRANSFER_TO_AGENT', record);
            },
          },
        ];
      } else {
        actions = [
          {
            label: intl.formatMessage({
              id: 'label.assignToAgent',
            }),
            onClick: () => {
              triggerHandleActionChange('ASSIGN_TO_AGENT', record);
            },
          },
        ];
      }

      if (record.group) {
        actions.push({
          label: intl.formatMessage({
            id: 'desk.tickets.action.group.lbl.transferToGroup',
          }),
          onClick: () => {
            triggerHandleActionChange('TRANSFER_TO_GROUP', record);
          },
        });
      }

      if (
        record.recentAssignment &&
        record.status === 'ASSIGNED' &&
        record.recentAssignment.status === 'NOT_RESPONSED'
      ) {
        actions.push({
          label: intl.formatMessage({ id: 'desk.tickets.action.moveToIdle' }),
          onClick: () => {
            triggerHandleActionChange('MOVE_TO_IDLE', record);
          },
        });
      }

      actions.push(OverflowMenu.divider);

      if (record.status !== 'UNASSIGNED') {
        actions.push({
          label: intl.formatMessage({
            id: 'label.closeTicket',
          }),
          onClick: () => {
            triggerHandleActionChange('CLOSE_TICKET', record);
          },
        });
      }
    }

    actions.push({
      label: intl.formatMessage({ id: 'desk.tickets.action.lbl.exportToCSV' }),
      onClick: () => {
        triggerHandleActionChange('EXPORT_TICKET', record);
      },
    });

    actions.push({
      label: intl.formatMessage({
        id: 'desk.tickets.action.lbl.copyUrl',
      }),
      onClick: () => {
        copy(getTicketURL(record.id, true));
        toast.success({ message: intl.formatMessage({ id: 'desk.tickets.action.lbl.copyUrl.success' }) });
      },
    });

    return [
      <OverflowMenu
        key="ticketsActions"
        items={actions}
        iconButtonProps={{ buttonType: 'tertiary' }}
        stopClickEventPropagation={true}
      />,
    ];
  };

  const getNoMatchDescription = () => {
    if (!isSearched) {
      return intl.formatMessage({ id: 'desk.tickets.ticketList.search.empty.desc' });
    }
    if (typeof currentQuery === 'string') {
      return intl.formatMessage({ id: 'desk.tickets.search.manual.noMatch.description' }, { query: currentQuery });
    }
    if (currentQuery.length === 1) {
      return intl.formatMessage({ id: 'desk.tickets.search.singleFilter.noMatch.description' });
    }
    return intl.formatMessage({ id: 'desk.tickets.search.multiFilters.noMatch.description' });
  };

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
    <>
      <TicketListTable
        rowKey="id"
        columns={[
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.status' }),
            key: TicketSortBy.STATUS,
            dataIndex: 'status',
            render: (record) => {
              return <TicketStatusLozenge ticketStatus={record.status2} />;
            },
            width: '100px',
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(TicketSortBy.STATUS),
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.priority' }),
            key: TicketSortBy.PRIORITY,
            dataIndex: 'priority',
            render: (record) => {
              return <PriorityBadge priority={record.priority} showLabel={true} />;
            },
            width: '100px',
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(TicketSortBy.PRIORITY),
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.subject' }),
            key: TicketSortBy.SUBJECT,
            dataIndex: 'channelName',
            width: '25%',
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(TicketSortBy.SUBJECT),
            render: (ticket) => (
              <TicketSubject ticket={ticket} subjectLinkTo={`/${appId}/desk/tickets/${ticket.id}${location.search}`} />
            ),
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.customer' }),
            key: TicketSortBy.CUSTOMER,
            dataIndex: 'customer',
            render: (record) => <TicketCustomer ticket={record} />,
            width: '15%',
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.team' }),
            key: TicketSortBy.TEAM,
            dataIndex: 'team',
            render: (record) => {
              return record.group ? <Tag maxWidth={120}>{record.group.name}</Tag> : <span>{EMPTY_TEXT}</span>;
            },
            width: '140px',
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.agent' }),
            key: TicketSortBy.ASSIGNEE,
            dataIndex: 'id',
            render: (record) => {
              // Leave old code to figure out what is the cause
              // if (record.status === 'UNASSIGNED') {
              //   return <span>-</span>;
              // }
              return <TicketAgent agent={record.recentAssignment?.agent} />;
            },
            width: '15%',
            sorter: false, // FIXME: Temporarily disabled agent sorting because of performance issue from backend side
            defaultSortOrder: getDefaultSortedOrder(TicketSortBy.ASSIGNEE),
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.csat' }),
            key: TicketSortBy.CSAT,
            dataIndex: 'customerSatisfactionScore',
            styles: css`
              min-width: 80px;
            `,
            render: ({ customerSatisfactionScore: score }) => (
              <TicketCSAT
                score={score}
                styles={css`
                  font-weight: 500;
                  line-height: 1.43;
                  letter-spacing: -0.3px;
                `}
              />
            ),
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(TicketSortBy.CSAT),
          },
          {
            title: intl.formatMessage({ id: 'desk.tickets.ticketList.table.column.lbl.created' }),
            key: TicketSortBy.CREATED,
            dataIndex: 'createdAt',
            render: ({ createdAt }) => {
              return moment.tz(createdAt, timezone).format('lll');
            },
            width: '20%',
            sorter: true,
            defaultSortOrder: getDefaultSortedOrder(TicketSortBy.CREATED),
          },
        ]}
        dataSource={tickets}
        loading={isFetching}
        footer={
          <TicketListPagination
            current={pagination.page}
            total={ticketCount}
            pageSize={pagination.limit as PerPage}
            pageSizeOptions={[10, 20, 50, 100] as ReadonlyArray<PerPage>}
            onChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        }
        emptyView={
          isSearchMode ? (
            <CenteredEmptyState
              icon={isSearched ? 'no-search' : 'tickets'}
              title={intl.formatMessage({
                id: isSearched
                  ? 'desk.tickets.ticketList.searched.empty.title'
                  : 'desk.tickets.ticketList.search.empty.title',
              })}
              description={getNoMatchDescription()}
            />
          ) : (
            <CenteredEmptyState
              icon="tickets"
              title={intl.formatMessage({ id: 'desk.tickets.ticketList.list.empty.title' })}
              description={intl.formatMessage({ id: 'desk.tickets.ticketList.list.empty.desc' })}
            />
          )
        }
        showScrollbars={true}
        onSortByUpdated={handleSortChange}
        rowActions={rowActions}
      />
    </>
  );
};
