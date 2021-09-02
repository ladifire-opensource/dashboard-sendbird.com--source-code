export enum SubscriptionName {
  Free = 'free',
  FreeTrial = 'free_trial',

  PlanA1K = 'plan_a_1k',
  PlanA5K = 'plan_a_5k',
  PlanA10K = 'plan_a_10k',
  PlanA25K = 'plan_a_25k',
  PlanA50K = 'plan_a_50k',
  PlanA100K = 'plan_a_100k',

  PlanB5K = 'plan_b_5k',
  PlanB10K = 'plan_b_10k',
  PlanB25K = 'plan_b_25k',
  PlanB50K = 'plan_b_50k',
  PlanB100K = 'plan_b_100k',

  Community = 'community',
  SupportL0 = 'support_l0',
  SupportL1 = 'support_l1',
  SupportL2 = 'support_l2',
  SupportL3 = 'support_l3',

  Enterprise = 'enterprise',
}

export enum SubscriptionType {
  SelfServe = 'SELF_SERVE',
  SalesCustom = 'SALES_CUSTOM',
}

export enum SubscriptionProduct {
  Chat = 'CHAT',
  Calls = 'CALLS',
  Desk = 'DESK',
  Support = 'SUPPORT',
}

export enum PrimaryContacts {
  OwnerOnly = 'OWNER_ONLY',
  OwnerAdmin = 'OWNER_ADMIN',
  OwnerAdminBilling = 'OWNER_ADMIN_BILLING',
  All = 'ALL',
}
