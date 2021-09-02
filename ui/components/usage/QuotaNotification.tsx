import { useMemo, useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { InlineNotification, cssVariables } from 'feather';
import numbro from 'numbro';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { USAGE_GB_UNIT } from '@constants';
import { useShowDialog } from '@hooks';
import { transformBytesToGigaByte } from '@utils';

import { ChevronLink } from '..';

const formatNumber = (value: any) => numbro(value).format({ thousandSeparated: true, mantissa: 0 });

type Props = {
  isFreeTrial: boolean;
  usage: number;
  quota: number;
  limit: number;
  /**
   * If unit='gigabyte', limit is converted into gigabytes and appended with GB unit to be displayed on UI.
   */
  unit?: 'gigabyte' | '';
  className?: string;
};

export const QuotaNotification = styled(({ isFreeTrial, usage, quota, limit, unit, className }: Props) => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const usagePercent = (usage / quota) * 100;
  const limitPercent = (usage / limit) * 100;

  const handleOverageLinkClick = useCallback(() => {
    showDialog({ dialogTypes: DialogType.Overage });
  }, [showDialog]);

  const formattedLimit =
    unit === 'gigabyte' ? `${formatNumber(transformBytesToGigaByte(limit))}${USAGE_GB_UNIT}` : formatNumber(limit);

  const renderLink = useCallback((text: string) => <ChevronLink onClick={handleOverageLinkClick}>{text}</ChevronLink>, [
    handleOverageLinkClick,
  ]);

  const getInlineNotificationStatus = () => {
    if (isFreeTrial) {
      if (usagePercent >= 100) {
        return 'error';
      }
    }
    if (limitPercent >= 100) {
      return 'error';
    }
    return 'warning';
  };

  const notificationMessage = useMemo(() => {
    if (isFreeTrial) {
      if (usagePercent >= 100) {
        return intl.formatMessage({ id: 'common.usage.alerts.free.quota100' });
      }
      if (usagePercent >= 80) {
        return intl.formatMessage({ id: 'common.usage.alerts.free.quota80' });
      }
    }
    if (limitPercent >= 100) {
      return intl.formatMessage(
        { id: 'common.usage.alerts.stopped' },
        {
          limit: formattedLimit,
        },
      );
    }
    if (limitPercent >= 80) {
      return intl.formatMessage(
        { id: 'common.usage.alerts.willStop' },
        {
          limit: formattedLimit,
          a: renderLink,
        },
      );
    }
    if (usagePercent >= 100) {
      return intl.formatMessage(
        { id: 'common.usage.alerts.over' },
        {
          limit: formattedLimit,
          a: renderLink,
        },
      );
    }
    if (usagePercent >= 80) {
      return intl.formatMessage(
        { id: 'common.usage.alerts.warning' },
        {
          a: renderLink,
        },
      );
    }
  }, [formattedLimit, intl, isFreeTrial, limitPercent, renderLink, usagePercent]);
  return notificationMessage ? (
    <InlineNotification
      className={`${className} usageDetailNotification`}
      type={getInlineNotificationStatus()}
      message={notificationMessage}
      data-test-id="QuotaNotification"
      css={css`
        a {
          text-decoration: underline;
          color: ${cssVariables('content-1')};

          svg {
            fill: ${cssVariables('content-1')};
          }

          &:hover {
            color: ${cssVariables('content-1')};

            svg {
              fill: ${cssVariables('content-1')};
            }
          }
        }
      `}
    />
  ) : null;
})``;
