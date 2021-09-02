import { useIntl } from 'react-intl';

import { StatisticsMetrics } from '@constants';

const getAnalyticsUnit = (intl, metricType) => {
  switch (metricType) {
    case StatisticsMetrics.active_channels:
    case StatisticsMetrics.created_channels:
      return intl.formatMessage({ id: 'chat.analytics.unit.channels' });
    case StatisticsMetrics.messages:
    case StatisticsMetrics.messages_per_user:
      return intl.formatMessage({ id: 'chat.analytics.unit.messages' });
    case StatisticsMetrics.created_users:
    case StatisticsMetrics.deactivated_users:
    case StatisticsMetrics.deleted_users:
    case StatisticsMetrics.message_senders:
    case StatisticsMetrics.message_viewers:
      return intl.formatMessage({ id: 'chat.analytics.unit.users' });
    case 'channel_member':
      return intl.formatMessage({ id: 'chat.analytics.unit.members' });
    default:
      return 'all';
  }
};

export const useAnalyticsIntl = () => {
  const intl = useIntl();
  return {
    // channel_member is a legacy will be deprecated
    getMetricMessages: (metricType) =>
      Object.keys(StatisticsMetrics).includes(metricType) || metricType === 'channel_member'
        ? {
            header: intl.formatMessage({ id: `chat.analytics.${metricType}.header`, defaultMessage: metricType }),
            description: intl.formatMessage({
              id: `chat.analytics.${metricType}.description`,
              defaultMessage: metricType,
            }),
            detail: intl.formatMessage({
              id: `chat.analytics.${metricType}.detail.description`,
              defaultMessage: metricType,
            }),
            unit: getAnalyticsUnit(intl, metricType),
          }
        : undefined,
  };
};
