import { IntlShape } from 'react-intl';

import { SettingsGridCardAction } from './../common/containers/layout/settingsGrid/index';

export enum QueueMessagesTypes {
  INITIAL = 'INITIAL',
  PREV = 'PREV',
  NEXT = 'NEXT',
  SENT = 'SENT',
  RECEIVED = 'RECEIVED',
}

// analytics

export const AnalyticsTypes = {
  CREATED_USERS: 'CREATED_USERS',
  ACTIVE_USERS: 'ACTIVE_USERS',
  DEACTIVATED_USERS: 'DEACTIVATED_USERS',
  CREATED_CHANNELS: 'CREATED_CHANNELS',
  CREATED_CHANNELS_BY_CHANNEL_CUSTOM_TYPE: 'CREATED_CHANNELS_BY_CHANNEL_CUSTOM_TYPE',
  ACTIVE_CHANNELS: 'ACTIVE_CHANNELS',
  AVERAGE_MEMBERS: 'AVERAGE_MEMBERS',
  SENT_MESSAGES: 'SENT_MESSAGES',
  SENT_MESSAGES_BY_MESSAGE_CUSTOM_TYPE: 'SENT_MESSAGES_BY_MESSAGE_CUSTOM_TYPE',
  SENT_MESSAGES_BY_CHANNEL_CUSTOM_TYPE: 'SENT_MESSAGES_BY_CHANNEL_CUSTOM_TYPE',
  SENT_MESSAGES_BY_CHANNEL_CUSTOM_TYPE_WITH_MESSAGE_CUSTOM_TYPE:
    'SENT_MESSAGES_BY_CHANNEL_CUSTOM_TYPE_WITH_MESSAGE_CUSTOM_TYPE',
  SENT_MESSAGES_PER_USER: 'SENT_MESSAGES_PER_USER',
};

export enum StatisticsMetricsLegacy {
  created_users = 'created_users',
  deactivated_users = 'deactivated_users',

  sent_messages = 'sent_messages',
  sent_messages_by_message_custom_type = 'sent_messages_by_message_custom_type',
  sent_messages_by_channel_custom_type = 'sent_messages_by_channel_custom_type',
  sent_messages_by_channel_custom_type_with_message_custom_type = 'sent_messages_by_channel_custom_type_with_message_custom_type',
  sent_messages_per_user = 'sent_messages_per_user',

  created_channels = 'created_channels',
  created_channels_by_channel_custom_type = 'created_channels_by_channel_custom_type',
  active_channels = 'active_channels',

  channel_member = 'channel_member',
}

export enum StatisticsMetrics {
  created_users = 'created_users',
  deactivated_users = 'deactivated_users',
  deleted_users = 'deleted_users',
  created_channels = 'created_channels',
  active_channels = 'active_channels',
  messages = 'messages',
  messages_per_user = 'messages_per_user',

  // GA metrics
  message_viewers = 'message_viewers',
  message_senders = 'message_senders', // replacement of the active users
}

export enum StatisticsTimeDimension {
  daily = 'daily',
  monthly = 'monthly',
}

export enum StatisticsSegments {
  custom_channel_type = 'custom_channel_type',
  custom_message_type = 'custom_message_type',
}

// search query options
// FIXME: enum or object
export const QUERY_USER_NICKNAME = 'QUERY_USER_NICKNAME';
export const QUERY_USER_NICKNAME_STARTSWITH = 'QUERY_USER_NICKNAME_STARTSWITH';
export const QUERY_USER_ID = 'QUERY_USER_ID';

// Enum values are used as query string parameter keys
export enum GroupChannelSearchOperator {
  nicknameEquals = 'nickname',
  userIdEquals = 'user_id',
  urlEquals = 'url',
  customTypeEquals = 'custom_type',
  nameEquals = 'name',
  nameStartswith = 'name_startswith',
  membersIncludeIn = 'members_include_in',
}

// Enum values are used as query string parameter keys
export enum OpenChannelSearchOperator {
  nameContains = 'name_contains',
  urlEquals = 'url',
  customTypeEquals = 'custom_type',
}

export enum PushConfigurationRegisterMode {
  Add = 'ADD',
  Edit = 'EDIT',
}

export const getSettingsAction = (params: {
  key: string;
  intl: IntlShape;
  isFetching: boolean;
  onCancel: React.MouseEventHandler<HTMLButtonElement>;
  onSave: React.MouseEventHandler<HTMLButtonElement>;
}): SettingsGridCardAction[] => [
  {
    key: `${params.key}-cancel`,
    label: params.intl.formatMessage({ id: 'core.settings.settingsGrid.button.cancel' }),
    type: 'button',
    buttonType: 'tertiary',
    onClick: params.onCancel,
  },
  {
    key: `${params.key}-save`,
    label: params.intl.formatMessage({ id: 'core.settings.settingsGrid.button.save' }),
    type: 'submit',
    buttonType: 'primary',
    isLoading: params.isFetching,
    disabled: params.isFetching,
    onClick: params.onSave,
  },
];

export enum MessageSearchPipelineMigrationStatus {
  Scheduled = 'SCHEDULED',
  Executing = 'EXECUTING',
  MigrationErrored = 'MIGRATION_ERRORED',
  Stopped = 'STOPPED',
}

export enum MessageSearchPipelineSubscriptionStatus {
  Subscribed = 'SUBSCRIBED',
  Unsubscribed = 'UNSUBSCRIBED',
}
