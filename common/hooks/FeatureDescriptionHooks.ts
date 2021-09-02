import { useCallback, useMemo } from 'react';
import { useIntl, IntlShape } from 'react-intl';

import { useSupergroupFeature } from '@chat/hooks/useSupergroupFeature';
import { ChatFeatureName } from '@constants';

// FIXME: add key typing
const featureNameIntlKeys = {
  advanced_analytics: 'common.features.name.advanced_analytics',
  announcement: 'common.features.name.announcement',
  auto_thumbnail: 'common.features.name.auto_thumbnail',
  bot_interface: 'common.features.name.bot_interface',
  daily_active_user: 'common.features.name.daily_active_user',
  data_export: 'common.features.name.data_export',
  delivery_receipt: 'common.features.name.delivery_receipt',
  disappearing_messages: 'common.features.name.disappearing_messages',
  domain_filter: 'common.features.name.domain_filter',
  file_storage: 'common.features.name.file_storage',
  image_moderation: 'common.features.name.image_moderation',
  message_retrieval: 'common.features.name.message_retrieval',
  message_search: 'common.features.name.message_search',
  migration: 'common.features.name.migration',
  moderation_tools: 'common.features.name.moderation_tools',
  monthly_active_user: 'common.features.name.monthly_active_user',
  peak_connection: 'common.features.name.peak_connection',
  profanity_filter: 'common.features.name.profanity_filter',
  supergroup: 'common.features.name.supergroup',
  text_moderation: 'common.features.name.text_moderation',
  translation_tools: 'common.features.name.translation_tools',
  upload_traffic: 'common.features.name.upload_traffic',
  webhook: 'common.features.name.webhook',
};

// FIXME: add key typing
const featureDescriptionIntlKeys = {
  advanced_analytics: 'common.features.description.advanced_analytics',
  announcement: 'common.features.description.announcement',
  auto_thumbnail: 'common.features.description.auto_thumbnail',
  bot_interface: 'common.features.description.bot_interface',
  daily_active_user: 'common.features.description.daily_active_user',
  data_export: 'common.features.description.data_export',
  delivery_receipt: 'common.features.description.delivery_receipt',
  disappearing_messages: 'common.features.description.disappearing_messages',
  domain_filter: 'common.features.description.domain_filter',
  file_storage: 'common.features.description.file_storage',
  image_moderation: 'common.features.description.image_moderation',
  message_retrieval: 'common.features.description.message_retrieval',
  message_search: 'common.features.description.message_search',
  moderation_tools: 'common.features.description.moderation_tools',
  monthly_active_user: 'common.features.description.monthly_active_user',
  peak_connection: 'common.features.description.peak_connection',
  profanity_filter: 'common.features.description.profanity_filter',
  push_translation: 'common.features.description.push_translation',
  supergroup: 'common.features.description.supergroup',
  support_base: 'common.features.description.support_base',
  support_level1: 'common.features.description.support_level1',
  support_level2: 'common.features.description.support_level2',
  support_level3: 'common.features.description.support_level3',
  text_moderation: 'common.features.description.text_moderation',
  translation_tools: 'common.features.description.translation_tools',
  upload_traffic: 'common.features.description.upload_traffic',
  webhook: 'common.features.description.webhook',
};

export const useSupergroupFeatureName = () => {
  const intl = useIntl();
  const { supergroupMemberLimit, isSupergroupSupportedByPlan } = useSupergroupFeature();

  return useMemo(() => {
    if (isSupergroupSupportedByPlan) {
      const tier = supergroupMemberLimit ? `${(supergroupMemberLimit / 1000).toFixed(0)}K` : null;

      return tier
        ? intl.formatMessage({ id: 'common.features.name.supergroupWithTier' }, { tier })
        : intl.formatMessage({ id: featureNameIntlKeys.supergroup });
    }
    return intl.formatMessage({ id: featureNameIntlKeys.supergroup });
  }, [intl, isSupergroupSupportedByPlan, supergroupMemberLimit]);
};

export const useFeatureName = () => {
  const intl = useIntl();
  const supergroupFeatureName = useSupergroupFeatureName();

  const getFeatureName = useCallback(
    ({
      featureKey,
      billingPlanItem,
    }: {
      featureKey: ChatFeature['key'];
      /**
       * pass optional BillingPlanItem to use its display_name property value as a fallback string.
       */
      billingPlanItem?: BillingPlanItem;
    }) => {
      if (featureKey === ChatFeatureName.Supergroup) {
        return supergroupFeatureName;
      }
      return (
        (featureNameIntlKeys[featureKey]
          ? intl.formatMessage({ id: featureNameIntlKeys[featureKey] })
          : billingPlanItem?.display_name) || featureKey
      );
    },
    [intl, supergroupFeatureName],
  );

  return getFeatureName;
};

export const useFeatureDescription = () => {
  const intl = useIntl();
  const getFeatureDescription = useCallback(
    (featureKey: ChatFeature['key']) =>
      featureDescriptionIntlKeys[featureKey] ? intl.formatMessage({ id: featureNameIntlKeys[featureKey] }) : undefined,
    [intl],
  );

  return getFeatureDescription;
};

export const getMultipleUsageDetailName = ({
  intl,
  usageField,
}: {
  intl: IntlShape;
  usageField: FeatureUsageField;
}) => {
  switch (usageField) {
    case 'message_search_index':
      return intl.formatMessage({ id: 'common.features.usage.message_search.message_search_index.title' });

    case 'message_search_query':
      return intl.formatMessage({ id: 'common.features.usage.message_search.message_search_query.title' });

    default:
      return null;
  }
};

/**
 * When there is only one usage detail, the usage detail name is the same as its feature name.
 * When there are multiple usage detail, the usage detail name is different from its feature name.
 */
export const useFeatureUsageDetailName = () => {
  const intl = useIntl();
  const getFeatureName = useFeatureName();

  const getUsageDetailName = (props: { featureKey: ChatFeatureName; usageField: FeatureUsageField }) => {
    const { featureKey, usageField } = props;
    const multipleUsageDetailTitle = getMultipleUsageDetailName({ intl, usageField });
    const singleUsageDetailTitle = getFeatureName({ featureKey });

    return multipleUsageDetailTitle ?? singleUsageDetailTitle;
  };

  return getUsageDetailName;
};
