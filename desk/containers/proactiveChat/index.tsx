import {
  memo,
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
  MouseEventHandler,
  ComponentProps,
  FC,
  ReactNode,
  ReactElement,
} from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  DateRange,
  DateRangePickerValue,
  EmptyState,
  EmptyStateSize,
  IconButton,
  InputText,
  Link,
  LinkVariant,
  Table,
  TableColumnProps,
  TableProps,
  toast,
  Tooltip,
  TooltipRef,
  TooltipTargetIcon,
  TooltipTrigger,
  transitions,
} from 'feather';
import moment from 'moment-timezone';

import { LIST_LIMIT, SortOrder, ISO_DATE_FORMAT, EMPTY_TEXT, TicketStatus } from '@constants';
import { getProactiveChatTickets } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAppId, useAuthorization } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString } from '@hooks/useQueryString';
import {
  Paginator,
  TableMenu,
  TicketAgent,
  TicketCustomer,
  TicketFormattedTime,
  TicketTeam,
  PriorityBadge,
  PageHeader,
  TablePageContainer,
  LocalizedDateRangePicker,
} from '@ui/components';
import { ProactiveChatMessageCountBadge } from '@ui/components/ProactiveChatMessageCountBadge';
import { useDrawer } from '@ui/components/drawer/useDrawer';
import { PropOf } from '@utils';
import { logException } from '@utils/logException';

import { AgentOrTeamDropdown } from '../AgentOrTeamDropdown';
import { drawerId, ProactiveChatViewDrawer } from '../ProactiveChatViewDrawer/ProactiveChatViewDrawer';
import { TicketPriorityFilter } from '../TicketPriorityFilter';
import { DefaultFilterItemId, getDefaultTicketSearchQueryParam } from '../TicketSearchInput';

type Props = {};

const ProactiveChat = styled(TablePageContainer)`
  ${PageHeader} + * {
    margin-top: 24px;
  }
`;

const ProactiveContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const FullMessageTooltip = styled(Tooltip)`
  width: 100%;
`;

const Message = styled.p`
  display: -webkit-box;
  max-width: 100%;
  overflow: hidden;
  word-break: normal;
  color: ${cssVariables('neutral-10')};
  font-size: 14px;
  font-weight: 500;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
`;

const Filter = styled.span`
  display: inline-block;
  vertical-align: center;

  & + & {
    margin-left: 4px;
  }
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchButton = styled(IconButton)<{ isShow: boolean }>`
  position: absolute;
  top: 4px;
  right: 8px;
  opacity: ${({ isShow }) => (isShow ? 1 : 0)};
  transform: translateX(${({ isShow }) => (isShow ? 0 : 8)}px);
  transition: ${transitions({ properties: ['transform', 'opacity'], duration: 0.3 })};
`;

const SubjectContainer = styled.div`
  display: flex;
  align-items: flex-start;
  width: 100%;
`;

const SubjectText = styled.div`
  display: inline-flex;
  align-items: center;
  flex: auto;
  white-space: nowrap;
  font-weight: 500;
`;

const TooltipWrapper = styled(Tooltip)``;

TooltipWrapper.displayName = 'Tooltip';

const ProactiveChatTable = (props: TableProps<ProactiveChatTicket>) => <Table<ProactiveChatTicket> {...props} />;
const ProactiveChatTicketsTable = styled(ProactiveChatTable)`
  flex: 1;
  overflow: visible;
`;

const ProactiveChatPaginator = styled(Paginator)`
  margin-left: auto;
`;

const dateRangePickerValueMap = {
  7: DateRangePickerValue.Last7Days,
  14: DateRangePickerValue.Last14Days,
  30: DateRangePickerValue.Last30Days,
  90: DateRangePickerValue.Last90Days,
};

const getDateRangePickerValue = (
  startDateMoment: moment.Moment | undefined,
  endDateMoment: moment.Moment | undefined,
) => {
  if (!startDateMoment || !endDateMoment) {
    return DateRangePickerValue.AllDates;
  }

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

enum ProactiveSortBy {
  MESSAGE = 'proactive_chat__message',
  SUBJECT = 'ticket__channel_name',
  RECEIVER = 'ticket__customer__display_name',
  TEAM = 'proactive_chat__assigned_group__name',
  SENDER = 'proactive_chat__created_by__display_name',
  REPLY_RECEIVED_ON = 'ticket__issued_at',
  SENT_ON = 'proactive_chat__created_at',
}

const defaultQueryString = {
  page: 1,
  pageSize: LIST_LIMIT as PerPage,
  sortBy: ProactiveSortBy.SENT_ON,
  sortOrder: SortOrder.DESCEND,
  startDate: undefined,
  endDate: undefined,
  agentId: undefined,
  teamId: undefined,
  priority: undefined,
  query: '',
};

type SearchParams = {
  page: number;
  pageSize: PerPage;
  sortBy: ProactiveSortBy;
  sortOrder: SortOrder;
  startDate: string | undefined;
  endDate: string | undefined;
  agentId: Agent['id'] | undefined;
  teamId: AgentGroup['id'] | undefined;
  priority: Priority | undefined;
  query: string;
};

const ProactiveChatSubject: FC<{ isProactive?: boolean; wrapper: (children: ReactNode) => ReactElement }> = ({
  isProactive = false,
  wrapper,
  children,
}) => <>{isProactive ? children : wrapper(children)}</>;

export const ProactiveChatList = memo<Props>(() => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const appId = useAppId();
  const { isPermitted } = useAuthorization();
  const isAgent = isPermitted(['desk.agent']);
  const { openDrawer } = useDrawer();
  const { getErrorMessage } = useDeskErrorHandler();

  const [proactiveChats, setProactiveChats] = useState<ProactiveChatTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const messageTooltipRefs = useRef<Record<number, TooltipRef | null>>({});

  const {
    page,
    pageSize,
    sortBy,
    sortOrder,
    startDate,
    endDate,
    agentId,
    teamId,
    query,
    priority,
    updateParams,
  } = useQueryString<SearchParams>(defaultQueryString);
  const { handleSubmit, register, setValue, watch } = useForm<Pick<SearchParams, 'query'>>({ mode: 'onChange' });
  const currentQuery = watch('query');

  const startDateMoment = startDate ? moment(startDate) : undefined;
  const endDateMoment = endDate ? moment(endDate) : undefined;

  const fetchProactiveChats = useCallback(
    async ({ offset, limit, q, sortBy, sortOrder }) => {
      const sortByPrefix = sortOrder === SortOrder.DESCEND ? '-' : '';
      setIsFetching(true);

      try {
        const {
          data: { count, results },
        } = await getProactiveChatTickets(pid, region, {
          offset,
          limit,
          q,
          startDate: startDate ? moment(startDate).format(ISO_DATE_FORMAT) : undefined,
          endDate: endDate ? moment(endDate).format(ISO_DATE_FORMAT) : undefined,
          createdBy: agentId,
          groupId: teamId,
          order: `${sortByPrefix}${sortBy}`,
          priority,
        });
        setTotal(count);
        setProactiveChats(results);
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        logException(error);
      } finally {
        setIsFetching(false);
      }
    },
    [agentId, endDate, getErrorMessage, pid, priority, region, startDate, teamId],
  );

  useEffect(() => {
    fetchProactiveChats({ offset: pageSize * (page - 1), limit: pageSize, q: query, sortBy, sortOrder });
  }, [fetchProactiveChats, page, pageSize, query, sortBy, sortOrder]);

  useEffect(() => {
    setValue('query', query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const messageTooltipRefCallback = (id: number) => (ref: TooltipRef | null) => {
    messageTooltipRefs.current[id] = ref;
  };

  const handleMessageMouseEnter: (id: number) => MouseEventHandler<HTMLSpanElement> = (id) => (event) => {
    const tooltipRef = messageTooltipRefs.current[id];
    if (tooltipRef == null) {
      return;
    }
    const parentCellWidth = event.currentTarget.closest('td')?.clientWidth ?? 0;
    if (event.currentTarget.clientWidth < parentCellWidth) {
      return;
    }
    tooltipRef.show();
  };

  const handleMessageMouseLeave: (id: number) => MouseEventHandler<HTMLSpanElement> = (id) => () => {
    const tooltipRef = messageTooltipRefs.current[id];
    if (tooltipRef == null) {
      return;
    }
    tooltipRef.hide();
  };

  const handleDateRangeChange = useCallback(
    (_: DateRangePickerValue, dateRange: DateRange | undefined) => {
      updateParams({
        page: 1,
        startDate: dateRange?.startDate.format(ISO_DATE_FORMAT),
        endDate: dateRange?.endDate.format(ISO_DATE_FORMAT),
      });
    },
    [updateParams],
  );

  const handleSortChange = useCallback(
    (sortColumn?: TableColumnProps<ProactiveChatTicket>, sortOrder?: SortOrder) => {
      sortColumn && sortOrder && updateParams({ sortBy: sortColumn.key as ProactiveSortBy, sortOrder });
    },
    [updateParams],
  );

  const handlePaginationChange = useCallback<ComponentProps<typeof Paginator>['onChange']>(
    (nextPage, nextPageSize) => {
      updateParams({ page: nextPage, pageSize: nextPageSize });
    },
    [updateParams],
  );

  const handleSearchClear = useCallback(
    (e) => {
      e && e.preventDefault();
      setValue('query', '');
      updateParams({ page: 1, query: '' });
    },
    [updateParams, setValue],
  );

  const onSubmit = useCallback(
    (data) => {
      updateParams({ page: 1, query: data['query'] });
    },
    [updateParams],
  );

  const sender: PropOf<typeof AgentOrTeamDropdown, 'selectedItemId'> = useMemo(() => {
    if (agentId) {
      return { id: Number(agentId), type: 'agent' };
    }
    if (teamId) {
      return { id: Number(teamId), type: 'team' };
    }
    return undefined;
  }, [agentId, teamId]);

  const ProactiveChatFilter = useMemo(() => {
    return (
      <TableMenu>
        <Filter>
          <AgentOrTeamDropdown
            selectedItemId={sender}
            placeholder={intl.formatMessage({ id: 'desk.proactiveChat.ticketList.filter.agent.placeholder' })}
            unselectItemLabel={intl.formatMessage({ id: 'desk.proactiveChat.ticketList.filter.agent.all' })}
            disabled={isFetching}
            onChange={(selectedItem, itemType) => {
              if (selectedItem == null) {
                updateParams({ page: 1, teamId: undefined, agentId: undefined });
                return;
              }
              if (itemType === 'agent') {
                updateParams({ page: 1, teamId: undefined, agentId: selectedItem.id });
                return;
              }
              updateParams({ page: 1, agentId: undefined, teamId: selectedItem.id });
            }}
          />
        </Filter>
        <Filter>
          <TicketPriorityFilter
            selectedItem={priority}
            onChange={(item) => updateParams({ priority: item, page: 1 })}
            disabled={isFetching}
          />
        </Filter>
        <Filter>
          <LocalizedDateRangePicker
            value={getDateRangePickerValue(startDateMoment, endDateMoment)}
            dateRange={startDate && endDate ? { startDate: moment(startDate), endDate: moment(endDate) } : undefined}
            disabled={isFetching}
            maxDate={moment()}
            onChange={handleDateRangeChange}
            size="small"
          />
        </Filter>
        <Filter>
          <TooltipWrapper
            content={intl.formatMessage({ id: 'desk.proactiveChat.ticketList.info.tooltip' })}
            placement="right"
          >
            <TooltipTargetIcon icon="info" size={16} />
          </TooltipWrapper>
        </Filter>
      </TableMenu>
    );
  }, [
    intl,
    isFetching,
    sender,
    priority,
    startDateMoment,
    endDateMoment,
    startDate,
    endDate,
    handleDateRangeChange,
    updateParams,
  ]);

  const ProactiveList = useMemo(() => {
    return (
      <ProactiveChatTicketsTable
        rowKey="id"
        loading={isFetching}
        dataSource={proactiveChats}
        showScrollbars={true}
        onSortByUpdated={handleSortChange}
        columns={[
          {
            key: ProactiveSortBy.MESSAGE,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.message' }),
            dataIndex: 'message',
            sorter: true,
            flex: 2.5,
            render: ({ id, proactiveChat }) => {
              const { message } = proactiveChat;
              return (
                <FullMessageTooltip
                  trigger={TooltipTrigger.Manual}
                  ref={messageTooltipRefCallback(id)}
                  content={message}
                  placement="bottom"
                  popperProps={{
                    modifiers: { preventOverflow: { boundariesElement: 'viewport' } },
                  }}
                >
                  <Message onMouseEnter={handleMessageMouseEnter(id)} onMouseLeave={handleMessageMouseLeave(id)}>
                    {message}
                  </Message>
                </FullMessageTooltip>
              );
            },
          },
          {
            key: 'priority',
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.priority' }),
            width: 100,
            render: ({ ticket }) => <PriorityBadge priority={ticket.priority} showLabel={true} />,
          },
          {
            key: ProactiveSortBy.SUBJECT,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.subject' }),
            dataIndex: 'ticket',
            sorter: true,
            width: 232,
            render: ({ ticket, proactiveChat }) => (
              <SubjectContainer>
                <SubjectText data-test-id="SubjectText">
                  <ProactiveChatSubject
                    isProactive={ticket.status2 === TicketStatus.PROACTIVE}
                    wrapper={(children) => {
                      const queryParam = getDefaultTicketSearchQueryParam(
                        DefaultFilterItemId.TicketID,
                        ticket.id.toString(),
                      );
                      return (
                        <Link
                          variant={LinkVariant.Neutral}
                          href={
                            isAgent
                              ? `/${appId}/desk/conversation/${ticket.id}?${queryParam}`
                              : `/${appId}/desk/tickets/${ticket.id}?${queryParam}`
                          }
                          useReactRouter={true}
                        >
                          {children}
                        </Link>
                      );
                    }}
                  >
                    {ticket.channelName || EMPTY_TEXT}
                  </ProactiveChatSubject>
                  <ProactiveChatMessageCountBadge
                    messageCount={proactiveChat.messageCount}
                    css={css`
                      margin-left: 4px;
                    `}
                  />
                </SubjectText>
                {ticket.status2 === TicketStatus.PROACTIVE && (
                  <IconButton
                    icon="proactive-chat"
                    buttonType="tertiary"
                    size="small"
                    title={intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.button.sendMessage.tooltip' })}
                    tooltipPlacement="top"
                    css={css`
                      margin-top: -6px;
                    `}
                    onClick={() =>
                      openDrawer(drawerId, {
                        ticket,
                        onClose: () => {
                          fetchProactiveChats({
                            offset: (page - 1) * pageSize,
                            limit: pageSize,
                            sortBy,
                            sortOrder,
                          });
                        },
                      })
                    }
                  />
                )}
              </SubjectContainer>
            ),
          },
          {
            key: ProactiveSortBy.RECEIVER,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.receiver' }),
            dataIndex: 'customer',
            sorter: true,
            render: (proactiveChatTickets) => <TicketCustomer ticket={proactiveChatTickets.ticket} />,
          },
          {
            key: ProactiveSortBy.TEAM,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.team' }),
            dataIndex: 'team',
            sorter: true,
            render: ({ ticket }) => <TicketTeam teamName={ticket.group?.name} />,
          },
          {
            key: ProactiveSortBy.SENDER,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.sender' }),
            dataIndex: 'assignee',
            sorter: true,
            render: (proactiveChatTickets) => (
              <TicketAgent agent={proactiveChatTickets.proactiveChat.createdBy} isShowAgentThumbnail={true} />
            ),
          },
          {
            key: ProactiveSortBy.REPLY_RECEIVED_ON,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.repliedOn' }),
            dataIndex: 'repliedAt',
            sorter: true,
            render: (proactiveChatTickets) => (
              <TicketFormattedTime timestamp={proactiveChatTickets.ticket.issuedAt} format="lll" />
            ),
          },
          {
            key: ProactiveSortBy.SENT_ON,
            title: intl.formatMessage({ id: 'desk.proactiveChat.ticketList.table.label.sentOn' }),
            dataIndex: 'createdAt',
            sorter: true,
            render: (proactiveChatTickets) => (
              <TicketFormattedTime timestamp={proactiveChatTickets.proactiveChat.createdAt} format="lll" />
            ),
          },
        ]}
        footer={
          <ProactiveChatPaginator
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={handlePaginationChange}
            onItemsPerPageChange={handlePaginationChange}
          />
        }
        emptyView={
          <EmptyState
            title={intl.formatMessage({
              id: query?.trim()
                ? 'desk.proactiveChat.ticketList.searched.empty.title'
                : 'desk.proactiveChat.ticketList.noTicket.title',
            })}
            description={intl.formatMessage(
              {
                id: query?.trim()
                  ? 'desk.proactiveChat.ticketList.searched.empty.desc'
                  : 'desk.proactiveChat.ticketList.noTicket.desc',
              },
              { query: query?.trim() },
            )}
            icon="proactive-chat"
            size={EmptyStateSize.Large}
            css={css`
              margin: 90px auto;
            `}
          />
        }
      />
    );
  }, [
    isFetching,
    proactiveChats,
    handleSortChange,
    intl,
    page,
    total,
    pageSize,
    handlePaginationChange,
    query,
    appId,
    isAgent,
    openDrawer,
    fetchProactiveChats,
    sortBy,
    sortOrder,
  ]);

  return (
    <>
      <ProactiveChat>
        <PageHeader>
          <PageHeader.Title>{intl.formatMessage({ id: 'desk.proactiveChat.title' })}</PageHeader.Title>
          <PageHeader.Actions>
            <form name="proactive" onSubmit={handleSubmit(onSubmit)}>
              <SearchContainer>
                <InputText
                  ref={register}
                  name="query"
                  placeholder={intl.formatMessage({ id: 'desk.proactiveChat.ticketList.search.placeholder' })}
                  size="small"
                  disabled={isFetching}
                  css={css`
                    width: 232px;
                  `}
                />
                <SearchButton
                  icon="search"
                  size="xsmall"
                  type="submit"
                  isShow={currentQuery?.trim().length === 0}
                  buttonType="secondary"
                  disabled={isFetching}
                />
                <SearchButton
                  icon="close"
                  size="xsmall"
                  buttonType="secondary"
                  disabled={isFetching || !currentQuery}
                  isShow={!!currentQuery}
                  onClick={handleSearchClear}
                />
              </SearchContainer>
            </form>
          </PageHeader.Actions>
        </PageHeader>
        <ProactiveContainer>
          {ProactiveChatFilter}
          {ProactiveList}
        </ProactiveContainer>
      </ProactiveChat>
      <ProactiveChatViewDrawer />
    </>
  );
});
