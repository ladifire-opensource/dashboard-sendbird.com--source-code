import { useIntl } from 'react-intl';

import { CSSVariableKey } from 'feather';

import { Availability, AvailabilityColor, AvailabilityTooltips, UsageNumbers } from './types';

export const getAvailabilityColor = (
  availability: Availability,
): {
  main: AvailabilityColor;
  content: CSSVariableKey;
  background: CSSVariableKey;
  secondaryBackground: CSSVariableKey;
} => {
  switch (availability) {
    case Availability.stopped:
      return { main: 'red', content: 'content-negative', background: 'content-negative', secondaryBackground: 'red-3' };
    case Availability.over:
    case Availability.willStop:
      return { main: 'orange', content: 'orange-6', background: 'bg-attention', secondaryBackground: 'orange-3' };
    case Availability.warning:
      return { main: 'yellow', content: 'content-warning', background: 'bg-warning', secondaryBackground: 'yellow-3' };
    default:
      return { main: 'purple', content: 'content-1', background: 'data-viz-1', secondaryBackground: 'purple-4' };
  }
};

const getPercent = (value: number, quota: number) => {
  return value === 0 ? 0 : (value / quota) * 100;
};

export const getAvailability = (totalUsage: number, quota: number, limit: number) => {
  const percent = getPercent(totalUsage, quota);
  const limitPercent = getPercent(totalUsage, limit);

  /**
   * limit = 0 means two cases
   * 1) organization is v1
   * 2) subscription and plan has invalid plan limit value
   * in these cases we should not show a red flag for it.
   */
  if (limit === 0) {
    return Availability.available;
  }
  if (totalUsage >= limit) {
    return Availability.stopped;
  }
  if (limitPercent >= 80) {
    return Availability.willStop;
  }
  if (percent > 100) {
    return Availability.over;
  }
  if (percent >= 80) {
    return Availability.warning;
  }
  return Availability.available;
};

const usageUnitIntlKeys: Record<FeatureUsageField, string | null> = {
  announcement_sent_user_count: 'common.settings.usage.usageDetail.used.unit.announcement_sent_user_count',
  auto_thumbnail: 'common.settings.usage.usageDetail.used.unit.auto_thumbnail',
  auto_translation: 'common.settings.usage.usageDetail.used.unit.auto_translation',
  avg_file_storage: 'common.settings.usage.usageDetail.used.unit.avg_file_storage',
  bot_interface: 'common.settings.usage.usageDetail.used.unit.bot_interface',
  image_moderation: 'common.settings.usage.usageDetail.used.unit.image_moderation',
  mau: 'common.settings.usage.usageDetail.used.unit.mau',
  message_search_index: 'common.settings.usage.usageDetail.used.unit.message_search_index',
  message_search_query: 'common.settings.usage.usageDetail.used.unit.message_search_query',
  pc: 'common.settings.usage.usageDetail.used.unit.pc',
  upload_traffic: 'common.settings.usage.usageDetail.used.unit.upload_traffic',
  webhook: null,
  domain_filter: null,
  profanity_filter: null,
  data_export: null,
  delivery_receipt: null,
  supergroup: null,
  advanced_analytics: null,
  moderation_tools: null,
};

export const getUsageUnitAndSuffixIntlData = ({ usageField }: { usageField?: FeatureUsageField }) => {
  const unit = usageField ? usageUnitIntlKeys[usageField] : null;

  switch (usageField) {
    case 'mau':
    case 'auto_thumbnail':
    case 'auto_translation':
    case 'image_moderation':
    case 'announcement_sent_user_count':
    case 'message_search_index':
    case 'message_search_query':
    case 'pc':
    case 'bot_interface':
    case 'avg_file_storage':
    case 'upload_traffic':
      return {
        unit,
        suffix: 'common.settings.usage.usageDetail.used.suffix.common',
      };

    default:
      return { unit: null, suffix: null };
  }
};

export const getCalculatedUsageData = (payload: UsageNumbers) => {
  const { usage, quota, others = 0, limit = 0 } = payload;
  const totalUsage = others ? usage + others : usage;
  const remains = quota - totalUsage < 0 ? 0 : quota - totalUsage;
  const availability = getAvailability(totalUsage, quota, limit);
  const totalPercent = getPercent(totalUsage, quota);

  return {
    totalUsage,
    remains,
    usagePercent: getPercent(usage, quota),
    othersPercent: getPercent(others, quota),
    remainsPercent: getPercent(remains, quota),
    totalPercent,
    availability,
  };
};

export const useAvailabilityTooltipMessages = (definedMessages?: AvailabilityTooltips): AvailabilityTooltips => {
  const intl = useIntl();
  return {
    warning: intl.formatMessage({ id: 'ui.usage.availabilityTooltip.warning' }),
    over: intl.formatMessage({ id: 'ui.usage.availabilityTooltip.over' }),
    willStop: intl.formatMessage({ id: 'ui.usage.availabilityTooltip.willStop' }),
    stopped: intl.formatMessage({ id: 'ui.usage.availabilityTooltip.stopped' }),
    ...definedMessages,
  };
};
