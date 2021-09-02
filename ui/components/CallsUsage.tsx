import { FC, ComponentProps } from 'react';
import { useIntl } from 'react-intl';

import { RatesTooltip } from '@calls/components/RatesTooltip';

import { Usage } from './usage';
import { Availability } from './usage/types';
import { getAvailabilityColor } from './usage/utils';

type Props = Pick<
  ComponentProps<typeof Usage>,
  'usage' | 'quota' | 'variant' | 'showLegends' | 'legendLabels' | 'showAlert'
> & { tooltipPlacement?: ComponentProps<typeof RatesTooltip>['placement'] };

export const CallsUsage: FC<Props> = ({ quota, tooltipPlacement, ...props }) => {
  const intl = useIntl();
  return (
    <Usage
      quota={quota}
      limit={quota}
      label={
        <>
          {intl.formatMessage({ id: 'ui.callsUsage.label' })}
          <RatesTooltip placement={tooltipPlacement} />
        </>
      }
      labelNumber="default"
      availabilityTooltips={{
        warning: intl.formatMessage({ id: 'ui.callsUsage.warning' }),
        stopped: intl.formatMessage({ id: 'ui.callsUsage.stopped' }),
      }}
      color={props.showAlert ? undefined : getAvailabilityColor(Availability.available)}
      tooltipMantissa={3}
      showMarker={true}
      {...props}
    />
  );
};
