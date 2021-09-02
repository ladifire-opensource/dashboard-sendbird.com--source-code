import { useIntl } from 'react-intl';

import { ChevronLink } from '@ui/components';
import { InformationCard, contentStyle } from '@ui/components/InformationCard';

export const CallsCredits = () => {
  const intl = useIntl();

  return (
    <InformationCard css={contentStyle}>
      <h4>{intl.formatMessage({ id: 'common.settings.billing.callsCredits.title' })}</h4>
      <p>{intl.formatMessage({ id: 'common.settings.billing.callsCredits.description' })}</p>
      <ChevronLink href="/settings/general">
        {intl.formatMessage({ id: 'common.settings.billing.callsCredits.link' })}
      </ChevronLink>
    </InformationCard>
  );
};
