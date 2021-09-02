import { memo, useState, useEffect, useCallback, ComponentProps, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import styled from 'styled-components';

import {
  Table,
  TableColumnProps,
  SideMenu,
  createSideMenuItemWithCount,
  Tag,
  OverflowMenu,
  OverflowMenuProps,
  IconButton,
  Button,
  Tooltip,
  TooltipTargetIcon,
  transitionDefault,
  toast,
  InlineNotification,
} from 'feather';
import moment from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { EMPTY_TEXT, SortOrder, TicketStatus, LIST_LIMIT, DEFAULT_PAGE_SIZE_OPTIONS } from '@constants';
import { fetchMissedTickets } from '@desk/api/views';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useShowDialog } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { useQueryString } from '@hooks/useQueryString';
import { Paginator, TicketSubject, TicketCustomer, TicketAgent, PageHeader } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { CollapsibleSide, CollapsibleSideContext, useCollapsableSide } from '@ui/components/layout/collapsibleSide';
import { logException } from '@utils/logException';

enum MenuKeys {
  MISSED = 'missed',
}

export enum MissedSortBy {
  SUBJECT = 'channel_name',
  CUSTOMER = 'customer__display_name',
  TEAM = 'group__name',
  AGENT = 'recent_assignment__agent__display_name',
  CLOSED_AT = 'closed_at',
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  position: relative;
  padding: 0 32px;
  padding-top: 24px;
  height: 100%;
  background: white;
`;

const ViewsSideMenu = styled(SideMenu)<{ isCollapsed: boolean }>`
  height: 100%;
  opacity: ${(props) => (props.isCollapsed ? 0 : 1)};
  transition: opacity 0.2s ${transitionDefault};
`;

const ViewsPaginator = styled(Paginator)`
  margin-left: auto;
`;

const ViewsTable = styled(Table)`
  flex: 1;
  border: 0;
`;

const TitleAction = styled.div`
  display: flex;
  align-items: center;
`;

const NotificationWrapper = styled.div`
  margin-bottom: 24px;
`;

const RefreshButton = styled(IconButton)`
  margin-right: 16px;
`;

const CollapseToggleButton = styled(IconButton)<{ isCollapsed: boolean }>`
  position: absolute;
  left: -42px;
  top: 12px;
  transform: translateX(${({ isCollapsed }) => (isCollapsed ? '10px' : 0)});
  transition: transform 0.2s ${transitionDefault};
`;

const TitleTooltipIcon = styled(TooltipTargetIcon)`
  margin-left: 2px;
`;

type SearchParams = {
  page: number;
  pageSize: PerPage;
  sortBy?: MissedSortBy;
  sortOrder?: SortOrder;
};

type Props = {};

export const Views = memo<Props>(() => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();

  const { isCollapsed, setIsCollapsed } = useCollapsableSide();
  const { page, pageSize, sortBy, sortOrder, updateParams } = useQueryString<SearchParams>({
    page: 1,
    pageSize: LIST_LIMIT as PerPage,
    sortBy: MissedSortBy.CLOSED_AT,
    sortOrder: SortOrder.DESCEND,
  });

  const [isShownNotification, setIsShownNotification] = useState(false);
  const [activeMenuKey, setActiveMenuKey] = useState(MenuKeys.MISSED);
  const [views, setViews] = useState<Ticket[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(
    async ({ limit, offset, sortBy, sortOrder }) => {
      const sortByPrefix = sortOrder === SortOrder.DESCEND ? '-' : '';
      setIsFetching(true);

      try {
        switch (activeMenuKey) {
          case MenuKeys.MISSED: {
            const {
              data: { count, results },
            } = await fetchMissedTickets(pid, region, { limit, offset, order: `${sortByPrefix}${sortBy}` });
            setViews(results);
            setTotal(count);
            break;
          }

          default:
            setIsFetching(false);
            break;
        }
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
        logException(error);
      } finally {
        setIsFetching(false);
      }
    },
    [activeMenuKey, getErrorMessage, pid, region],
  );

  const handleRefreshClick = () => {
    fetchData({ offset: pageSize * (page - 1), limit: pageSize, sortBy, sortOrder });
  };

  const handleCollapsableToggleClick = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleSortChange = useCallback(
    (sortColumn?: TableColumnProps<Ticket>, sortOrder?: SortOrder) => {
      sortColumn && sortOrder && updateParams({ sortBy: sortColumn.key as MissedSortBy, sortOrder });
    },
    [updateParams],
  );

  const handlePaginationChange = useCallback<ComponentProps<typeof Paginator>['onChange']>(
    (nextPage, nextPageSize) => {
      updateParams({ page: nextPage, pageSize: nextPageSize });
    },
    [updateParams],
  );

  useEffect(() => {
    fetchData({ offset: pageSize * (page - 1), limit: pageSize, sortBy, sortOrder });
  }, [fetchData, page, pageSize, sortBy, sortOrder]);

  const viewColumn = useMemo<TableColumnProps<Ticket>[]>(() => {
    const getDefaultSortOrder = (key: MissedSortBy) => (key === sortBy ? sortOrder : undefined);
    switch (activeMenuKey) {
      case MenuKeys.MISSED:
        return [
          {
            key: MissedSortBy.SUBJECT,
            title: intl.formatMessage({ id: 'desk.views.detail.missed.table.column.subject' }),
            dataIndex: 'channelName',
            render: (record) => <TicketSubject ticket={record} />,
            flex: 2,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(MissedSortBy.SUBJECT),
          },
          {
            key: MissedSortBy.CUSTOMER,
            title: intl.formatMessage({ id: 'desk.views.detail.missed.table.column.customer' }),
            dataIndex: 'customer',
            render: (record) => <TicketCustomer ticket={record} />,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(MissedSortBy.CUSTOMER),
          },
          {
            key: MissedSortBy.TEAM,
            title: intl.formatMessage({ id: 'desk.views.detail.missed.table.column.team' }),
            dataIndex: 'group',
            render: (record) => (record.group ? <Tag maxWidth={120}>{record.group.name}</Tag> : <>{EMPTY_TEXT}</>),
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(MissedSortBy.TEAM),
          },
          {
            key: MissedSortBy.AGENT,
            title: intl.formatMessage({ id: 'desk.views.detail.missed.table.column.lastAssignee' }),
            dataIndex: 'recentAssignment',
            render: (record) => <TicketAgent agent={record.recentAssignment?.agent} />,
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(MissedSortBy.AGENT),
          },
          {
            title: intl.formatMessage({ id: 'desk.views.detail.missed.table.column.closedAt' }),
            key: MissedSortBy.CLOSED_AT,
            dataIndex: 'closedAt',
            render: ({ closedAt }) => (closedAt ? moment(closedAt).format('lll') : EMPTY_TEXT),
            width: '20%',
            sorter: true,
            defaultSortOrder: getDefaultSortOrder(MissedSortBy.CLOSED_AT),
          },
        ];

      default:
        return [];
    }
  }, [activeMenuKey, intl, sortBy, sortOrder]);

  const handleClickExportButton = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.ExportMissedTicket,
      dialogProps: {
        onSuccess: () => {
          setIsShownNotification(true);
        },
      },
    });
  }, [showDialog]);

  const handleCloseNotification = useCallback(() => {
    setIsShownNotification(false);
  }, [setIsShownNotification]);

  const rowActions = (ticket: Ticket) => {
    const actions: OverflowMenuProps['items'] = [];
    if (ticket.status2 === TicketStatus.CLOSED) {
      actions.push({
        label: intl.formatMessage({
          id: 'label.reopenTicket',
        }),
        onClick: () => {
          showDialog({
            dialogTypes: DialogType.ReopenTicket,
            dialogProps: {
              ticket,
              onSuccess: () => {
                fetchData({ offset: pageSize * (page - 1), limit: pageSize, sortBy, sortOrder });
              },
            },
          });
        },
      });
    }

    return [
      <OverflowMenu
        key="viewsTicketActions"
        items={actions}
        iconButtonProps={{ buttonType: 'tertiary' }}
        stopClickEventPropagation={true}
      />,
    ];
  };

  return (
    <CollapsibleSideContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <CollapsibleSide
        collapsedWidthOffset={31}
        collapsibleNode={
          <ViewsSideMenu
            isCollapsed={isCollapsed}
            title={intl.formatMessage({ id: 'desk.views.title' })}
            titleAction={
              <TitleAction data-test-id="TitleActions">
                <RefreshButton
                  icon="refresh"
                  title={intl.formatMessage({ id: 'desk.views.viewList.button.refresh.tooltip' })}
                  tooltipPlacement="bottom"
                  buttonType="tertiary"
                  size="small"
                  isLoading={isFetching}
                  disabled={isFetching}
                  onClick={handleRefreshClick}
                />
              </TitleAction>
            }
            activeItemKey={activeMenuKey}
            items={[
              createSideMenuItemWithCount({
                key: MenuKeys.MISSED,
                label: intl.formatMessage({ id: 'desk.views.viewList.missed.title' }),
                count: total,
                onClick: () => setActiveMenuKey(MenuKeys.MISSED),
              }),
            ]}
          />
        }
        contentNode={
          <Container>
            <CollapseToggleButton
              icon={isCollapsed ? 'expand' : 'collapse'}
              title={intl.formatMessage({
                id: isCollapsed
                  ? 'desk.views.viewList.button.toggle.expand.tooltip'
                  : 'desk.views.viewList.button.toggle.collapse.tooltip',
              })}
              tooltipPlacement="bottom-start"
              buttonType="tertiary"
              size="small"
              iconSize={24}
              disabled={isFetching}
              isCollapsed={isCollapsed}
              onClick={handleCollapsableToggleClick}
            />
            <PageHeader
              css={`
                & + * {
                  margin-top: 24px;
                }
              `}
            >
              <PageHeader.Title>
                {intl.formatMessage({ id: 'desk.views.detail.missed.title' })}
                <Tooltip content={intl.formatMessage({ id: 'desk.views.title.tooltip' })} placement="right">
                  <TitleTooltipIcon icon="info" size={16} />
                </Tooltip>
              </PageHeader.Title>
              <PageHeader.Actions>
                <Button size="small" buttonType="secondary" icon="export" onClick={handleClickExportButton}>
                  {intl.formatMessage({ id: 'desk.views.detail.missed.export' })}
                </Button>
              </PageHeader.Actions>
            </PageHeader>
            {isShownNotification && (
              <NotificationWrapper data-test-id="InlineNotification">
                <InlineNotification
                  type="info"
                  message={intl.formatMessage(
                    { id: 'desk.dataExport.notification.dataExport.start' },
                    {
                      link: <Link to="data_exports">{intl.formatMessage({ id: 'desk.dataExport.title' })}</Link>,
                    },
                  )}
                  onClose={handleCloseNotification}
                />
              </NotificationWrapper>
            )}
            <ViewsTable
              rowKey="id"
              dataSource={views}
              columns={viewColumn}
              loading={isFetching}
              showScrollbars={true}
              onSortByUpdated={handleSortChange}
              rowActions={rowActions}
              footer={
                <ViewsPaginator
                  current={page}
                  total={total}
                  pageSize={pageSize as PerPage}
                  pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS as ReadonlyArray<PerPage>}
                  onChange={handlePaginationChange}
                  onItemsPerPageChange={handlePaginationChange}
                />
              }
              emptyView={
                <CenteredEmptyState
                  icon="tickets"
                  title={intl.formatMessage({ id: 'desk.views.detail.missed.table.empty.title' })}
                  description={intl.formatMessage({ id: 'desk.views.detail.missed.table.empty.description' })}
                />
              }
            />
          </Container>
        }
      />
    </CollapsibleSideContext.Provider>
  );
});
