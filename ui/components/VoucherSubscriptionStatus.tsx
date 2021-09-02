import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, Subtitles } from 'feather';

import { SubscriptionStatus } from '@common/containers/CallsVoucherContext';

import { UsageAlertIcon } from './usage';

const Container = styled.span.attrs({
  'data-test-id': 'VoucherSubscriptionStatus',
})<{ color?: string }>`
  ${Subtitles['subtitle-01']};
  display: flex;
  align-items: center;
  ${(props) => props.color && `color: ${props.color};`}

  > div {
    margin: 0 4px;
  }
`;

export const VoucherSubscriptionStatus: FC<{ status: SubscriptionStatus }> = ({ status }) => {
  const intl = useIntl();
  const components = {
    [SubscriptionStatus.PAYMENT_DECLINED]: (
      <Container color={cssVariables('red-5')}>
        {intl.formatMessage({ id: 'ui.voucherSubscriptionStatus.label.paymentDeclined' })}
        <UsageAlertIcon
          icon="error-filled"
          color="bg-negative"
          tooltip={intl.formatMessage({ id: 'ui.voucherSubscriptionStatus.tooltip.paymentDeclined' })}
        />
      </Container>
    ),
    [SubscriptionStatus.OFF]: (
      <Container>
        {intl.formatMessage({ id: 'ui.voucherSubscriptionStatus.label.off' })}
        <UsageAlertIcon
          icon="warning-filled"
          color="bg-negative"
          tooltip={intl.formatMessage({ id: 'ui.voucherSubscriptionStatus.tooltip.off' })}
        />
      </Container>
    ),
    [SubscriptionStatus.ON]: (
      <Container>
        {intl.formatMessage({ id: 'ui.voucherSubscriptionStatus.label.on' })}
        <UsageAlertIcon icon="success-filled" color="bg-positive" />
      </Container>
    ),
  };

  return components[status];
};
