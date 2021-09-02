import { FC, useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { TableColumnProps, cssVariables, Button, Body } from 'feather';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment-timezone';

import { DEFAULT_DATE_FORMAT, EMPTY_TEXT } from '@constants';
import { useAuthorization } from '@hooks';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';
import { CONTACT_US_ALLOWED_PERMISSIONS } from '@hooks/useOrganizationMenu';
import { TabMenu, LoadMoreTable, LinkWithPermissionCheck, TablePageContainer, PageHeader } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { DataExportStatusLozenge } from './DataExportStatusLozenge';
import { DoneStatus, WaitingStatus } from './constant';
import { mapDataExportStatus, DataExportUIStatus } from './mapDataExportStatus';
import { useAutoRefreshDataExportItems } from './useAutoRefreshDataExportItems';
import { useDataExport } from './useDataExport';
import { useStatusDefinition } from './useStatusDefinition';

type TableRecord = Pick<DataExport, 'request_id' | 'created_at' | 'file'> & {
  status: DataExport['status'];
  isExpired: boolean;
  detail: {
    dataType: DataExport['data_type'];
    dateRange: string;
    format: string;
  };
  expiresAt: any;
};

type TableColumn = TableColumnProps<TableRecord>;

const RequestIDText = styled.a<{ status: string }>`
  font-size: 14px;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
  &:hover {
    color: ${cssVariables('neutral-10')};
    text-decoration: underline;
  }
  ${({ status }) => {
    if (DoneStatus.includes(status)) {
      return css`
        font-weight: 600;
        &:hover {
          font-weight: 600;
        }
      `;
    }
    if (WaitingStatus.includes(status)) {
      return css`
        color: ${cssVariables('neutral-6')};
      `;
    }
  }}
`;

const Detail = styled.div`
  display: grid;
  grid-template-columns: 77px auto;
  grid-row-gap: 4px;
`;

const DetailLabel = styled.label`
  font-size: 13px;
  line-height: 16px;
  font-weight: 600;
  color: ${cssVariables('neutral-6')};
`;

const DetailText = styled.div`
  font-size: 14px;
  line-height: 20px;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-10')};
`;

const StatusDefinitionList = styled.ul`
  margin: 0;
  margin-left: 20px;
  padding: 0;
  ${Body['body-short-01']};

  li + li {
    margin-top: 4px;
  }

  dfn {
    font-style: initial;
    font-weight: 600;
  }
`;

const useRenderTimestampColumn = () => {
  const formatTimeAgo = useFormatTimeAgo();

  const renderTimestamp = useCallback(
    (timestamp: number, useFromNow = false) => {
      const timeMoment = moment(timestamp);
      return useFromNow && Math.abs(timeMoment.diff(moment.now(), 'days')) < 7
        ? formatTimeAgo(timestamp)
        : timeMoment.format(DEFAULT_DATE_FORMAT);
    },
    [formatTimeAgo],
  );

  return useCallback(
    (dataIndex: 'created_at' | 'expiresAt') => (record: TableRecord) =>
      record[dataIndex] ? renderTimestamp(record[dataIndex], dataIndex === 'expiresAt') : EMPTY_TEXT,
    [renderTimestamp],
  );
};

const renderStatus = ({ file, status }: TableRecord) => <DataExportStatusLozenge status={status} file={file} />;

const downloadFile = (url: string) => () => {
  window.open(url);
};

const convertDataExportToTableRecord: (dataExport: DataExport) => TableRecord = (dataExport) => {
  const { request_id, data_type, file, format, created_at, status, start_ts, end_ts, timezone } = dataExport;
  const currentTimestamp = moment().unix() * 1000;
  return {
    request_id,
    created_at,
    status,
    detail: {
      dataType: data_type,
      dateRange: `${moment.tz(start_ts, timezone).format(DEFAULT_DATE_FORMAT)} - ${moment
        .tz(end_ts, timezone)
        .format(DEFAULT_DATE_FORMAT)}`,
      format,
    },
    file,
    isExpired: file ? file.expires_at < currentTimestamp : false,
    expiresAt: file?.expires_at,
  };
};

const dataTypes: DataExport['data_type'][] = ['messages', 'channels', 'users'];

export const DataExportList: FC = () => {
  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  // const dispatch = useDispatch();
  const match = useRouteMatch();
  const {
    isFetching,
    isFetchingLoadMore,
    items,
    token,
    dataType,
    actions: { loadMore, setDataType },
  } = useDataExport();
  const renderTimestampColumn = useRenderTimestampColumn();

  useAutoRefreshDataExportItems(items);

  const history = useHistory();

  const dataSource = useMemo(() => items.map(convertDataExportToTableRecord), [items]);

  const handleRequestClick = useCallback(() => {
    history.push(`${match?.url}/request`);
  }, [history, match]);

  const handleRequestIDClick = useCallback(
    (request_id) => () => {
      history.push(`${match?.url}/${request_id}`);
    },
    [history, match],
  );

  const renderRequestID = useCallback(
    ({ request_id, status }: TableRecord) => (
      <RequestIDText status={status} onClick={handleRequestIDClick(request_id)}>
        {request_id}
      </RequestIDText>
    ),
    [handleRequestIDClick],
  );

  const renderFile = useCallback(
    (record: TableRecord) => {
      const { file, status, isExpired } = record;
      if (mapDataExportStatus(status, file) === DataExportUIStatus.Failed) {
        return (
          <LinkWithPermissionCheck
            href="/settings/contact_us?category=technical_issue"
            useReactRouter={true}
            permissions={CONTACT_US_ALLOWED_PERMISSIONS}
            alertType="dialog"
          >
            {intl.formatMessage({ id: 'chat.dataExport.list.link.contactSupportTeam' })}
          </LinkWithPermissionCheck>
        );
      }
      if (status === 'no data') {
        return <>{intl.formatMessage({ id: 'chat.dataExport.list.column.file.noData' })}</>;
      }
      if (file?.url && !isExpired) {
        return (
          <Button buttonType="secondary" size="small" icon="download" onClick={downloadFile(file.url)}>
            {intl.formatMessage({ id: 'chat.dataExport.button.download' })}
          </Button>
        );
      }
      return '';
    },
    [intl],
  );

  const renderDetails = useCallback(
    ({ detail }: TableRecord) => {
      const { dataType, dateRange, format } = detail;
      return (
        <Detail>
          <DetailLabel>{intl.formatMessage({ id: 'chat.dataExport.list.column.details.type' })}</DetailLabel>
          <DetailText>{upperFirst(dataType)}</DetailText>
          <DetailLabel>{intl.formatMessage({ id: 'chat.dataExport.list.column.details.date' })}</DetailLabel>
          <DetailText>{dateRange}</DetailText>
          <DetailLabel>{intl.formatMessage({ id: 'chat.dataExport.list.column.details.format' })}</DetailLabel>
          <DetailText>{format.toUpperCase()}</DetailText>
        </Detail>
      );
    },
    [intl],
  );

  const statusDefinitions = useStatusDefinition();

  const columns: TableColumn[] = useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'chat.dataExport.list.column.requestID' }),
        dataIndex: 'request_id',
        render: renderRequestID,
        styles: 'min-width: 72px; max-width: 304px;',
      },
      {
        title: intl.formatMessage({ id: 'chat.dataExport.list.column.details' }),
        dataIndex: 'detail',
        render: renderDetails,
        styles: 'flex: 1;',
      },
      {
        title: intl.formatMessage({ id: 'chat.dataExport.list.column.createdAt' }),
        dataIndex: 'created_at',
        render: renderTimestampColumn('created_at'),
        width: 140,
      },
      {
        title: intl.formatMessage({ id: 'chat.dataExport.list.column.expiresAt' }),
        dataIndex: 'expiresAt',
        render: renderTimestampColumn('expiresAt'),
        width: 140,
      },
      {
        title: intl.formatMessage({ id: 'chat.dataExport.list.column.status' }),
        titleTooltip: {
          content: (
            <StatusDefinitionList>
              {Object.entries(statusDefinitions).map(([key, { term, longDefinition }]) => (
                <li key={key}>
                  <dfn>{term}</dfn>: {longDefinition}
                </li>
              ))}
            </StatusDefinitionList>
          ),
          tooltipWidth: 360,
          placement: 'bottom-end',
        },
        dataIndex: 'status',
        render: renderStatus,
        width: 140,
      },
      {
        title: '',
        dataIndex: 'file',
        render: renderFile,
        width: 140,
      },
    ],
    [intl, renderDetails, renderFile, renderRequestID, renderTimestampColumn, statusDefinitions],
  );

  /**
   * FIXME: will work after API Change on chat side
   */

  // const duplicateFilters = useCallback(
  //   record => () => {
  //     const target = items.find(item => item.request_id === record.request_id);
  //     if (target) {
  //       const payload: DataExportPayload = Object.keys(target)
  //         .filter(key => AvailableExportPayloadKeys.includes(key))
  //         .reduce((obj, key) => {
  //           return {
  //             ...obj,
  //             [key]: target[key],
  //           };
  //         }, {} as DataExportPayload);
  //       history.push(`${match?.url}/request`, { ...payload, historyType: 'duplicate' });
  //     }
  //   },
  //   [history, items, match],
  // );
  // const reRequest = useCallback(
  //   record => () => {
  //     const target = items.find(item => item.request_id === record.request_id);
  //     if (target) {
  //       dispatch(
  //         commonActions.showDialogsRequest({
  //           dialogTypes: DialogType.Confirm,
  //           dialogProps: {
  //             title: intl.formatMessage({ id: 'chat.dataExport.reRequstDialog.title'}),
  //             description: intl.formatMessage({ id: 'chat.dataExport.reRequstDialog.description'}),
  //             onConfirm: async () => {
  //               const payload: DataExportPayload = Object.keys(target)
  //                 .filter(key => AvailableExportPayloadKeys.includes(key))
  //                 .reduce((obj, key) => {
  //                   return {
  //                     ...obj,
  //                     [key]: target[key],
  //                   };
  //                 }, {} as DataExportPayload);
  //               await create(target.data_type, payload);
  //             },
  //           },
  //         }),
  //       );
  //     }
  //   },
  //   [create, dispatch, intl, items],
  // );

  const handleTabClick = (index) => {
    setDataType(dataTypes[index]);
  };

  return (
    <TablePageContainer
      css={css`
        ${PageHeader} + * {
          margin-top: 10px;

          & + * {
            margin-top: 24px;
          }
        }
      `}
    >
      <PageHeader>
        <PageHeader.Title>{intl.formatMessage({ id: 'chat.dataExport.title' })}</PageHeader.Title>
        <PageHeader.Actions>
          {isPermitted(['application.dataExport.all']) && (
            <Button
              buttonType="primary"
              size="small"
              onClick={handleRequestClick}
              icon="plus"
              data-test-id="de_button_request"
            >
              {intl.formatMessage({ id: 'chat.dataExport.list.button.requestData' })}
            </Button>
          )}
        </PageHeader.Actions>
      </PageHeader>

      <TabMenu
        tabs={[
          {
            label: intl.formatMessage({ id: 'chat.dataExport.dataType.messages' }),
            value: 'messages',
          },
          {
            label: intl.formatMessage({ id: 'chat.dataExport.dataType.channels' }),
            value: 'channels',
          },
          {
            label: intl.formatMessage({ id: 'chat.dataExport.dataType.users' }),
            value: 'users',
          },
        ]}
        activeTab={dataTypes.indexOf(dataType)}
        handleTabClick={handleTabClick}
      />

      <LoadMoreTable<TableRecord>
        columns={columns}
        dataSource={dataSource}
        showScrollbars={true}
        loading={isFetching}
        rowActions={(record) =>
          isPermitted(['application.dataExport.all']) && record.isExpired
            ? [
                //FIXME: will work after API Change on chat side
                // <OverflowMenu
                //   items={[
                //     { label: 'Duplicate filters', onClick: duplicateFilters(record) },
                //     { label: 'Re-request', onClick: reRequest(record) },
                //   })}
                //   stopClickEventPropagation={true}
                // />,
              ]
            : []
        }
        emptyView={
          <CenteredEmptyState
            icon="data-export"
            title={intl.formatMessage({ id: 'chat.dataExport.noResult.header' })}
            description={intl.formatMessage({ id: 'chat.dataExport.noResult.description' })}
          />
        }
        hasNext={!!token}
        loadMoreButtonProps={{ isLoading: isFetchingLoadMore, onClick: loadMore }}
      />
    </TablePageContainer>
  );
};
