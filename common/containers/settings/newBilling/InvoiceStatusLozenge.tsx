import { FC } from 'react';
import { useIntl, IntlShape } from 'react-intl';

import { Lozenge, LozengeVariant } from 'feather';

import { logException, PropOf } from '@utils';

export const getStatusColor = (status: Invoice['status']): PropOf<typeof Lozenge, 'color'> => {
  switch (status) {
    case 'OUTSTANDING':
    case 'PENDING':
    case 'SCHEDULER_PENDING':
      return 'blue';

    case 'OVERDUE':
    case 'FAILED':
    case 'VOID':
    case 'UNCOLLECTABLE':
      return 'red';

    case 'PAID':
      return 'green';

    case 'REFUNDED':
      return 'neutral';

    default:
      logException({ error: `Unexpected invoice status: ${status}` });
      return 'neutral';
  }
};

const getStatusLabel = (status: Invoice['status'], intl: IntlShape): string => {
  switch (status) {
    case 'OUTSTANDING':
    case 'PENDING':
    case 'SCHEDULER_PENDING':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.due' });
    case 'FAILED':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.declined' });
    case 'OVERDUE':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.overdue' });
    case 'PAID':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.paid' });
    case 'REFUNDED':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.refunded' });
    case 'UNCOLLECTABLE':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.unpaid' });
    case 'VOID':
      return intl.formatMessage({ id: 'common.settings.billing.invoices.status.void' });
    default:
      return status;
  }
};

export const InvoiceStatusLozenge: FC<{ status: Invoice['status'] }> = ({ status }) => {
  const intl = useIntl();
  const color = getStatusColor(status);

  return (
    <Lozenge variant={LozengeVariant.Light} color={color}>
      {getStatusLabel(status, intl)}
    </Lozenge>
  );
};
