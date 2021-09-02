/*
 *
 *  Alert Messages
 *
 */

// auth
export const ALERT_EMAIL_INVALID = 'Your email address is invalid. Please enter a valid address.';
export const ALERT_PASSWORD_INVALID = 'Your password is invalid. Please enter a valid password.';

export const ALERT_PASSWORD_CHANGED = 'Your password has been changed successfully.';
export const ALERT_PASSWORD_CHANGED_BY_RESET = 'Your password has been changed successfully. Please login again.';
export const ALERT_RESET_PASSWORD_FAILED = 'Your password reset was unsuccessful, please review the errors below.';
export const ALERT_CHANGE_PASSWORD_FAILED =
  'Your password change was unsuccessful, please review the errors on each fields.';
export const ALERT_TWO_FACTOR_RECOVERY_FAILED = 'Your recovery was unsuccessful, please review the code.';
export const PASSWORD_DO_NOT_MATCH = 'Your new password and comfirm password do not match.';
export const PASSWORD_SPACE_SPECIAL_CHARACTER_NOT_ALLOWED = 'Space and two byte character are not allowed.';

// application
export const ALERT_APPLICATION_NAME_CHANGED = 'Application name has been changed.';

// billing
export const ALERT_CARD_AGGREMENT_REQUIRED = 'You have to agree with the terms and privacy policy.';

// authorization
export const ALERT_NOT_ALLOWED_FEATURE =
  'The feature is not available on your current plan. Please consult the sales team through the website or dashboard.';

// channel
export const ALERT_CHANNEL_CREATED = 'Channel has been created.';
export const ALERT_CHANNEL_DELETED = 'Channel has been deleted.';
export const ALERT_CHANNEL_METADATA_UPDATED = 'Channel metadata has been updated.';
export const ALERT_CHANNEL_IS_REQUIRED = 'Please select at least one channel.';
export const ALERT_ADMIN_MESSAGE_SENT = 'Admin message has been sent successfully.';
export const ALERT_ADMIN_MESSAGE_LENGTH = 'Admin messages should not be longer than 1000 characters.';

// messages
export const ALERT_MESSAGES_DELETED_MULTIPLE = 'Messages have been deleted successfully.';
export const ALERT_MESSAGES_DELETED_ALONE = 'Message has been deleted successfully.';
export const ALERT_ALL_CHANNEL_MESSAGES_DELETED = 'Messages in the channel have been deleted successfully.';
export const ALERT_MESSAGE_RECOVERED = 'The message has been recovered successfully.';
export const ALERT_MESSAGE_UPDATED = 'Message has been updated successfully.';

// analytics
export const ALERT_ANALYTICS_DATE_RANGE_92 = 'Daily date selection can not exceed 92 days.';

// reports
export const ALERT_REPORTS_DATE_RANGE_31 = 'Daily date selection can not exceed 31 days.';

// settings
export const ALERT_SETTINGS_PUSH_ENABLED = 'Push notifications turned on';
export const ALERT_SETTINGS_PUSH_DISABLED = 'Push notifications turned off.';
export const ALERT_SETTINGS_ACCESS_TOKEN_POLICY = 'Access token user policy has been changed.';
export const ALERT_SETTINGS_WEBHOOKS = 'Webhooks configuration has been changed.';
export const ALERT_SETTINGS_DISPLAY_PAST_MESSAGE_ON = 'Chat history turned on';
export const ALERT_SETTINGS_DISPLAY_PAST_MESSAGE_OFF = 'Chat history turned off';
export const ALERT_SETTINGS_AUTO_EVENT_MESSAGE = 'Auto message settings changed.';
export const ALERT_SETTINGS_CREDENTIAL_FILTER_ADDED = 'Allowed domain added.';
export const ALERT_SETTINGS_CREDENTIAL_FILTER_DELETED = 'Allowed domain removed.';
export const ALERT_SETTINGS_MAX_LENGTH_OF_MESSAGE = 'Max length has been changed.';
export const ALERT_SETTINGS_FILE_MESSAGE_EVENT = 'File message event option has been saved.';
export const ALERT_SETTINGS_APPLICATION_DELETED = 'Application deleted.';
export const ALERT_SETTINGS_APNS = 'APNs configuration has been saved.';
export const ALERT_SETTINGS_FCM = 'FCM configuration has been saved.';
export const ALERT_SETTINGS_PUSH_CONFIGURATION_DELETED = 'Push configuration has been deleted.';
export const ALERT_SETTINGS_PUSH_NOTIFICATION_TEMPLATES = 'Push notification message template has been saved.';
export const ALERT_SETTINGS_APNS_CERT_REQUIRED = 'Certification file is required.';
export const ALERT_SETTINGS_APNS_CERT_ERROR = 'Failed to upload the cert file. Please check the file format again.';
// general
export const ALERT_COPY_SUCCESS = 'Copied.';
export const ALERT_BAD_REQUEST = 'Bad request';

// dialog
export const ALERT_DIALOG_ADMIN_MESSAGE_LIMITED = 'You need to upgrade your plan to use admin message.';

/*
 *
 *  Descriptions
 *
 */

export const DESC_DIALOG_ADMIN_MESSAGE =
  'Admin Message allows you to send administrative messages (such as announcements) to multiple channels at a time. Please select target channels and type your message.';
export const DESC_DIALOG_ADMIN_MESSAGE_LIMITED = 'You can only send a test message on Free Plan.';
export const DESC_DIALOG_ADMIN_MESSAGE_LENGTH = 'Admin message should not be longer than 1000 characters';
export const DESC_DIALOG_DELETE_CHANNELS = 'Do you want to delete these channels?';
export const DESC_DIALOG_DELETE_MESSAGES = (messageCount) => {
  return `Do you want to delete ${messageCount} messages?`;
};
export const DESC_DIALOG_DELETE_MESSAGE = 'Do you want to delete this message?';
export const DESC_DIALOG_DELETE_MESSAGES_IN_CHANNEL = (channelUrl) => {
  return `Do you want to delete messages in the channel, '${channelUrl}'?`;
};
export const DESC_DIALOG_EDIT_MESSAGE = 'You can edit this message text';

/*
 *
 *  Placeholder
 *
 */
export const PH_SEARCH_CHANNELS = 'Search';
export const PH_CHAT_INPUT = 'Say something...';
export const PH_DIALOG_ADMIN_MESSAGE_LIMITED = 'TEST MESSAGE : You can not modify this message on Free Plan';
