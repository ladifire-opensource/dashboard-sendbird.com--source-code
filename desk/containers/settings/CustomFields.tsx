import { memo, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';

import styled from 'styled-components';

import { Table, TableProps, OverflowMenu } from 'feather';
import moment from 'moment-timezone';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { usePagination, useShowDialog } from '@hooks';
import { Paginator, Card } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

type Props = {
  fields: CustomFieldsState;
  fieldType: string;

  fetchFields: (payload: { offset: number; limit: number }) => void;
  deleteField: (payload: CustomField) => void;
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const TableCard = styled(Card)`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
  padding: 24px;
  padding-bottom: 0;
`;

const CustomFieldsTable = styled((props: TableProps<CustomField>) => Table<CustomField>(props))`
  height: 100%;
  border-right: 0;
  border-left: 0;
`;

const CustomFieldsPagination = styled(Paginator)`
  margin-left: auto;
`;

// FIXME: Create each field type of Component instead of use this
export const CustomFields = memo<Props>(({ fields, fieldType, fetchFields, deleteField }) => {
  const intl = useIntl();
  const history = useHistory();
  const matchURL = useRouteMatch()?.url;
  const showDialog = useShowDialog();

  const { page, pageSize, setPagination } = usePagination(1, 20);

  const handleEditClick = (id: number) => () => {
    history.push(`${matchURL}/${id}`);
  };

  const handleDeleteClick = (field: CustomField) => () => {
    showDialog({
      dialogTypes: DialogType.Delete,
      dialogProps: {
        title: intl.formatMessage({ id: 'desk.customFields.dialog.delete.title' }, { fieldName: field.name }),
        description:
          fieldType === 'ticket'
            ? intl.formatMessage({ id: 'desk.ticketsFields.dialog.delete.description' })
            : intl.formatMessage({ id: 'desk.customFields.dialog.delete.description' }),
        confirmText: intl.formatMessage({ id: 'desk.dialogs.button.delete' }),
        cancelText: intl.formatMessage({ id: 'desk.dialogs.button.cancel' }),
        onDelete: () => deleteField(field),
      },
    });
  };

  const handleItemsPerPageChange = (_, pageSize) => {
    setPagination(1, pageSize);
  };

  useEffect(() => {
    fetchFields({ offset: (page - 1) * pageSize, limit: pageSize });
  }, [fetchFields, page, pageSize]);

  const getFieldTypeShowingText = (fieldType: CustomFieldType) => {
    if (fieldType === 'STRING') {
      return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.text' });
    }
    if (fieldType === 'INTEGER') {
      return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.integer' });
    }
    if (fieldType === 'DROPDOWN') {
      return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.dropdown' });
    }
    if (fieldType === 'LINK') {
      return intl.formatMessage({ id: 'desk.customFields.detail.field.fieldType.item.link' });
    }
    return '';
  };

  return (
    <Container>
      <TableCard>
        <CustomFieldsTable
          className="custom-field-table"
          rowKey="id"
          dataSource={fields.items}
          columns={[
            {
              title: intl.formatMessage({ id: 'desk.customFields.list.column.label' }),
              dataIndex: 'name',
              sorter: true,
            },
            {
              title: intl.formatMessage({ id: 'desk.customFields.list.column.fieldKey' }),
              dataIndex: 'key',
              sorter: true,
            },
            {
              title: intl.formatMessage({ id: 'desk.customFields.list.column.type' }),
              dataIndex: 'fieldType',
              sorter: true,
              render: ({ fieldType }) => getFieldTypeShowingText(fieldType),
            },
            {
              title: intl.formatMessage({ id: 'desk.customFields.list.column.lastUpdated' }),
              dataIndex: 'updatedAt',
              sorter: true,
              render: ({ updatedAt }) => moment(updatedAt).format('lll'),
            },
          ]}
          rowActions={(record) => [
            <OverflowMenu
              key="customFieldsOverflow"
              items={[
                {
                  label: intl.formatMessage({ id: 'desk.customFields.customer.edit.button' }),
                  onClick: handleEditClick(record.id),
                },
                {
                  label: intl.formatMessage({ id: 'desk.customFields.customer.delete.button' }),
                  onClick: handleDeleteClick(record),
                },
              ]}
              stopClickEventPropagation={true}
            />,
          ]}
          onRow={(record) => ({
            onClick: () => {
              history.push(`${matchURL}/${record.id}`, { selectedRow: record });
            },
            style: { cursor: 'pointer' },
          })}
          showScrollbars={true}
          loading={fields.isFetching}
          footer={
            <CustomFieldsPagination
              current={page}
              total={fields.total}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 50, 100]}
              onChange={setPagination}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          }
          emptyView={
            <CenteredEmptyState
              icon="no-data"
              title={
                fieldType === 'ticket'
                  ? intl.formatMessage({ id: 'desk.settings.ticketFields.list.noResult.header' })
                  : intl.formatMessage({ id: 'desk.settings.customerFields.list.noResult.header' })
              }
              description={
                fieldType === 'ticket'
                  ? intl.formatMessage({ id: 'desk.settings.ticketFields.list.noResult.desc' })
                  : intl.formatMessage({ id: 'desk.settings.customerFields.list.noResult.desc' })
              }
            />
          }
        />
      </TableCard>
    </Container>
  );
});
