import { useMemo, FC, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Table, TableColumnProps, EmptyState, EmptyStateSize } from 'feather';
import snakeCase from 'lodash/snakeCase';
import moment from 'moment-timezone';

import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import { Paginator } from '@ui/components';

import { CreateTagForm } from './CreateTagForm';
import { RealtimeCreatedAt } from './RealtimeCreatedAt';
import { RecentlyCreatedAt } from './RecentlyCreatedAt';
import { TicketTagNameCell } from './TicketTagNameCell';
import { useCreateTag } from './useCreateTag';
import { UpdateQueryParams } from './useQueryParams';
import { useTicketTagsState, TabState } from './useTicketTagsReducer';

const EmptyWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 90px;
  padding-bottom: 90px;
`;

type Props = Pick<TabState, 'data' | 'status' | 'page' | 'pageSize' | 'order'> & {
  query: string;
  updateParams: UpdateQueryParams;
  isAddMode: boolean;
  onAddModeExit: () => void;
  emptyView: ReactNode;
};

const ADD_ROW_RECORD: Partial<TicketTag> = { ticketCount: 0 };

export const TicketTagTable: FC<Props> = ({
  data,
  status,
  page,
  pageSize,
  order,
  query,
  updateParams,
  isAddMode,
  emptyView: emptyViewProp,
  onAddModeExit,
}) => {
  const intl = useIntl();

  const currentAgent = useSelector((state: RootState) => state.desk.agent);
  const sendCreateTagRequest = useCreateTag();
  const {
    tabs,
    createTagRequest: { status: createTagRequestStatus, newTag, error: createTagError },
  } = useTicketTagsState();

  const isBothTabsEmpty = tabs.every((tab) => tab.data.count === 0);

  const tableColumns = useMemo(() => {
    return [
      {
        dataIndex: 'name',
        title: intl.formatMessage({ id: 'desk.settings.tags.columns.name' }),
        sorter: true,
        defaultSortOrder: { name: 'ascend', '-name': 'descend' }[order],
        render: (record) =>
          record === ADD_ROW_RECORD ? (
            <CreateTagForm
              onCancelButtonClick={onAddModeExit}
              onSubmit={sendCreateTagRequest}
              isSubmitting={createTagRequestStatus === 'pending'}
              serverError={createTagError}
            />
          ) : (
            <TicketTagNameCell tag={record} />
          ),
      },
      {
        dataIndex: 'ticketCount',
        title: intl.formatMessage({ id: 'desk.settings.tags.columns.tickets' }),
        width: 116,
        sorter: true,
        defaultSortOrder: { ticket_count: 'ascend', '-ticket_count': 'descend' }[order],
      },
      {
        dataIndex: 'createdBy',
        title: intl.formatMessage({ id: 'desk.settings.tags.columns.createdBy' }),
        render: (record) => {
          const createdBy = record === ADD_ROW_RECORD ? currentAgent : record.createdBy;
          return (
            <>
              <DeskAgentAvatar
                profileID={createdBy.email}
                imageUrl={createdBy.photoThumbnailUrl}
                size={20}
                css={`
                  margin-right: 8px;
                `}
              />
              {createdBy.displayName}
            </>
          );
        },
        width: 171,
        sorter: true,
        defaultSortOrder: { created_by: 'ascend', '-created_by': 'descend' }[order],
      },
      {
        dataIndex: 'createdAt',
        title: intl.formatMessage({ id: 'desk.settings.tags.columns.createdOn' }),
        render: (record) => {
          if (record === ADD_ROW_RECORD) {
            // Current time is displayed on the Add form row.
            return <RealtimeCreatedAt />;
          }
          const content = moment(record.createdAt).format('lll');
          if (record.id === newTag?.id) {
            // Newly created tag should be highlighted for 1 minute.
            return <RecentlyCreatedAt timestamp={record.createdAt}>{content}</RecentlyCreatedAt>;
          }
          return content;
        },
        width: 163,
        sorter: true,
        defaultSortOrder: { created_at: 'ascend', '-created_at': 'descend' }[order],
      },
    ] as TableColumnProps<TicketTag>[];
  }, [createTagError, createTagRequestStatus, currentAgent, intl, newTag, onAddModeExit, order, sendCreateTagRequest]);

  const dataSource = useMemo(() => (isAddMode ? [ADD_ROW_RECORD as TicketTag, ...data.results] : data.results), [
    data.results,
    isAddMode,
  ]);

  const emptyView = useMemo(() => {
    if (status !== 'success' && status !== 'failed') {
      return undefined;
    }

    if (query) {
      return (
        <EmptyState
          size={EmptyStateSize.Large}
          icon="no-search"
          title={intl.formatMessage({ id: 'desk.settings.tags.search.emptyView.title' })}
          description={intl.formatMessage({ id: 'desk.settings.tags.search.emptyView.description' }, { query })}
          withoutMarginBottom={true}
        />
      );
    }

    if (isBothTabsEmpty) {
      return (
        <EmptyState
          size={EmptyStateSize.Large}
          icon="no-data"
          title={intl.formatMessage({ id: 'desk.settings.tags.emptyView.default.title' })}
          description={intl.formatMessage({ id: 'desk.settings.tags.emptyView.default.description' })}
          withoutMarginBottom={true}
        />
      );
    }

    return emptyViewProp;
  }, [emptyViewProp, intl, isBothTabsEmpty, query, status]);

  return (
    <Table<TicketTag>
      key={`TicketTagTable_${order}`} // to force re-render the table and reset the sort order states inside it when the order prop changes.
      columns={tableColumns}
      dataSource={dataSource}
      onSortByUpdated={(column, order) => {
        if (column == null) {
          return;
        }
        updateParams({
          order: `${order === 'descend' ? '-' : ''}${snakeCase(column?.dataIndex)}` as TicketTagSortOrder,
        });
      }}
      loading={status === 'fetching'}
      showScrollbars={true}
      emptyView={<EmptyWrapper>{emptyView}</EmptyWrapper>}
      footer={
        <Paginator
          current={page}
          pageSize={pageSize as PerPage}
          total={data.count}
          onChange={(page, pageSize) => {
            onAddModeExit();
            updateParams({ page, pageSize });
          }}
          onItemsPerPageChange={(page, pageSize) => updateParams({ page, pageSize })}
          css={`
            margin-left: auto;
          `}
        />
      }
    />
  );
};
