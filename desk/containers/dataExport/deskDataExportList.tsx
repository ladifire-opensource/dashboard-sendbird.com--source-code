import React, { useContext, useCallback, useState, FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Table, TableProps, Button, Lozenge, TableColumnProps, cssVariables } from 'feather';
import moment from 'moment-timezone';

import { EMPTY_TEXT, DeskDataExportStatus, DEFAULT_PAGE_SIZE_OPTIONS, SortOrder } from '@constants';
import { Paginator } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';
import { camelCaseKeys } from '@utils';

import { STATUS_MAP, DATA_REQUEST_TYPE_MAP, DeskDataExportSortBy } from './constants';
import { DeskDataExportContext } from './deskDataExportContext';

const StyledTable = styled((props: TableProps<DeskDataExport>) => Table<DeskDataExport>(props))`
  flex: 1;
`;

const DeskDataExportPaginator = styled(Paginator)`
  margin-left: auto;
`;

const FailedMessage = styled.div`
  font-size: 12px;
  color: ${cssVariables('neutral-6')};
`;

const Download = React.memo<{ exportRecord: DeskDataExport }>(({ exportRecord }) => {
  const intl = useIntl();
  const { getDownloadURL } = useContext(DeskDataExportContext);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleClickDownloadButton = useCallback(async () => {
    setIsDownloading(true);
    await getDownloadURL(exportRecord.id);
    setIsDownloading(false);
  }, [exportRecord.id, getDownloadURL]);

  switch (exportRecord.status) {
    case DeskDataExportStatus.COMPLETED: {
      if (!exportRecord.filename) {
        return <div>{intl.formatMessage({ id: 'desk.dataExport.downloadStatus.completed.noMatch' })}</div>;
      }
      return (
        <Button
          buttonType="secondary"
          size="small"
          icon="download"
          onClick={handleClickDownloadButton}
          isLoading={isDownloading}
        >
          {intl.messages['desk.dataExport.downloadStatus.button.download']}
        </Button>
      );
    }
    case DeskDataExportStatus.FAILED: {
      return (
        <FailedMessage>{intl.formatMessage({ id: 'desk.dataExport.downloadStatus.failed.message' })}</FailedMessage>
      );
    }
    default: {
      return null;
    }
  }
});

const StatusLozenge = React.memo<{ status: DeskDataExportStatus }>(({ status }) => {
  const intl = useIntl();
  const statusItem = STATUS_MAP[status];
  return (
    <Lozenge data-test-id="StatusLozenge" color={statusItem.color}>
      {intl.formatMessage({ id: statusItem.label })}
    </Lozenge>
  );
});

const DateRange = React.memo<{ exportRecord: DeskDataExport }>(({ exportRecord }) => {
  if (exportRecord.params) {
    const params: DeskDataExportParams = camelCaseKeys(JSON.parse(exportRecord.params));
    const { startDate, endDate } = params;
    if (startDate && endDate) {
      return (
        <div>
          <div>{moment(startDate).format('lll')} - </div>
          <div>{moment(endDate).format('lll')}</div>
        </div>
      );
    }
  }
  return <>{EMPTY_TEXT}</>;
});

export const DeskDataExportList: FC = () => {
  const intl = useIntl();
  const { state, searchParams, isFiltered } = useContext(DeskDataExportContext);
  const { dataExports, exportsCount, isFetching } = state;
  const { updateParams, page, pageSize, sortBy, order } = searchParams;
  const handlePageChange = useCallback(
    (page: number, pageSize: PerPage) => {
      updateParams({
        page,
        pageSize,
      });
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
    (sortColumn?: TableColumnProps<DeskDataExport>, sortOrder?: SortOrder) => {
      sortColumn &&
        sortOrder &&
        updateParams({
          sortBy: sortColumn.key as DeskDataExportSortBy,
          order: sortOrder,
        });
    },
    [updateParams],
  );

  const getDefaultSortedOrder = useCallback(
    (key: DeskDataExportSortBy) => {
      return sortBy === key ? order : undefined;
    },
    [sortBy, order],
  );

  const getDataRequestType = (type?: string) => {
    if (!type || !Object.keys(DATA_REQUEST_TYPE_MAP).includes(type)) return EMPTY_TEXT;
    const { exportFrom: exportFromId, label: labelId } = DATA_REQUEST_TYPE_MAP[type];
    const exportFrom = intl.formatMessage({ id: exportFromId });
    const dataType = intl.formatMessage({ id: labelId });
    return `${exportFrom} > ${dataType}`;
  };

  return (
    <StyledTable
      rowKey="id"
      dataSource={dataExports}
      loading={isFetching}
      columns={[
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.id' }),
          key: 'id',
          dataIndex: 'id',
          flex: 1,
        },
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.requester' }),
          key: 'requester',
          flex: 2,
          render: (record) => <div>{record.createdBy?.displayName}</div>,
        },
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.dataType' }),
          dataIndex: 'requestType',
          key: 'requestType',
          flex: 2,
          render: ({ requestType }) => getDataRequestType(requestType),
        },
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.dateRange' }),
          key: 'dateRange',
          flex: 1,
          render: (record) => <DateRange exportRecord={record} />,
        },
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.createOn' }),
          dataIndex: 'createdAt',
          flex: 1,
          sorter: true,
          key: DeskDataExportSortBy.CREATED_AT,
          defaultSortOrder: getDefaultSortedOrder(DeskDataExportSortBy.CREATED_AT),
          render: ({ createdAt }) => (createdAt ? moment(createdAt).format('lll') : EMPTY_TEXT),
        },
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.expiration' }),
          dataIndex: 'expiredAt',
          flex: 1,
          sorter: true,
          key: DeskDataExportSortBy.EXPIRED_AT,
          defaultSortOrder: getDefaultSortedOrder(DeskDataExportSortBy.EXPIRED_AT),
          render: ({ expiredAt }) => (expiredAt ? moment(expiredAt).format('lll') : EMPTY_TEXT),
        },
        {
          title: intl.formatMessage({ id: 'desk.dataExport.exportList.table.column.status' }),
          dataIndex: 'status',
          key: 'status',
          flex: 1,
          render: ({ status }) => <StatusLozenge status={status as DeskDataExportStatus} />,
        },
        {
          key: 'download',
          flex: 2,
          render: (record) => <Download exportRecord={record} />,
        },
      ]}
      onSortByUpdated={handleSortChange}
      showScrollbars={true}
      emptyView={
        isFiltered ? (
          <CenteredEmptyState
            icon="no-data"
            title={intl.messages['desk.dataExport.exportList.noResult.title']}
            description={intl.messages['desk.dataExport.exportList.noResult.desc']}
          />
        ) : (
          <CenteredEmptyState
            icon="data-export"
            title={intl.messages['desk.dataExport.exportList.noData.title']}
            description={intl.messages['desk.dataExport.exportList.noData.desc']}
          />
        )
      }
      footer={
        <DeskDataExportPaginator
          current={page}
          total={exportsCount}
          pageSize={pageSize}
          pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
          onChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      }
    />
  );
};
