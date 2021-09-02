import { SubscriptionName } from '@constants';

export enum SubscriptionPlanType {
  Starter = 'Starter',
  Pro = 'Pro',
  Enterprise = 'Enterprise',
}

export const TALK_TO_SALES_PLAN_NAMES = [
  SubscriptionName.Enterprise,
  SubscriptionName.PlanA50K,
  SubscriptionName.PlanA100K,
  SubscriptionName.PlanB50K,
  SubscriptionName.PlanB100K,
];

export const STARTER_PLAN_NAMES = [
  SubscriptionName.PlanA1K,
  SubscriptionName.PlanA5K,
  SubscriptionName.PlanA10K,
  SubscriptionName.PlanA25K,
  SubscriptionName.PlanA50K,
  SubscriptionName.PlanA100K,
];

export const pricingTitleIntlKeys = {
  usage: 'common.subscriptionPlanDialog.table.features.title.usage',
  modernMessagingEssentials: 'common.subscriptionPlanDialog.table.features.title.modernMessagingEssentials',
  advancedMessaging: 'common.subscriptionPlanDialog.table.features.title.advancedMessaging',
  translation: 'common.subscriptionPlanDialog.table.features.title.translation',
  moderation: 'common.subscriptionPlanDialog.table.features.title.moderation',
  dataAndAnalytics: 'common.subscriptionPlanDialog.table.features.title.dataAndAnalytics',
  integrations: 'common.subscriptionPlanDialog.table.features.title.integrations',
  security: 'common.subscriptionPlanDialog.table.features.title.security',
  compliance: 'common.subscriptionPlanDialog.table.features.title.compliance',
  infrastructure: 'common.subscriptionPlanDialog.table.features.title.infrastructure',
};

// Leave it just as Design team decide to revert floating head animation to sub categories of table using `pricingTitleIntlKeys`
export const floatingPlanHeadTitleKeys = {
  features: 'common.features.table.title',
  subscriptionPlanModalTitle: 'common.subscriptionPlanDialog.title',
};
