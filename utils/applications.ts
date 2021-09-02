export const mergeApplications = (existingItems: ApplicationSummary[], newItems: ApplicationSummary[]) => {
  const newItemsMap = newItems.reduce<Record<string, ApplicationSummary>>((acc, cur) => {
    acc[cur.app_id] = cur;
    return acc;
  }, {});
  return existingItems
    .map((item) => {
      const correspondingNewItem = newItemsMap[item.app_id];
      if (correspondingNewItem) {
        delete newItemsMap[item.app_id];
        return correspondingNewItem;
      }
      return item;
    })
    .concat(Object.values(newItemsMap));
};

type ActivePremiumFeature =
  | 'auto_thumbnail'
  | 'auto_trans'
  | 'bot_interface'
  | 'data_export'
  | 'migration'
  | 'moderation'
  | 'spam_flood_protection'
  | 'announcement'
  | 'super_group_channel';

const activePremiumFeatures: readonly ActivePremiumFeature[] = Object.freeze([
  'auto_thumbnail',
  'auto_trans',
  'bot_interface',
  'data_export',
  'migration',
  'moderation',
  'spam_flood_protection',
  'announcement',
  'super_group_channel',
]);

type PremiumFeatures = {
  activeFeatures: readonly ActivePremiumFeature[];
  usage: {
    active: number;
    total: number;
  };
};

const defaultPremiumFeatures = Object.freeze({
  activeFeatures: activePremiumFeatures,
  usage: Object.freeze({ active: 0, total: 0 }),
});

export const premiumFeatureMap: Record<ActivePremiumFeature, string> = {
  spam_flood_protection: 'Spam flood protection',
  bot_interface: 'Bot interface',
  moderation: 'Moderation tools',
  data_export: 'Data export API and Dashboard',
  auto_thumbnail: 'Auto-generated thumbnails',
  migration: 'Migration API & support',
  auto_trans: 'Auto-translation',
  announcement: 'Announcement',
  super_group_channel: 'Supergroup',
};

type PremiumFeatureEntry = [string, any];

const mergeModerationFeatures = (acc: PremiumFeatureEntry[], cur: PremiumFeatureEntry) => {
  const [key, value] = cur;
  if (key === 'moderation_open' || key === 'moderation_group') {
    const moderationToolsEntry = acc.find(([key]) => key === 'moderation');
    if (moderationToolsEntry) {
      // value is boolean if key is moderation_open or moderation_group
      moderationToolsEntry[1] = moderationToolsEntry[1] || value;
    } else {
      acc.push(['moderation', value]);
    }
    return acc;
  }
  acc.push(cur);
  return acc;
};

const filterActivePremiumFeatures = ([key]: PremiumFeatureEntry) =>
  activePremiumFeatures.includes(key as ActivePremiumFeature);

export const getPremiumFeatures: (features: Application['current_premium_features'] | undefined) => PremiumFeatures = (
  features,
) => {
  if (features == null) {
    return defaultPremiumFeatures;
  }

  return Object.entries(features)
    .reduce(mergeModerationFeatures, [])
    .filter(filterActivePremiumFeatures)
    .reduce(
      (result: PremiumFeatures, [, value]) => {
        result.usage.total += 1;
        if (value) {
          result.usage.active += 1;
        }
        return result;
      },
      { activeFeatures: activePremiumFeatures, usage: { active: 0, total: 0 } },
    );
};
