import { useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import styled from 'styled-components';

import { TableProps, Table, Link, TableColumnProps } from 'feather';
import upperFirst from 'lodash/upperFirst';
import moment from 'moment-timezone';
import numbro from 'numbro';

import { DEFAULT_DATE_FORMAT, LIST_LIMIT, EMPTY_TEXT, SubscriptionProduct } from '@constants';
import { usePagination } from '@hooks';
import { useInvoices } from '@hooks/useInvoices';
import { Paginator } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { InvoiceStatusLozenge } from './InvoiceStatusLozenge';

const InvoicesPaginator = styled(Paginator)`
  margin-left: auto;
`;

const InvoiceTable = styled((props: TableProps<Invoice>) => Table<Invoice>(props))`
  flex: 1;
  min-height: 96px;

  table {
    flex: 1;
  }

  input[type='checkbox'] {
    outline: 0;
  }
`;

export const Invoices = () => {
  const intl = useIntl();
  const history = useHistory();

  const { page, pageSize, setPagination } = usePagination(1, LIST_LIMIT);

  const { isLoading, data } = useInvoices({
    limit: pageSize,
    offset: pageSize * (page - 1),
  });

  const dataSource = data?.results || [];

  const handleUsageClick = (targetDate: string) => () => {
    history.push('/settings/usage', { targetDate });
  };

  const getInvoiceProduct = useCallback(
    ({ voucher, subscription }: Invoice) => {
      if (voucher) {
        return intl.formatMessage({ id: 'common.settings.billing.invoices.column.productType.calls' });
      }

      if (subscription?.product === SubscriptionProduct.Chat) {
        return intl.formatMessage({ id: 'common.settings.billing.invoices.column.productType.chat' });
      }

      if (subscription?.product === SubscriptionProduct.Support) {
        return intl.formatMessage({ id: 'common.settings.billing.invoices.column.productType.support' });
      }

      return EMPTY_TEXT;
    },
    [intl],
  );

  return (
    <InvoiceTable
      rowKey="uid"
      dataSource={dataSource}
      loading={isLoading}
      columns={
        [
          {
            dataIndex: 'created_at',
            sorter: (a: Invoice, b: Invoice, sortOrder: 'ascend' | 'descend') => {
              if (sortOrder === 'ascend') {
                return moment(a.created_at).diff(moment(b.created_at));
              }
              return moment(b.created_at).diff(moment(a.created_at));
            },
            defaultSortOrder: 'descend',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.createdAt' }),
            render: ({ created_at }: Invoice) => moment(created_at).format(DEFAULT_DATE_FORMAT),
            width: 120,
          },
          {
            dataIndex: 'productType',
            sorter: (a: Invoice, b: Invoice, sortOrder: 'ascend' | 'descend') => {
              const productA = getInvoiceProduct(a);
              const productB = getInvoiceProduct(b);
              return sortOrder === 'ascend' ? productA.localeCompare(productB) : productB.localeCompare(productA);
            },
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.productType' }),
            render: (invoice: Invoice) => getInvoiceProduct(invoice),
            width: 112,
          },
          {
            dataIndex: 'invoice_type',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.invoiceType' }),
            render: ({ invoice_type }: Invoice) => upperFirst(invoice_type.toLowerCase()),
            width: 104,
          },
          {
            dataIndex: 'start_date',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.servicePeriod' }),
            width: 224,
            render: (invoice: Invoice) => {
              return invoice.start_date && invoice.end_date
                ? `${moment(invoice.start_date).format(DEFAULT_DATE_FORMAT)} - ${moment(invoice.end_date).format(
                    DEFAULT_DATE_FORMAT,
                  )}`
                : EMPTY_TEXT;
            },
          },
          {
            dataIndex: 'status',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.status' }),
            width: 104,
            render: ({ status }: Invoice) => {
              return <InvoiceStatusLozenge status={status} />;
            },
          },
          {
            dataIndex: 'total_amount',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.totalAmount' }),
            width: 120,
            render: ({ total_amount }: Invoice) => numbro(total_amount / 100).format('$0,0.00'),
          },
          {
            dataIndex: 'stripe_invoice_pdf_url',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.downloadPDF' }),
            width: 120,
            render: ({ stripe_invoice_pdf_url }: Invoice) => (
              <Link href={stripe_invoice_pdf_url || '#'} target="_blank" iconProps={{ icon: 'download', size: 16 }}>
                {intl.formatMessage({ id: 'common.settings.billing.invoices.column.text.downloadPDF' })}
              </Link>
            ),
          },
          {
            dataIndex: '',
            title: intl.formatMessage({ id: 'common.settings.billing.invoices.column.usage' }),
            width: 120,
            render: ({ start_date }: Invoice) =>
              start_date ? (
                <Link onClick={handleUsageClick(start_date)} iconProps={{ icon: 'open-in-new', size: 16 }}>
                  {intl.formatMessage({ id: 'common.settings.billing.invoices.column.text.usage' })}
                </Link>
              ) : (
                EMPTY_TEXT
              ),
          },
        ].filter(Boolean) as TableColumnProps<Invoice>[]
      }
      footer={
        <InvoicesPaginator
          current={page}
          total={data?.count || 0}
          pageSize={pageSize}
          onChange={setPagination}
          onItemsPerPageChange={setPagination}
        />
      }
      emptyView={
        <CenteredEmptyState icon="no-data" title="No invoices" description="The list of invoices will show here." />
      }
      showScrollbars={true}
    />
  );
};
