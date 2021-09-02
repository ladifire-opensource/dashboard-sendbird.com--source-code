import numbro from 'numbro';

import { SubscriptionName } from '@constants';

import { TALK_TO_SALES_PLAN_NAMES, STARTER_PLAN_NAMES } from './constants';

export const getFormattedPlanFee = (fee: SubscriptionPlan['baseFee']) => numbro(fee / 100).format('$0,0.00');

export const getFormattedQuota = (quota: SubscriptionPlan['quota']) =>
  numbro(quota).format({
    thousandSeparated: true,
    mantissa: 0,
  });

export const isTalkToSalesPlan = (subscriptionName: SubscriptionName) =>
  TALK_TO_SALES_PLAN_NAMES.includes(subscriptionName);

export const isStarterPlan = (subscriptionName: SubscriptionName) => STARTER_PLAN_NAMES.includes(subscriptionName);

export const checkIsLegacyStarterPlan = (currentSubscription: Subscription | null) =>
  currentSubscription != null &&
  isStarterPlan(currentSubscription.subscription_name) &&
  currentSubscription.plan.message_search_index.enabled &&
  currentSubscription.plan.message_search_query.enabled;
