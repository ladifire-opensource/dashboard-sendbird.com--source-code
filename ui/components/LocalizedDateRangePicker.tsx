import { FC } from 'react';
import { useIntl } from 'react-intl';

import { DateRangePicker } from 'feather';
import moment from 'moment';

import { PropsOf } from '@utils';

type Props = PropsOf<typeof DateRangePicker>;

export const LocalizedDateRangePicker: FC<Props> = (props) => {
  const intl = useIntl();
  return (
    <DateRangePicker
      formatDate={(date) => moment(date.valueOf()).format('ll')}
      itemLabel={{
        today: intl.formatMessage({ id: 'ui.dateRangePicker.item.today' }),
        yesterday: intl.formatMessage({ id: 'ui.dateRangePicker.item.yesterday' }),
        last7Days: intl.formatMessage({ id: 'ui.dateRangePicker.item.last7days' }),
        last14Days: intl.formatMessage({ id: 'ui.dateRangePicker.item.last14days' }),
        last30Days: intl.formatMessage({ id: 'ui.dateRangePicker.item.last30days' }),
        last90Days: intl.formatMessage({ id: 'ui.dateRangePicker.item.last90days' }),
        allDates: intl.formatMessage({ id: 'ui.dateRangePicker.item.allDates' }),
        custom: intl.formatMessage({ id: 'ui.dateRangePicker.item.custom' }),
      }}
      cancelText={intl.formatMessage({ id: 'ui.dateRangePicker.actions.cancel' })}
      confirmText={intl.formatMessage({ id: 'ui.dateRangePicker.actions.confirm' })}
      {...props}
    />
  );
};
