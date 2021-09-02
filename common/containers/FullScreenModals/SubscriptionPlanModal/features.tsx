import React, { FC } from 'react';

import styled, { css } from 'styled-components';

import { TooltipTargetIcon, cssVariables, ContextualHelp, Body } from 'feather';

import { pricingTitleIntlKeys } from './constants';

const InfoText = styled.div`
  margin-right: 4px;
`;

const InfoIcon = styled(TooltipTargetIcon).attrs({
  size: 16,
  icon: 'info',
  color: cssVariables('neutral-6'),
})``;

export const FeatureTooltip: FC<{ text: string; content: React.ReactNode }> = ({ text, content }) => {
  return (
    <>
      <InfoText>{text}</InfoText>
      {content && (
        <ContextualHelp
          portalId="portal_tooltip"
          className="pricingFeatureContextual"
          content={content}
          tooltipContentStyle={css`
            max-width: 256px;
            ${Body['body-short-01']};
            cursor: default;
          `}
          placement="right"
          popperProps={{
            modifiers: {
              offset: {
                offset: '0, 8',
              },
            },
          }}
        >
          <InfoIcon />
        </ContextualHelp>
      )}
    </>
  );
};

export type PricingFeaturePlanKey = 'starter' | 'pro' | 'enterprise';

export type PricingFeaturePlan = {
  supported: boolean;
  isAddon: boolean;
  description: string | null;
  hasOverage: boolean;
};

export type PricingFeatureRow = {
  key: string;
  name: string;
  description: string | null;
  plans: Record<PricingFeaturePlanKey, PricingFeaturePlan>;
};

export type PricingFeatureItem = {
  title: string;
  rows: PricingFeatureRow[];
};

// usage ==========================>
const monthlyActiveUser: PricingFeatureRow = {
  key: 'monthly_active_user',
  name: 'common.features.name.monthly_active_user',
  description: 'common.features.tooltip.monthly_active_user',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: 'Up to 100,000',
      hasOverage: true,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: 'Up to 100,000',
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: 'Millions',
      hasOverage: true,
    },
  },
};

const peakConnection: PricingFeatureRow = {
  key: 'peak_connection',
  name: 'common.features.name.peak_connection',
  description: null,
  // description: 'common.features.tooltip.monthly_active_user', FIXME: new Text from TW team is required
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: '2% of MAU',
      hasOverage: true,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: '2% of MAU',
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: '2% of MAU',
      hasOverage: true,
    },
  },
};

const messagesPerMonth: PricingFeatureRow = {
  key: 'messages_per_month',
  name: 'common.features.name.messages_per_month',
  description: 'common.features.tooltip.messages_per_month',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: 'Unlimited',
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: 'Unlimited',
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: 'Unlimited',
      hasOverage: false,
    },
  },
};

const messageStorage: PricingFeatureRow = {
  key: 'message_storage',
  name: 'common.features.name.message_storage',
  description: 'common.features.tooltip.message_storage',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: 'Unlimited',
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: 'Unlimited',
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: 'Unlimited',
      hasOverage: false,
    },
  },
};

const averageFileStorage: PricingFeatureRow = {
  key: 'file_storage',
  name: 'common.features.name.file_storage',
  description: 'common.features.tooltip.file_storage',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: '1GB',
      hasOverage: true,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: '10GB',
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: true,
      description: null,
      hasOverage: true,
    },
  },
};

const fileUploadTraffic: PricingFeatureRow = {
  key: 'upload_traffic',
  name: 'common.features.name.upload_traffic',
  description: 'common.features.tooltip.upload_traffic',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: '1GB',
      hasOverage: true,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: '10GB',
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: true,
      description: null,
      hasOverage: true,
    },
  },
};
// ==========================> usage

// advanced messaging ==========================>
const offlineMessaging: PricingFeatureRow = {
  key: 'offline_messaging',
  name: 'common.features.name.offline_messaging',
  description: 'common.features.tooltip.offline_messaging',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const smartThrottling: PricingFeatureRow = {
  key: 'smart_throttling',
  name: 'common.features.name.smart_throttling',
  description: 'common.features.tooltip.smart_throttling',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const dynamicPartitioning: PricingFeatureRow = {
  key: 'dynamic_partitioning',
  name: 'common.features.name.dynamic_partitioning',
  description: 'common.features.tooltip.dynamic_partitioning',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};
const doNotDisturbPush: PricingFeatureRow = {
  key: 'do_not_disturb_push',
  name: 'common.features.name.do_not_disturb_push',
  description: 'common.features.tooltip.do_not_disturb_push',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const metaArrayApi: PricingFeatureRow = {
  key: 'meta_array_api',
  name: 'common.features.name.meta_array_api',
  description: 'common.features.tooltip.meta_array_api',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const announcement: PricingFeatureRow = {
  key: 'announcement',
  name: 'common.features.name.announcement',
  description: 'common.features.tooltip.announcement',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
  },
};

const messageSearch: PricingFeatureRow = {
  key: 'message_search',
  name: 'common.features.name.message_search',
  description: 'common.features.tooltip.message_search',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
  },
};
// ==========================> advanced messaging

// modern messaging essentials ==========================>
const privateOneToOneChat: PricingFeatureRow = {
  key: 'private_one_to_one_chat',
  name: 'common.features.name.private_one_to_one_chat',
  description: 'common.features.tooltip.private_one_to_one_chat',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const groupChat: PricingFeatureRow = {
  key: 'group_chat',
  name: 'common.features.name.group_chat',
  description: 'common.features.tooltip.group_chat',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const superGroup: PricingFeatureRow = {
  key: 'supergroup',
  name: 'common.features.name.supergroup',
  description: 'common.features.tooltip.supergroup',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const typingIndicators: PricingFeatureRow = {
  key: 'typing_indicators',
  name: 'common.features.name.typing_indicators',
  description: 'common.features.tooltip.typing_indicators',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const readReceipts: PricingFeatureRow = {
  key: 'read_receipts',
  name: 'common.features.name.read_receipts',
  description: 'common.features.tooltip.read_receipts',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const presence: PricingFeatureRow = {
  key: 'presence',
  name: 'common.features.name.presence',
  description: 'common.features.tooltip.presence',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const reactions: PricingFeatureRow = {
  key: 'reactions',
  name: 'common.features.name.reactions',
  description: 'common.features.tooltip.reactions',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const mentions: PricingFeatureRow = {
  key: 'mentions',
  name: 'common.features.name.mentions',
  description: 'common.features.tooltip.mentions',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const unreadMessageCount: PricingFeatureRow = {
  key: 'unread_message_count',
  name: 'common.features.name.unread_message_count',
  description: 'common.features.tooltip.unread_message_count',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const pushNotifications: PricingFeatureRow = {
  key: 'push_notifications',
  name: 'common.features.name.push_notifications',
  description: 'common.features.tooltip.push_notifications',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const shareFilesAndMultimedia: PricingFeatureRow = {
  key: 'share_files_and_multimedia',
  name: 'common.features.name.share_files_and_multimedia',
  description: 'common.features.tooltip.share_files_and_multimedia',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const structuredMessageTemplates: PricingFeatureRow = {
  key: 'structured_message_templates',
  name: 'common.features.name.structured_message_templates',
  description: 'common.features.tooltip.structured_message_templates',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const autoThumbnailGenerator: PricingFeatureRow = {
  key: 'auto_thumbnail',
  name: 'common.features.name.auto_thumbnail',
  description: 'common.features.tooltip.auto_thumbnail',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
  },
};

const deliveryReceipt: PricingFeatureRow = {
  key: 'delivery_receipt',
  name: 'common.features.name.delivery_receipt',
  description: 'common.features.tooltip.delivery_receipt',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

// ==========================> modern messaging essentials

// translation ==========================>
const autoMessageTranslation: PricingFeatureRow = {
  key: 'auto_message_translation',
  name: 'common.features.name.auto_message_translation',
  description: 'common.features.tooltip.auto_message_translation',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
  },
};

const onDemandTranslation: PricingFeatureRow = {
  key: 'on_demand_translation',
  name: 'common.features.name.on_demand_translation',
  description: 'common.features.tooltip.on_demand_translation',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const pushTranslation: PricingFeatureRow = {
  key: 'push_translation',
  name: 'common.features.name.push_translation',
  description: 'common.features.tooltip.push_translation',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};
// ==========================> translation

// moderation ==========================>
const userReporting: PricingFeatureRow = {
  key: 'user_reporting',
  name: 'common.features.name.user_reporting',
  description: 'common.features.tooltip.user_reporting',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const userToUserBlocking: PricingFeatureRow = {
  key: 'user_to_user_blocking',
  name: 'common.features.name.user_to_user_blocking',
  description: 'common.features.tooltip.user_to_user_blocking',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const muteUser: PricingFeatureRow = {
  key: 'mute_user',
  name: 'common.features.name.mute_user',
  description: 'common.features.tooltip.mute_user',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const banUser: PricingFeatureRow = {
  key: 'ban_user',
  name: 'common.features.name.ban_user',
  description: 'common.features.tooltip.ban_user',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const deactivateUser: PricingFeatureRow = {
  key: 'deactivate_user',
  name: 'common.features.name.deactivate_user',
  description: 'common.features.tooltip.deactivate_user',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const channelOperators: PricingFeatureRow = {
  key: 'channel_operators',
  name: 'common.features.name.channel_operators',
  description: 'common.features.tooltip.channel_operators',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const domainFilter: PricingFeatureRow = {
  key: 'domain_filter',
  name: 'common.features.name.domain_filter',
  description: 'common.features.tooltip.domain_filter',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const spanFloodProtection: PricingFeatureRow = {
  key: 'span_flood_protection',
  name: 'common.features.name.span_flood_protection',
  description: 'common.features.tooltip.span_flood_protection',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const moderationDashboard: PricingFeatureRow = {
  key: 'moderation_tools',
  name: 'common.features.name.moderation_tools',
  description: 'common.features.tooltip.moderation_tools',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const autoImageModeration: PricingFeatureRow = {
  key: 'image_moderation',
  name: 'common.features.name.image_moderation',
  description: 'common.features.tooltip.image_moderation',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
  },
};

const profanityFilter: PricingFeatureRow = {
  key: 'profanity_filter',
  name: 'common.features.name.profanity_filter',
  description: 'common.features.tooltip.profanity_filter',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const freezeChannel: PricingFeatureRow = {
  key: 'freeze_channel',
  name: 'common.features.name.freeze_channel',
  description: 'common.features.tooltip.freeze_channel',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};
// ==========================> moderation

// data and analytics ==========================>
const analyticsDashboard: PricingFeatureRow = {
  key: 'analytics_dashboard',
  name: 'common.features.name.analytics_dashboard',
  description: 'common.features.tooltip.analytics_dashboard',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const advancedAnalytics: PricingFeatureRow = {
  key: 'advanced_analytics',
  name: 'common.features.name.advanced_analytics',
  description: 'common.features.tooltip.advanced_analytics',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const messageRetrievalApi: PricingFeatureRow = {
  key: 'message_retrieval',
  name: 'common.features.name.message_retrieval',
  description: 'common.features.tooltip.message_retrieval',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const dataExport: PricingFeatureRow = {
  key: 'data_export',
  name: 'common.features.name.data_export',
  description: 'common.features.tooltip.data_export',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: true,
      description: null,
      hasOverage: false,
    },
  },
};
// ==========================> data and analytics

// integration==========================>
const chatbotInterface: PricingFeatureRow = {
  key: 'bot_interface',
  name: 'common.features.name.bot_interface',
  description: 'common.features.tooltip.bot_interface',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: true,
    },
  },
};

const postEventWebhooks: PricingFeatureRow = {
  key: 'post_event_webhooks',
  name: 'common.features.name.post_event_webhooks',
  description: 'common.features.tooltip.post_event_webhooks',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};
// ==========================> integration

// security ==========================>
const tlsSslEncryption: PricingFeatureRow = {
  key: 'tls_ssl_encryption',
  name: 'common.features.name.tls_ssl_encryption',
  description: null,
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const fileEncryption: PricingFeatureRow = {
  key: 'file_encryption',
  name: 'common.features.name.file_encryption',
  description: 'common.features.tooltip.file_encryption',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const gdprApi: PricingFeatureRow = {
  key: 'gdpr_api',
  name: 'common.features.name.gdpr_api',
  description: 'common.features.tooltip.gdpr_api',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const ipWhitelisting: PricingFeatureRow = {
  key: 'ip_whitelisting',
  name: 'common.features.name.ip_whitelisting',
  description: 'common.features.tooltip.ip_whitelisting',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

// ==========================> security

// compliance ==========================>
const soc2: PricingFeatureRow = {
  key: 'soc2',
  name: 'common.features.name.soc2',
  description: null,
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const iso27001: PricingFeatureRow = {
  key: 'iso27001',
  name: 'common.features.name.iso27001',
  description: null,
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const gdpr: PricingFeatureRow = {
  key: 'gdpr',
  name: 'common.features.name.gdpr',
  description: null,
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const euUsPrivacyShield: PricingFeatureRow = {
  key: 'eu_us_privacy_shield',
  name: 'common.features.name.eu_us_privacy_shield',
  description: null,
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const hipaa: PricingFeatureRow = {
  key: 'hipaa',
  name: 'common.features.name.hipaa',
  description: null,
  plans: {
    starter: {
      supported: true,
      isAddon: true,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: true,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: true,
      description: null,
      hasOverage: false,
    },
  },
};

// ==========================> compliance

// infrastructure ==========================>
const chooseYourAwsRegion: PricingFeatureRow = {
  key: 'choose_your_aws_region',
  name: 'common.features.name.choose_your_aws_region',
  description: 'common.features.tooltip.choose_your_aws_region',
  plans: {
    starter: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const privateDedicatedServers: PricingFeatureRow = {
  key: 'private_dedicated_servers',
  name: 'common.features.name.private_dedicated_servers',
  description: null,
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

const publicStaticIp: PricingFeatureRow = {
  key: 'public_static_ip',
  name: 'common.features.name.public_static_ip',
  description: 'common.features.tooltip.public_static_ip',
  plans: {
    starter: {
      supported: false,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    pro: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
    enterprise: {
      supported: true,
      isAddon: false,
      description: null,
      hasOverage: false,
    },
  },
};

// ==========================> infrastructure
export const getPricingFeatures: () => PricingFeatureItem[] = () => {
  return [
    {
      title: pricingTitleIntlKeys.usage,
      rows: [
        monthlyActiveUser,
        peakConnection,
        messagesPerMonth,
        messageStorage,
        averageFileStorage,
        fileUploadTraffic,
      ],
    },
    {
      title: pricingTitleIntlKeys.advancedMessaging,
      rows: [
        offlineMessaging,
        smartThrottling,
        dynamicPartitioning,
        doNotDisturbPush,
        metaArrayApi,
        announcement,
        messageSearch,
      ],
    },
    {
      title: pricingTitleIntlKeys.modernMessagingEssentials,
      rows: [
        privateOneToOneChat,
        groupChat,
        superGroup,
        typingIndicators,
        readReceipts,
        presence,
        reactions,
        mentions,
        unreadMessageCount,
        pushNotifications,
        shareFilesAndMultimedia,
        structuredMessageTemplates,
        autoThumbnailGenerator,
        deliveryReceipt,
      ],
    },
    {
      title: pricingTitleIntlKeys.translation,
      rows: [autoMessageTranslation, onDemandTranslation, pushTranslation],
    },
    {
      title: pricingTitleIntlKeys.moderation,
      rows: [
        userReporting,
        userToUserBlocking,
        muteUser,
        banUser,
        deactivateUser,
        channelOperators,
        domainFilter,
        spanFloodProtection,
        moderationDashboard,
        autoImageModeration,
        profanityFilter,
        freezeChannel,
      ],
    },
    {
      title: pricingTitleIntlKeys.dataAndAnalytics,
      rows: [analyticsDashboard, advancedAnalytics, messageRetrievalApi, dataExport],
    },
    {
      title: pricingTitleIntlKeys.integrations,
      rows: [chatbotInterface, postEventWebhooks],
    },

    {
      title: pricingTitleIntlKeys.security,
      rows: [tlsSslEncryption, fileEncryption, gdprApi, ipWhitelisting],
    },
    {
      title: pricingTitleIntlKeys.compliance,
      rows: [soc2, iso27001, gdpr, euUsPrivacyShield, hipaa],
    },
    {
      title: pricingTitleIntlKeys.infrastructure,
      rows: [chooseYourAwsRegion, privateDedicatedServers, publicStaticIp],
    },
  ];
};
