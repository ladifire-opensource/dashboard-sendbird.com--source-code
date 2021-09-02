import { FC } from 'react';
import { useIntl } from 'react-intl';

import CenteredEmptyState from '@ui/components/CenteredEmptyState';

export const LimitedAccess: FC = () => {
  const intl = useIntl();
  return (
    <CenteredEmptyState
      icon="permission"
      title={intl.formatMessage({ id: 'common.limitedAccess.title' })}
      description={intl.formatMessage({ id: 'common.limitedAccess.description' })}
    />
  );
};
