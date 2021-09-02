export enum TicketRuleStatus {
  ON = 'ON',
  OFF = 'OFF',
}

export enum TicketRuleMatch {
  OR = 'or',
  AND = 'and',
}

export enum TicketRuleType {
  ASSIGNMENT = 'ASSIGNMENT',
  PRIORITY = 'PRIORITY',
}
export enum TicketRuleConditionType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DROPDOWN = 'DROPDOWN',
}

export enum TicketRuleConditionOperator {
  Is = 'is',
  IsNot = 'is_not',
  StartsWith = 'starts_with',
  EndsWith = 'ends_with',
  Contains = 'contains',
  DoesNotContain = 'does_not_contain',
  IsEmpty = 'is_empty',
  HasAnyValue = 'has_any_value',
  IsUnknown = 'is_unknown',
  GreaterThan = 'greater_than',
  LessThan = 'less_than',
}

export const TicketRuleConditionOperatorText = {
  is: 'desk.settings.ticketRules.operator.is',
  is_for_number: 'desk.settings.ticketRules.operator.is.forNumberType',
  is_not: 'desk.settings.ticketRules.operator.isNot',
  is_not_for_number: 'desk.settings.ticketRules.operator.isNot.forNumberType',
  starts_with: 'desk.settings.ticketRules.operator.startsWith',
  ends_with: 'desk.settings.ticketRules.operator.endsWith',
  contains: 'desk.settings.ticketRules.operator.contains',
  does_not_contain: 'desk.settings.ticketRules.operator.doesNotContain',
  is_empty: 'desk.settings.ticketRules.operator.isEmpty',
  has_any_value: 'desk.settings.ticketRules.operator.hasAnyValue',
  is_unknown: 'desk.settings.ticketRules.operator.isUnknown',
  greater_than: 'desk.settings.ticketRules.operator.greaterThan',
  less_than: 'desk.settings.ticketRules.operator.lessThan',
};

export enum TicketRuleConsequentType {
  GROUP = 'GROUP',
  PRIORITY = 'PRIORITY',
  GROUP_WITH_BOT_AGENT = 'GROUP_WITH_BOT_AGENT',
}

export enum TicketChannelTypeValue {
  INAPP = 'INAPP',
  SENDBIRD_IOS = 'SENDBIRD_IOS',
  SENDBIRD_ANDROID = 'SENDBIRD_ANDROID',
  SENDBIRD_JAVASCRIPT = 'SENDBIRD_JAVASCRIPT',
  SENDBIRD = 'SENDBIRD',
  FACEBOOK = 'FACEBOOK',
  FACEBOOK_CONVERSATION = 'FACEBOOK_CONVERSATION',
  FACEBOOK_FEED = 'FACEBOOK_FEED',
  TWITTER = 'TWITTER',
  TWITTER_DIRECT_MESSAGE_EVENT = 'TWITTER_DIRECT_MESSAGE_EVENT',
  TWITTER_STATUS = 'TWITTER_STATUS',
  INSTAGRAM = 'INSTAGRAM',
  INSTAGRAM_COMMENT = 'INSTAGRAM_COMMENT',
  WHATSAPP = 'WHATSAPP',
  WHATSAPP_MESSAGE = 'WHATSAPP_MESSAGE',
}

export const inAppTicketChannelTypes = [
  TicketChannelTypeValue.INAPP,
  TicketChannelTypeValue.SENDBIRD_IOS,
  TicketChannelTypeValue.SENDBIRD_ANDROID,
  TicketChannelTypeValue.SENDBIRD_JAVASCRIPT,
  TicketChannelTypeValue.SENDBIRD,
];

export const facebookTicketChannelTypes = [
  TicketChannelTypeValue.FACEBOOK,
  TicketChannelTypeValue.FACEBOOK_CONVERSATION,
  TicketChannelTypeValue.FACEBOOK_FEED,
];

export const twitterTicketChannelTypes = [
  TicketChannelTypeValue.TWITTER,
  TicketChannelTypeValue.TWITTER_DIRECT_MESSAGE_EVENT,
  TicketChannelTypeValue.TWITTER_STATUS,
];

export const instagramTicketChannelTypes = [TicketChannelTypeValue.INSTAGRAM, TicketChannelTypeValue.INSTAGRAM_COMMENT];

export const whatsappTicketChannelTypes = [TicketChannelTypeValue.WHATSAPP, TicketChannelTypeValue.WHATSAPP_MESSAGE];

export const socialTicketChannelTypes = [
  ...facebookTicketChannelTypes,
  ...twitterTicketChannelTypes,
  ...instagramTicketChannelTypes,
  ...whatsappTicketChannelTypes,
];

export const ticketChannelTypeItems = [
  ...inAppTicketChannelTypes,
  ...facebookTicketChannelTypes,
  ...twitterTicketChannelTypes,
  ...instagramTicketChannelTypes,
  ...whatsappTicketChannelTypes,
];

export const ticketChannelTypesForCustomBotItems = [
  ...inAppTicketChannelTypes,
  TicketChannelTypeValue.FACEBOOK_CONVERSATION,
  TicketChannelTypeValue.TWITTER_DIRECT_MESSAGE_EVENT,
  ...whatsappTicketChannelTypes,
];

export const ticketChannelTypeLabel = {
  INAPP: 'desk.settings.ticketRulesDetail.form.value.inApp',
  SENDBIRD_IOS: 'desk.settings.ticketRulesDetail.form.value.inApp.sendbird.ios',
  SENDBIRD_ANDROID: 'desk.settings.ticketRulesDetail.form.value.inApp.sendbird.android',
  SENDBIRD_JAVASCRIPT: 'desk.settings.ticketRulesDetail.form.value.inApp.sendbird.javascript',
  SENDBIRD: 'desk.settings.ticketRulesDetail.form.value.inApp.sendbird.others',
  FACEBOOK: 'desk.settings.ticketRulesDetail.form.value.facebook',
  FACEBOOK_CONVERSATION: 'desk.settings.ticketRulesDetail.form.value.facebook.conversation',
  FACEBOOK_FEED: 'desk.settings.ticketRulesDetail.form.value.facebook.feed',
  TWITTER: 'desk.settings.ticketRulesDetail.form.value.twitter',
  TWITTER_STATUS: 'desk.settings.ticketRulesDetail.form.value.twitter.status',
  TWITTER_DIRECT_MESSAGE_EVENT: 'desk.settings.ticketRulesDetail.form.value.twitter.directMessage',
  INSTAGRAM: 'desk.settings.ticketRulesDetail.form.value.instagram',
  INSTAGRAM_COMMENT: 'desk.settings.ticketRulesDetail.form.value.instagram.comment',
  WHATSAPP: 'desk.settings.ticketRulesDetail.form.value.whatsapp',
  WHATSAPP_MESSAGE: 'desk.settings.ticketRulesDetail.form.value.whatsapp.message',
};

export const ticketChannelTypeLabelWithSocialPrefix = {
  ...ticketChannelTypeLabel,
  FACEBOOK_CONVERSATION: 'desk.settings.ticketRulesDetail.form.value.facebook.conversationWithPrefix',
  FACEBOOK_FEED: 'desk.settings.ticketRulesDetail.form.value.facebook.feedWithPrefix',
  TWITTER_STATUS: 'desk.settings.ticketRulesDetail.form.value.twitter.statusWithPrefix',
  TWITTER_DIRECT_MESSAGE_EVENT: 'desk.settings.ticketRulesDetail.form.value.twitter.directMessageWithPrefix',
  INSTAGRAM_COMMENT: 'desk.settings.ticketRulesDetail.form.value.instagram.commentWithPrefix',
  WHATSAPP_MESSAGE: 'desk.settings.ticketRulesDetail.form.value.whatsapp.messageWithPrefix',
};

export enum TicketRuleConditionErrorType {
  KEY = 'KEY',
  TYPE = 'TYPE',
  OPERATOR = 'OPERATOR',
  VALUE = 'VALUE',
}

export enum TicketRuleConditionErrorMessage {
  INVALID_CHANNEL_BY_CONSEQUENT_CUSTOM_BOT = 'INVALID_CHANNEL_BY_CONSEQUENT_CUSTOM_BOT',
  INVALID_CHANNEL_BY_CONSEQUENT_FAQ_BOT = 'INVALID_CHANNEL_BY_CONSEQUENT_FAQ_BOT',
  INVALID_CHANNEL_BY_UNKNOWN_REASON = 'INVALID_CHANNEL_BY_UNKNOWN_REASON',
}

export enum TicketRuleConsequentErrorType {
  KEY = 'KEY',
  TYPE = 'TYPE',
  VALUE = 'VALUE',
  _group = '_group',
  _agent = '_agent',
  _priority = '_priority',
}

export const conditionKeyGroupItem: Record<
  'ticket' | 'ticketField' | 'customer' | 'customerField',
  TicketRuleConditionForKeyMap
> = {
  ticket: {
    key: 'ticket',
    operator: TicketRuleConditionOperator.Is,
    value: null,
    name: 'desk.settings.ticketRulesDetail.form.conditions.key.title.ticket',
  },
  ticketField: {
    key: 'ticketField',
    operator: TicketRuleConditionOperator.Is,
    value: null,
    name: 'desk.settings.ticketRulesDetail.form.conditions.key.title.ticketField',
  },
  customer: {
    key: 'customer',
    operator: TicketRuleConditionOperator.Is,
    value: null,
    name: 'desk.settings.ticketRulesDetail.form.conditions.key.title.customer',
  },
  customerField: {
    key: 'customerField',
    operator: TicketRuleConditionOperator.Is,
    value: null,
    name: 'desk.settings.ticketRulesDetail.form.conditions.key.title.customerField',
  },
};

export const ticketChannelKeyItem: TicketRuleCondition = {
  key: 'ticket.channel_type',
  operator: TicketRuleConditionOperator.Is,
  value: null,
  name: 'desk.settings.ticketRulesDetail.form.conditions.key.ticketChannelType',
  type: TicketRuleConditionType.DROPDOWN,
};

export const customerUserIdKeyItem: TicketRuleCondition = {
  key: 'customer.sendbird_id',
  operator: TicketRuleConditionOperator.Is,
  value: null,
  name: 'desk.settings.ticketRulesDetail.form.conditions.key.customerUserId',
  type: TicketRuleConditionType.TEXT,
};

export const customerUserNameKeyItem: TicketRuleCondition = {
  key: 'customer.display_name',
  operator: TicketRuleConditionOperator.Is,
  value: null,
  name: 'desk.settings.ticketRulesDetail.form.conditions.key.customerUserName',
  type: TicketRuleConditionType.TEXT,
};

// Key Items
export const conditionKeyGroupKeys = [
  conditionKeyGroupItem.ticket.key,
  conditionKeyGroupItem.ticketField.key,
  conditionKeyGroupItem.customer.key,
  conditionKeyGroupItem.customerField.key,
];

export const preDefinedConditionKeys = [
  ...conditionKeyGroupKeys,
  ticketChannelKeyItem.key,
  customerUserIdKeyItem.key,
  customerUserNameKeyItem.key,
];

// Operator Items
export const commonOperators = [TicketRuleConditionOperator.Is, TicketRuleConditionOperator.IsNot];
export const commonNoValueOperators = [TicketRuleConditionOperator.HasAnyValue, TicketRuleConditionOperator.IsUnknown];
export const noValueOperators = [TicketRuleConditionOperator.IsEmpty, ...commonNoValueOperators];

export const textOperators = [
  ...commonOperators,
  TicketRuleConditionOperator.StartsWith,
  TicketRuleConditionOperator.EndsWith,
  TicketRuleConditionOperator.Contains,
  TicketRuleConditionOperator.DoesNotContain,
  TicketRuleConditionOperator.IsEmpty,
  ...commonNoValueOperators,
];

export const numberOperators = [
  ...commonOperators,
  TicketRuleConditionOperator.GreaterThan,
  TicketRuleConditionOperator.LessThan,
  ...commonNoValueOperators,
];

export const dropdownOperators = [...commonOperators, ...commonNoValueOperators];
