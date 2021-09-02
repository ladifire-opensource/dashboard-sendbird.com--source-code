export enum SupportLevels {
  SupportBase = 'support_base',
  SupportLevel1 = 'support_level1',
  SupportLevel2 = 'support_level2',
  SupportLevel3 = 'support_level3',
  // hidden level 4
  SupportLevel4 = 'support_level4',
}

export enum FeatureType {
  Core = 'Core',
  Premium = 'Premium',
  Support = 'Support',
  EAP = 'EAP',
}

export enum FeatureTypeLozengeColors {
  Core = 'neutral',
  Premium = 'purple',
  Support = 'orange',
  EAP = 'green',
}

export enum ChatFeatureName {
  MonthlyActiveUser = 'monthly_active_user',
  PeakConnection = 'peak_connection',
  FileStorage = 'file_storage',
  UploadTraffic = 'upload_traffic',
  BotInterface = 'bot_interface',
  Webhook = 'webhook',
  AutoThumbnail = 'auto_thumbnail',
  TranslationTools = 'translation_tools',
  ImageModeration = 'image_moderation',
  DomainFilter = 'domain_filter',
  ProfanityFilter = 'profanity_filter',
  DataExport = 'data_export',
  ModerationTools = 'moderation_tools',
  DeliveryReceipt = 'delivery_receipt',
  Announcement = 'announcement',
  Supergroup = 'supergroup',
  AdvancedAnalytics = 'advanced_analytics',
  MessageSearch = 'message_search',
  DisappearingMessages = 'disappearing_messages',
  TextModeration = 'text_moderation',
}

// TODO: check items to reduce useless key map
export const LegacyPremiumFeatureMap = {
  bot_interface: ChatFeatureName.BotInterface,
  auto_thumbnail: ChatFeatureName.AutoThumbnail,
  moderation_group: ChatFeatureName.ModerationTools,
  data_export: ChatFeatureName.DataExport,
  moderation_open: ChatFeatureName.ModerationTools,
  auto_trans: ChatFeatureName.TranslationTools,
  image_moderation: ChatFeatureName.ImageModeration,
  delivery_receipt: ChatFeatureName.DeliveryReceipt,
  announcement: ChatFeatureName.Announcement,
  analytics: ChatFeatureName.AdvancedAnalytics,
  text_moderation: ChatFeatureName.TextModeration,
  auto_partitioning: 'auto_partitioning',
  spam_flood_protection: 'spam_flood_protection',
  desk: 'desk',

  message_search: 'message_search', // TODO: legacy search page @deprecated
  /**
   * below is hidden, preserve for the historical tracking
   */
  // migration: ChatFeatureName.Premium.Migration,
} as const;

/**
 * TODO: Replace below featureKey array with FeatureUsageType to identify what chart do we show or what text do we have to show
 */
export const OnlyUsageBarFeatures: ChatFeatureName[] = [
  ChatFeatureName.BotInterface,
  ChatFeatureName.FileStorage,
  ChatFeatureName.MessageSearch,
];
export const AverageFeatures: string[] = [ChatFeatureName.BotInterface];
export const MultipleUsageFeatures: string[] = ['message_search_query', 'message_search_index'];
export const LineChartOnlyFeatures: string[] = [ChatFeatureName.MonthlyActiveUser];
export const GigabyteUsageFeatures: string[] = [
  'avg_file_storage',
  ChatFeatureName.FileStorage,
  ChatFeatureName.UploadTraffic,
];

export enum FeatureUsageType {
  Monthly = 'monthly', // usage bar only
  Daily = 'daily',
  DailyLineOnly = 'daily_line_only',
  Average = 'average',
}

export const ChatFeatureList: ChatFeature[] = [
  {
    key: ChatFeatureName.MonthlyActiveUser,
    plans: [
      {
        planKey: 'mau',
        usageField: 'mau',
      },
    ],
    type: FeatureType.Core,
    trackable: true,
  },
  {
    key: ChatFeatureName.PeakConnection,
    plans: [
      {
        planKey: 'pc',
        usageField: 'pc',
      },
    ],
    type: FeatureType.Core,
    trackable: true,
  },
  {
    key: ChatFeatureName.FileStorage,
    plans: [
      {
        planKey: 'file_storage',
        usageField: 'avg_file_storage',
      },
    ],
    type: FeatureType.Core,
    trackable: true,
  },
  {
    key: ChatFeatureName.UploadTraffic,
    plans: [
      {
        planKey: 'upload_traffic',
        usageField: 'upload_traffic',
      },
    ],
    type: FeatureType.Core,
    trackable: true,
  },
  {
    key: ChatFeatureName.BotInterface,
    plans: [
      {
        planKey: 'bot_interface',
        usageField: 'bot_interface',
      },
    ],
    type: FeatureType.Core,
    trackable: true,
  },
  {
    key: ChatFeatureName.Webhook,
    plans: [
      {
        planKey: 'webhook',
        usageField: 'webhook',
      },
    ],
    type: FeatureType.Core,
    trackable: false,
  },
  {
    key: ChatFeatureName.AutoThumbnail,
    plans: [
      {
        planKey: 'auto_thumbnail',
        usageField: 'auto_thumbnail',
      },
    ],
    type: FeatureType.Premium,
    trackable: true,
  },
  {
    key: ChatFeatureName.TranslationTools,
    plans: [
      {
        planKey: 'translation_tools',
        usageField: 'auto_translation',
      },
    ],
    type: FeatureType.Premium,
    trackable: true,
  },
  {
    key: ChatFeatureName.ImageModeration,
    plans: [
      {
        planKey: 'image_moderation',
        usageField: 'image_moderation',
      },
    ],
    type: FeatureType.Premium,
    trackable: true,
  },
  {
    key: ChatFeatureName.DomainFilter,
    plans: [
      {
        planKey: 'domain_filter',
        usageField: 'domain_filter',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.ProfanityFilter,
    plans: [
      {
        planKey: 'profanity_filter',
        usageField: 'profanity_filter',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.DataExport,
    plans: [
      {
        planKey: 'data_export',
        usageField: 'data_export',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.ModerationTools,
    plans: [
      {
        planKey: 'moderation_tools',
        usageField: 'moderation_tools',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.DeliveryReceipt,
    plans: [
      {
        planKey: 'delivery_receipt',
        usageField: 'delivery_receipt',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.Announcement,
    plans: [
      {
        planKey: 'announcement',
        usageField: 'announcement_sent_user_count',
      },
    ],
    type: FeatureType.Premium,
    trackable: true,
  },
  {
    key: ChatFeatureName.Supergroup,
    plans: [
      {
        planKey: 'supergroup',
        usageField: 'supergroup',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.AdvancedAnalytics,
    plans: [
      {
        planKey: 'advanced_analytics',
        usageField: 'advanced_analytics',
      },
    ],
    type: FeatureType.Premium,
    trackable: false,
  },
  {
    key: ChatFeatureName.MessageSearch,
    plans: [
      {
        planKey: 'message_search_index',
        usageField: 'message_search_index',
      },
      {
        planKey: 'message_search_query',
        usageField: 'message_search_query',
      },
    ],
    type: FeatureType.Premium,
    trackable: true,
  },
];

export const FeatureDocuments = {
  // core
  [ChatFeatureName.MonthlyActiveUser]: {
    doc: 'https://help.sendbird.com/s/article/How-is-MAU-calculated-How-are-Peak-Connections-calculated',
    platformAPI:
      'https://sendbird.com/docs/chat/v3/platform-api/guides/application#2-view-number-of-monthly-active-users',
  },
  [ChatFeatureName.PeakConnection]: {
    doc: 'https://help.sendbird.com/s/article/How-is-MAU-calculated-How-are-Peak-Connections-calculated',
    platformAPI:
      'https://sendbird.com/docs/chat/v3/platform-api/guides/application#2-view-number-of-concurrent-connections',
  },
  [ChatFeatureName.FileStorage]: {
    doc: 'https://help.sendbird.com/s/article/What-s-the-maximum-file-size-I-can-send-from-clients',
  },
  [ChatFeatureName.UploadTraffic]: {
    doc: 'https://help.sendbird.com/s/article/What-s-the-maximum-file-size-I-can-send-from-clients',
  },
  [ChatFeatureName.BotInterface]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/bot-interface#2-bot-interface',
  },
  [ChatFeatureName.Webhook]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/webhooks#3-webhook-events',
  },
  // premium
  [ChatFeatureName.AutoThumbnail]: {
    ios: 'https://sendbird.com/docs/chat/v3/ios/guides/group-channel-advanced#3-generate-thumbnails-of-a-file-message',
    android:
      'https://sendbird.com/docs/chat/v3/android/guides/group-channel-advanced#2-generate-thumbnails-of-a-file-message',
    javascript:
      'https://sendbird.com/docs/chat/v3/javascript/guides/group-channel-advanced#2-generate-thumbnails-of-a-file-message',
  },
  [ChatFeatureName.ImageModeration]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/filter-and-moderation#3-image-moderation',
  },
  [ChatFeatureName.TranslationTools]: {
    ios: 'https://sendbird.com/docs/chat/v3/ios/guides/group-channel-advanced#3-message-auto-translation',
    android: 'https://sendbird.com/docs/chat/v3/android/guides/group-channel-advanced#3-message-auto-translation',
    javascript: 'https://sendbird.com/docs/chat/v3/javascript/guides/group-channel-advanced#3-message-auto-translation',
    platformAPI:
      'https://sendbird.com/docs/chat/v3/platform-api/guides/messages#2-translate-a-message-into-other-languages',
  },
  [ChatFeatureName.DomainFilter]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/filter-and-moderation#3-domain-filter',
  },
  [ChatFeatureName.ProfanityFilter]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/filter-and-moderation#3-profanity-filter',
  },
  [ChatFeatureName.DataExport]: {
    doc: 'https://help.sendbird.com/s/article/Can-I-export-my-application-s-chat-data',
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/data-export',
  },
  [ChatFeatureName.DeliveryReceipt]: {
    ios: 'https://sendbird.com/docs/chat/v3/ios/tutorials/delivery-receipt',
    android: 'https://sendbird.com/docs/chat/v3/android/tutorials/delivery-receipt',
    javascript: 'https://sendbird.com/docs/chat/v3/javascript/tutorials/delivery-receipt',
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/tutorials/delivery-receipt',
  },
  [ChatFeatureName.Announcement]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/announcements',
  },
  [ChatFeatureName.AdvancedAnalytics]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/advanced-analytics',
  },
  [ChatFeatureName.Supergroup]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/tutorials/supergroup-channel',
  },
  [ChatFeatureName.MessageSearch]: {
    ios: 'https://sendbird.com/docs/chat/v3/ios/guides/group-channel-advanced#2-search-messages-by-keyword',
    android: 'https://sendbird.com/docs/chat/v3/android/guides/group-channel-advanced#2-search-messages-by-keyword',
    javascript:
      'https://sendbird.com/docs/chat/v3/javascript/guides/group-channel-advanced#2-search-messages-by-keyword',
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/message-search',
  },
  // [ChatFeatureName.Migration]: {},
  // EAP
  // [ChatFeatureName.PushTranslation]: {
  //   ios: 'https://sendbird.com/docs/chat/v3/ios/guides/push-notifications#3-push-notification-translation',
  //   android: 'https://sendbird.com/docs/chat/v3/android/guides/push-notifications#3-push-notification-translation',
  //   javascript: 'https://sendbird.com/docs/chat/v3/javascript/guides/push-notifications#3-push-notification-translation',
  // },
  [ChatFeatureName.TextModeration]: {
    platformAPI: 'https://sendbird.com/docs/chat/v3/platform-api/guides/filter-and-moderation',
  },
  [ChatFeatureName.DisappearingMessages]: {},
};

export enum UsageAlerts {
  Quota80 = 'quota80',
  Quota100 = 'quota100',
  Limit80 = 'limit80',
  Limit100 = 'limit100',
}

export type AllPremiumFeatures =
  | Omit<
      keyof PremiumFeatures,
      'announcement_price' | 'auto_trans_basic' | 'auto_trans_premium' | 'auto_partitioning' | 'spam_flood_protection'
    >
  | Omit<keyof EnabledFeatures, 'message_search_v3'>
  | 'analytics'
  | 'message_search';

export const CardBrandsNew = ['amex', 'diners', 'discover', 'jcb', 'mastercard', 'unionpay', 'visa', 'unknown'];
export const CardBrands = CardBrandsNew.concat([
  'Visa',
  'American Express',
  'MasterCard',
  'Discover',
  'JCB',
  'Diners Club',
  'Unknown',
]);

export enum OrganizationStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Archived = 'ARCHIVED',
  Deleted = 'DELETED',
}

export enum FullScreenModalIDs {
  CallsVoucher = 'callsVoucher',
  CallsSubscription = 'callsSubscription',
}

export const PASSWORD_VALIDATION_REGEX = '^[a-zA-Z0-9-+(){|}\\]\\[\\\\<=>/_~\'":;`!@#$%^&*.,?]*$';

export const REGION_STATUS_PAGES = {
  'ap-1': 'https://status-tokyo.sendbird.com',
  'ap-2': 'https://status-seoul.sendbird.com',
  'ap-5': 'https://status-singapore.sendbird.com',
  'ap-8': 'https://status-mumbai.sendbird.com',
  'ap-9': 'https://status-sydney.sendbird.com',
  'eu-1': 'https://status-frankfurt.sendbird.com',
  'us-1': 'https://status-oregon.sendbird.com',
  'us-2': 'https://status-nvirginia1.sendbird.com',
  'us-3': 'https://status-nvirginia2.sendbird.com',
};

export const RATE_LIMIT_VERSION_TIMESTAMP = 1590624000000;

// space for the easy ui formatting
export const USAGE_GB_UNIT = ' GB';
