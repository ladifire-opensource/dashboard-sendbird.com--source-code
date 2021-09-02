import { FC } from 'react';
import { useIntl } from 'react-intl';

import { InfoTooltip } from '@ui/components';

export const DataFieldLabelTooltipIcon: FC = () => {
  const intl = useIntl();
  return <InfoTooltip content={intl.formatMessage({ id: 'chat.channels.dataFieldTooltip' })} />;
};
