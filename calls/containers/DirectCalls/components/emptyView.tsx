import { FC } from 'react';
import { useIntl } from 'react-intl';

import CenteredEmptyState from '@ui/components/CenteredEmptyState';

type Props = { isTableFiltered: boolean; query?: string };

export const EmptyView: FC<Props> = ({ isTableFiltered, query }) => {
  const intl = useIntl();
  if (isTableFiltered && query) {
    return (
      <CenteredEmptyState
        icon="no-search"
        title={intl.formatMessage({ id: 'calls.callLogs.table.emptyView.searching_label.header' })}
        description={intl.formatMessage(
          { id: 'calls.callLogs.table.emptyView.searching_label.description' },
          { query },
        )}
      />
    );
  }
  return (
    <CenteredEmptyState
      icon="call-logs"
      title={intl.formatMessage({ id: 'calls.callLogs.table.emptyView_label.header' })}
      description={intl.formatMessage({ id: 'calls.callLogs.table.emptyView_label.description' })}
    />
  );
};
