import { FC, useEffect, useState, ComponentProps } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  cssVariables,
  Headings,
  Avatar,
  AvatarType,
  IconButton,
  Spinner,
  Table,
  AvatarProps,
  Lozenge,
  DateRangePicker,
  DateRangePickerValue,
  DateRange,
  Dropdown,
  Subtitles,
  Tooltip,
  ContextualHelp,
  Icon,
  TableColumnProps,
} from 'feather';
import moment from 'moment-timezone';

import { DeskBotWebhookStatus, ISO_DATE_FORMAT } from '@constants';
import * as deskApi from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync, usePagination } from '@hooks';
import { LocalizedDateRangePicker, Paginator } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { TransitionedDrawer } from '@ui/components/drawer/TransitionedDrawer';

import { useBotWebhookLogs, BOT_WEBHOOK_LOG_DRAWER_ID } from './useBotWebhookLogs';

enum DeliveryStatus {
  SUCCESS,
  ERROR,
  ALL,
}

const deliveryStatusDetailsMap = {
  [DeliveryStatus.SUCCESS]: [
    DeskBotWebhookStatus.INITIALIZED,
    DeskBotWebhookStatus.SENT,
    DeskBotWebhookStatus.RECEIVED,
  ],
  [DeliveryStatus.ERROR]: [DeskBotWebhookStatus.ERROR, DeskBotWebhookStatus.TIMEOUT],
  [DeliveryStatus.ALL]: [
    DeskBotWebhookStatus.INITIALIZED,
    DeskBotWebhookStatus.SENT,
    DeskBotWebhookStatus.RECEIVED,
    DeskBotWebhookStatus.ERROR,
    DeskBotWebhookStatus.TIMEOUT,
  ],
};

type DeliveryStatusFilterItem = {
  labelKey: string;
  status: DeliveryStatus;
};

const deliveryStatusFilterItems = [
  {
    labelKey: 'desk.settings.bots.sidebar.webhookLogs.filter.deliveryStatus.all',
    status: DeliveryStatus.ALL,
  },
  {
    labelKey: 'desk.settings.bots.sidebar.webhookLogs.filter.deliveryStatus.success',
    status: DeliveryStatus.SUCCESS,
  },
  {
    labelKey: 'desk.settings.bots.sidebar.webhookLogs.filter.deliveryStatus.error',
    status: DeliveryStatus.ERROR,
  },
];

const DrawerContainer = styled(TransitionedDrawer)`
  padding-top: 16px;
  padding-right: 24px;
  padding-left: 24px;
  width: 560px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 32px;
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 64px); // 64px = Header height
`;

const Title = styled.h2`
  ${Headings['heading-03']};
`;

const FiltersWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 24px 0;

  > * + * {
    margin-left: 8px;
  }
`;

const BotInfoWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${cssVariables('neutral-3')};
  border-radius: 4px;
  padding: 16px;
`;

const BotName = styled.div`
  margin-left: 12px;
  max-width: 436px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${cssVariables('neutral-10')};
  ${Headings['heading-01']};
`;

const DeliveryStatusFilterToggle = styled.div`
  margin-left: 16px;
  margin-right: 4px;
  ${Subtitles['subtitle-01']};
`;

const useTableColumns: () => TableColumnProps<DeskBotWebhookLog>[] = () => {
  const intl = useIntl();

  return [
    {
      title: intl.formatMessage({ id: 'desk.settings.bots.sidebar.webhookLogs.table.th.status' }),
      dataIndex: 'status',
      render: ({ status }) => {
        if (status === 'ERROR' || status === 'TIMEOUT') {
          return (
            <Lozenge color="red">
              {intl.formatMessage({
                id: 'desk.settings.bots.sidebar.webhookLogs.filter.deliveryStatus.error',
              })}
            </Lozenge>
          );
        }
        return (
          <Lozenge color="green">
            {intl.formatMessage({
              id: 'desk.settings.bots.sidebar.webhookLogs.filter.deliveryStatus.success',
            })}
          </Lozenge>
        );
      },
    },
    {
      title: intl.formatMessage({ id: 'desk.settings.bots.sidebar.webhookLogs.table.th.endpoint' }),
      dataIndex: 'webhookUrl',
      width: 220,
    },
    {
      title: intl.formatMessage({ id: 'desk.settings.bots.sidebar.webhookLogs.table.th.created' }),
      dataIndex: 'createdAt',
      width: 180,
      render: ({ createdAt }) => moment(createdAt).format('lll'),
    },
  ];
};

export const BotWebhookLogsSidebar: FC = () => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const { webhook, closeWebhookLogs } = useBotWebhookLogs();
  const columns = useTableColumns();
  const { page, pageSize, setPagination } = usePagination(1, 20);
  const [deliveryStatus, setDeliveryStatus] = useState(DeliveryStatus.ALL);
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: moment().subtract(30, 'day'), endDate: moment() });
  const [date, setDate] = useState<DateRangePickerValue>(DateRangePickerValue.Last30Days);

  const [{ status: fetchDeskBotStatus, data: fetchDeskBotData }, fetchDeskBot] = useAsync(
    (id: DeskBot['id']) => deskApi.fetchDeskBot(pid, region, { id }),
    [pid, region],
  );
  const [
    { status: fetchDeskBotWebhookLogsStatus, data: fetchDeskBotWebhookLogsData },
    fetchDeskBotWebhookLogs,
  ] = useAsync((payload: FetchDeskBotWebhookLogsAPIPayload) => deskApi.fetchDeskBotWebhookLogs(pid, region, payload), [
    pid,
    region,
  ]);

  const handleDrawerCloseButtonClick = () => {
    closeWebhookLogs();
  };

  const handleDateRangePickerValueChange: ComponentProps<typeof DateRangePicker>['onChange'] = (value, dateRange) => {
    setDate(value);
    dateRange && setDateRange(dateRange);
  };

  const handleDeliveryStatusFilterItemSelected = (item: DeliveryStatusFilterItem) => {
    setDeliveryStatus(item.status);
  };

  const deliverStatusFilterItemToElement = ({ labelKey, status }) => {
    if (status === DeliveryStatus.ALL) {
      return intl.formatMessage({ id: labelKey });
    }
    return (
      <Lozenge color={status === DeliveryStatus.SUCCESS ? 'green' : 'red'}>
        {intl.formatMessage({ id: labelKey })}
      </Lozenge>
    );
  };

  useEffect(() => {
    if (webhook) {
      fetchDeskBot(webhook);
    }
  }, [webhook, fetchDeskBot]);

  useEffect(() => {
    if (webhook) {
      const { startDate, endDate } = dateRange;
      fetchDeskBotWebhookLogs({
        id: webhook,
        offset: (page - 1) * pageSize,
        limit: pageSize,
        startDate: startDate.format(ISO_DATE_FORMAT),
        endDate: endDate.format(ISO_DATE_FORMAT),
        status: deliveryStatusDetailsMap[deliveryStatus],
      });
    }
  }, [dateRange, deliveryStatus, fetchDeskBotWebhookLogs, page, pageSize, webhook]);

  useEffect(() => {
    setPagination(1, 20);
  }, [setPagination, date, deliveryStatus]);

  if (webhook) {
    return (
      <DrawerContainer id={BOT_WEBHOOK_LOG_DRAWER_ID} isFullHeight={true} isDarkBackground={true}>
        <Header>
          <Title>{intl.formatMessage({ id: 'desk.settings.bots.sidebar.webhookLogs.title' })}</Title>
          <IconButton
            icon="close"
            buttonType="secondary"
            size="small"
            onClick={handleDrawerCloseButtonClick}
            css={css`
              margin-left: auto;
            `}
          />
        </Header>
        <Body>
          {fetchDeskBotStatus === 'success' && fetchDeskBotData != null ? (
            <>
              <BotInfoWrapper>
                <Avatar
                  type={AvatarType.Bot}
                  size={32}
                  profileID={fetchDeskBotData.data.id}
                  status={fetchDeskBotData.data.agent.connection.toLowerCase() as AvatarProps['status']}
                  imageUrl={fetchDeskBotData.data.photoUrl}
                />
                <Tooltip
                  content={fetchDeskBotData.data.name}
                  tooltipContentStyle={css`
                    max-width: 258px;
                    word-break: break-word;
                  `}
                >
                  <BotName>{fetchDeskBotData.data.name}</BotName>
                </Tooltip>
              </BotInfoWrapper>
              <FiltersWrapper>
                <Dropdown
                  size="small"
                  items={deliveryStatusFilterItems}
                  itemToString={({ labelKey }) => intl.formatMessage({ id: labelKey })}
                  itemToElement={deliverStatusFilterItemToElement}
                  initialSelectedItem={deliveryStatusFilterItems[0]}
                  toggleRenderer={({ selectedItem }) =>
                    selectedItem && (
                      <DeliveryStatusFilterToggle>
                        {deliverStatusFilterItemToElement(selectedItem)}
                      </DeliveryStatusFilterToggle>
                    )
                  }
                  onItemSelected={handleDeliveryStatusFilterItemSelected}
                />
                <LocalizedDateRangePicker
                  size="small"
                  value={date}
                  dateRange={dateRange}
                  maximumNights={30}
                  onChange={handleDateRangePickerValueChange}
                />
                <ContextualHelp
                  content={intl.formatMessage({ id: 'desk.settings.bots.sidebar.webhookLogs.filter.date.tooltip' })}
                  placement="top"
                  popperProps={{ modifiers: { offset: { offset: '0, 8' } } }}
                >
                  <Icon icon="info" size={16} color={cssVariables('neutral-6')} />
                </ContextualHelp>
              </FiltersWrapper>
              <Table<DeskBotWebhookLog>
                columns={columns}
                dataSource={fetchDeskBotWebhookLogsData?.data.results ?? []}
                loading={fetchDeskBotWebhookLogsStatus === 'loading'}
                emptyView={
                  <CenteredEmptyState
                    icon="call-logs"
                    title={intl.formatMessage({ id: 'desk.settings.bots.sidebar.webhookLogs.table.noResult.title' })}
                    description={intl.formatMessage({
                      id: 'desk.settings.bots.sidebar.webhookLogs.table.noResult.desc',
                    })}
                  />
                }
                footer={
                  <Paginator
                    current={page}
                    total={fetchDeskBotWebhookLogsData?.data.count ?? 0}
                    pageSize={pageSize as PerPage}
                    pageSizeOptions={[10, 20, 50, 100]}
                    onChange={setPagination}
                    onItemsPerPageChange={setPagination}
                    css={css`
                      margin-left: auto;
                    `}
                  />
                }
                showScrollbars={true}
                css={css`
                  height: 100%;
                `}
              />
            </>
          ) : (
            <Spinner />
          )}
        </Body>
      </DrawerContainer>
    );
  }
  return null;
};
