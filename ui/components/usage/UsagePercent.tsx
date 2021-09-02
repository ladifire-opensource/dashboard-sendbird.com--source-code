import { FC } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, CSSVariableKey } from 'feather';

import { getTransformedUsage } from '@utils';

import { UsageAlertIcon } from './UsageAlertIcon';
import { Availability, AvailabilityTooltips, UsageVariant } from './types';
import { getAvailabilityColor, getCalculatedUsageData, useAvailabilityTooltipMessages } from './utils';

const PercentText = styled.div`
  font-size: 14px;
  line-height: 20px;
`;

const PercentWrapper = styled.div<{ color: CSSVariableKey; variant: UsageVariant }>`
  display: flex;

  ${PercentText} {
    color: ${({ color }) => cssVariables(color)};
    transform: translateY(-3px);

    ${({ color, variant }) => {
      if (variant === 'mini') {
        return css`
          font-weight: ${['data-viz-1', 'content-1'].includes(color) ? 400 : 600};
          height: 24px;
          display: flex;
          align-items: center;
        `;
      }
      return css`
        color: ${cssVariables('neutral-10')};
      `;
    }}
  }
`;

const AlertIcon = styled(UsageAlertIcon)`
  transform: translateY(-3px);
`;

type Props = {
  usage: number;
  others?: number;
  quota: number;
  limit?: number;
  availabilityTooltips?: AvailabilityTooltips;
  type?: 'all' | 'current';
  variant?: UsageVariant;
  showAlert?: boolean;
};

export const UsagePercent: FC<Props> = ({
  usage,
  others,
  quota,
  limit,
  availabilityTooltips: definedAvailabilityTooltips,
  type = 'all',
  variant = 'mini',
  showAlert = true,
}) => {
  const intl = useIntl();
  const { totalPercent, usagePercent, availability } = getCalculatedUsageData({
    usage,
    others,
    quota,
    limit,
  });
  const availabilityTooltips = useAvailabilityTooltipMessages(definedAvailabilityTooltips);
  const { content: contentColor, background } = getAvailabilityColor(availability);
  const percentNumber = type === 'all' ? totalPercent : usagePercent;
  const percent = getTransformedUsage(percentNumber);

  return (
    <PercentWrapper color={contentColor} variant={variant}>
      <PercentText data-test-id="UsagePercent">
        {percentNumber > 999 ? intl.formatMessage({ id: 'ui.usage.percent.exceed' }) : <>{percent}%</>}
      </PercentText>
      {showAlert && availability !== Availability.available && type === 'all' && (
        <AlertIcon color={background} tooltip={availabilityTooltips[availability]} placement="bottom-end" />
      )}
    </PercentWrapper>
  );
};
