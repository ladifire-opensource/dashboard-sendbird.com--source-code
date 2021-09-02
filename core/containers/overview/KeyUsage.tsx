import { FC, ComponentProps } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { SpinnerFull } from 'feather';

import { Usage } from '@ui/components';

const QuotaList = styled.div`
  flex: 1;

  .UsageLegends {
    margin-bottom: 30px;

    > div {
      height: auto;
    }
    .usageLegend__value {
      display: none;
    }
  }

  && > * + * {
    margin-top: 16px;
  }
`;

type Props = {
  usageProps: ComponentProps<typeof Usage>[];
  isFetching: boolean;
};

const quotaExceedIntlMap = {
  custom: {
    over: 'core.overview.quota.messaging_label.tooltip.over',
    warning: 'core.overview.quota.messaging_label.tooltip.warning',
    willStop: 'core.overview.quota.messaging_label.tooltip.willStop',
    stopped: 'core.overview.quota.messaging_label.tooltip.stopped',
  },
  free: {
    over: 'core.overview.quota.messaging_label.tooltip.over.free',
    warning: 'core.overview.quota.messaging_label.tooltip.warning.free',
    willStop: 'core.overview.quota.messaging_label.tooltip.willStop.free',
    stopped: 'core.overview.quota.messaging_label.tooltip.stopped.free',
  },
};

export const KeyUsage: FC<Props> = ({ usageProps, isFetching }) => {
  const intl = useIntl();
  const application = useSelector((state: RootState) => state.applicationState.data);
  const intlKeys = application?.plan === 'enterprise' ? quotaExceedIntlMap.custom : quotaExceedIntlMap.free;

  const labels = {
    usage: intl.formatMessage({ id: 'core.overview.quota.tooltipLabels_lbl.currentApplication' }),
    others: intl.formatMessage({ id: 'core.overview.quota.tooltipLabels_lbl.others' }),
    remains: intl.formatMessage({ id: 'core.overview.quota.tooltipLabels_lbl.balance' }),
  };

  return isFetching ? (
    <SpinnerFull />
  ) : (
    <QuotaList>
      {usageProps.map((props) => (
        <Usage
          key={`quotaItem_${props.label}`}
          availabilityTooltips={{
            over: intl.formatMessage({ id: intlKeys.over }),
            warning: intl.formatMessage({ id: intlKeys.warning }),
            stopped: intl.formatMessage({ id: intlKeys.stopped }),
          }}
          showTooltip={true}
          showAlert={true}
          showMarker={true}
          legendLabels={labels}
          tooltipLabels={labels}
          labelNumber="default"
          {...props}
        />
      ))}
    </QuotaList>
  );
};
