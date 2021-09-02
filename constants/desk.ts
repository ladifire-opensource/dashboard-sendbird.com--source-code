/**
 * Message Types
 * USER, FILE, IMAGE, ADMIN, CEOC,
 */
import { AvatarType } from 'feather';

export type DeskMessageRenderMode = 'default' | 'compact';

export enum DeskMessagesMode {
  SENDBIRD = 'SENDBIRD',
  PLATFORM_API = 'PLATFORM_API',
  FACEBOOK_CONVERSATION = 'FACEBOOK_CONVERSATION',
  FACEBOOK_FEED = 'FACEBOOK_FEED',
  TWITTER_DIRECT_MESSAGE_EVENT = 'TWITTER_DIRECT_MESSAGE_EVENT',
  TWITTER_STATUS = 'TWITTER_STATUS',
}

export enum TicketStatus {
  ALL = 'ALL',
  INITIALIZED = 'INITIALIZED',
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  CLOSED = 'CLOSED',
  WIP = 'WORK_IN_PROGRESS',
  PROACTIVE = 'PROACTIVE',
}

export enum FacebookAttachmentTypes {
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  PHOTO = 'photo',
  FILE = 'file',
  FALLBACK = 'fallback', // url preview
  STICKER = 'sticker',
  ANIMATED_IMAGE_SHARE = 'animated_image_share',
}

export enum FacebookVerb {
  ADD = 'add',
  BLOCK = 'block',
  EDIT = 'edit',
  EDITED = 'edited',
  DELETE = 'delete',
  FOLLOW = 'follow',
  HIDE = 'hide',
  MUTE = 'mute',
  REMOVE = 'remove',
  UNBLOCK = 'unblock',
  UNHIDE = 'unhide',
  UPDATE = 'update',
}

export enum InstagramVerb {
  ADD = 'add',
  DELETE = 'delete',
}

export enum FacebookReactionTypes {
  NONE = 'NONE',
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  WOW = 'WOW',
  HAHA = 'HAHA',
  SAD = 'SAD',
  ANGRY = 'ANGRY',
  THANKFUL = 'THANKFUL',
}

export const SocialTicketChannelTypes: TicketChannelType[] = [
  'FACEBOOK_CONVERSATION',
  'FACEBOOK_FEED',
  'TWITTER_DIRECT_MESSAGE_EVENT',
  'TWITTER_STATUS',
  'INSTAGRAM_COMMENT',
  'WHATSAPP_MESSAGE',
];

export const DeskThumbnailSizes = [
  {
    maxWidth: 10,
    maxHeight: 10,
  },
  {
    maxWidth: 250,
    maxHeight: 250,
  },
  {
    maxWidth: 500,
    maxHeight: 500,
  },
];

export enum TicketType {
  CUSTOMER_CHAT = 'CUSTOMER_CHAT',
  PROACTIVE_CHAT = 'PROACTIVE_CHAT',
}

export enum TicketSortBy {
  STATUS = 'status2',
  PRIORITY = 'priority_value',
  SUBJECT = 'channel_name',
  CUSTOMER = 'customer__display_name',
  TEAM = 'group__name',
  ASSIGNEE = 'recent_assignment__agent__display_name',
  CSAT = 'customer_satisfaction_score',
  CREATED = 'created_at',
}

export enum AssignmentLogsSortBy {
  ASSIGNED_AT = 'assigned_at',
  SUBJECT = 'assigned_ticket__channel_name',
  AGENT = 'agent__display_name',
  ENDED_AT = 'ended_at',
  RESPONSE_TIME = 'response_time',
  CLOSED_AT = 'assigned_ticket__closed_at',
}

export enum TicketPriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum SortOrder {
  ASCEND = 'ascend',
  DESCEND = 'descend',
}

export enum TicketStatusValue {
  ASSIGNED = 'ASSIGNED',
  UNASSIGNED = 'UNASSIGNED',
  CLOSED = 'CLOSED',
}

export enum TicketAssignmentStatus {
  RESPONSED = 'RESPONSED',
  NOT_RESPONSED = 'NOT_RESPONSED',
  IDLE = 'IDLE',
}

export enum DeskTicketExportRequestType {
  TICKETS = 'TICKETS',
  ALL_TICKETS = 'TICKET_INFORMATION_LIST',
  TICKET_DETAILS = 'TICKET_INFORMATION',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
}

export enum DeskViewsExportRequestType {
  VIEWS = 'VIEWS',
  VIEWS_MISSED_TICKET = 'MISSED_TICKET',
}

export enum DeskSummaryExportRequestType {
  REPORT_SUMMARY = 'REPORT_SUMMARY',
  REPORT_SUMMARY_TICKETS = 'REPORT_PROJECT_TICKET_COUNT',
  REPORT_SUMMARY_TICKETS_PER_HOUR = 'REPORT_PROJECT_HOURLY_AVERAGE_TICKET',
  REPORT_SUMMARY_MESSAGES = 'REPORT_PROJECT_TICKET_MESSAGE_COUNT',
  REPORT_SUMMARY_MESSAGE_PER_HOUR = 'REPORT_PROJECT_HOURLY_AVERAGE_MESSAGE',
  REPORT_SUMMARY_AVG_FIRST_RESPONSE = 'REPORT_PROJECT_ASSIGNMENT_RESPONSE_TIME',
  REPORT_SUMMARY_AVG_RESOLUTION_TIME = 'REPORT_PROJECT_TICKET_DURATION_TIME',
  REPORT_SUMMARY_CSAT = 'REPORT_PROJECT_CUSTOMER_SATISFACTION_SCORE',
}

export enum DeskAgentExportRequestType {
  REPORT_AGENT = 'REPORT_AGENT',
  REPORT_AGENT_PERFORMANCE = 'REPORT_PROJECT_AGENT_PERFORMANCE',
  REPORT_ASSIGNMENTS = 'REPORT_AGENT_ASSIGNMENT_COUNT',
  REPORT_FIRST_RESPONSE_TIME = 'REPORT_AGENT_ASSIGNMENT_RESPONSE_TIME',
  REPORT_CLOSED_TICKET_COUNT = 'REPORT_AGENT_TICKET_COUNT',
  REPORT_CLOSED_HOURLY_AVERAGE_TICKET_COUNT = 'REPORT_AGENT_HOURLY_AVERAGE_TICKET_COUNT',
  REPORT_CONNECTION_LOGS_TIME = 'REPORT_AGENT_CONNECTION_LOGS_TIME',
  REPORT_CUSTOMER_SATISFACTION_SCORE = 'REPORT_AGENT_CUSTOMER_SATISFACTION_SCORE',
}

export enum DeskTeamExportRequestType {
  REPORT_TEAM = 'REPORT_TEAM',
  REPORT_TEAM_PERFORMANCE = 'REPORT_PROJECT_GROUP_PERFORMANCE',
  REPORT_TEAM_CLOSED_TICKETS = 'REPORT_GROUP_CLOSED_TICKET_COUNT',
  REPORT_TEAM_AVG_FIRST_RESPONSE_TIME = 'REPORT_GROUP_ASSIGNMENT_RESPONSE_TIME',
  REPORT_TEAM_AVG_RESOLUTION_TIME = 'REPORT_GROUP_TICKET_DURATION_TIME',
  REPORT_TEAM_CLOSED_TICKET_PER_HOUR = 'REPORT_GROUP_HOURLY_AVERAGE_MESSAGE',
  REPORT_TEAM_CUSTOMER_SATISFACTION_SCORE = 'REPORT_GROUP_CUSTOMER_SATISFACTION_SCORE',
}

export enum DeskBotExportRequestType {
  REPORT_BOT = 'REPORT_BOT',
  REPORT_BOT_PERFORMANCE = 'REPORT_PROJECT_BOT_PERFORMANCE',
  REPORT_BOT_CLOSED_TICKET_COUNT = 'REPORT_BOT_CLOSED_TICKET_COUNT',
  REPORT_BOT_ASSIGNMENT_CLOSING_RATE = 'REPORT_BOT_ASSIGNMENT_CLOSING_RATE',
  REPORT_BOT_CLOSING_ASSIGNED_TIME = 'REPORT_BOT_CLOSING_ASSIGNED_TIME',
  REPORT_BOT_ASSIGNMENT_COUNT = 'REPORT_BOT_ASSIGNMENT_COUNT',
  REPORT_BOT_HANDOVER_ASSIGNED_TIME = 'REPORT_BOT_HANDOVER_ASSIGNED_TIME',
  REPORT_BOT_CUSTOMER_SATISFACTION_SCORE = 'REPORT_BOT_CUSTOMER_SATISFACTION_SCORE',
}

export type DeskDataExportRequestType =
  | DeskTicketExportRequestType
  | DeskViewsExportRequestType
  | DeskSummaryExportRequestType
  | DeskAgentExportRequestType
  | DeskTeamExportRequestType
  | DeskBotExportRequestType;

export enum DeskDataExportStatus {
  PROCESSING = 'INPROGRESS',
  COMPLETED = 'DONE',
  FAILED = 'FAIL',
  EXPIRED = 'EXPIRED',
}

export enum StatsAgentsSortBy {
  ID = 'agent_id',
  NAME = 'agent__display_name',
  RESPONSE_TIME = 'average_response_time',
  CSAT = 'average_customer_satisfaction_score',
  ASSIGNMENTS = 'number_of_assignments',
  ASSIGNED_TICKETS = 'number_of_assigned_tickets',
  CLOSED_TICKETS = 'number_of_closed_tickets',
}

export enum StatsTeamsSortBy {
  ID = 'group_id',
  NAME = 'group_name',
  CLOSED_TICKETS = 'closed_ticket',
  RESOLUTION_TIME = 'avg_resolution_time',
  RESPONSE_TIME = 'avg_response_time',
  ASSIGNED_TICKETS = 'group_assigned_tickets',
  CSAT = 'avg_customer_satisfaction_score',
}

export enum StatsBotsSortBy {
  ID = 'agent__bot__id',
  NAME = 'agent__bot__name',
  ASSIGNMENTS = 'number_of_assignments',
  RECEIVED_TICKETS = 'number_of_received_tickets',
  CLOSED_TICKETS = 'number_of_closed_tickets',
  CLOSING_RATE = 'average_assignment_closing_rate',
  CLOSING_TIME = 'average_closing_assigned_time',
  HANDOVER = 'average_handover_assigned_time',
  CSAT = 'average_customer_satisfaction_score',
}

export const DeskAllowedRegions = [
  'staging',
  'intoz',
  'ap-1',
  'ap-2',
  'ap-3',
  'ap-5',
  'vmuae',
  'us-1',
  'us-2',
  'us-3',
  'eu-1',
  'gojek-test',
  'woowa',
];

export enum QuickRepliesAvailableType {
  AGENT = 'AGENT',
  GROUP = 'GROUP',
  ALL = 'ALL',
}

export enum AgentType {
  USER = 'USER',
  BOT = 'BOT',
}

export enum AgentRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
}

export enum AgentTier {
  INTERMEDIATE = 'INTERMEDIATE',
  EXPERT = 'EXPERT',
}

export enum AgentConnection {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  AWAY = 'AWAY',
}

export enum AgentActivationStatusValue {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PAUSED = 'PAUSED',
  PERMISSION_DENIED_IN_PENDING = 'PERMISSION_DENIED_IN_PENDING',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

// FIXME: fix the key name to be equal to its value
export enum DeskBotType {
  CUSTOMIZED = 'CUSTOM',
  FAQBOT = 'FAQ',
}

export enum DeskFAQBotFilesSortBy {
  ID = 'id',
  CREATED_AT = 'created_at',
  STATUS = 'status',
}

export enum DeskBotWebhookStatus {
  INITIALIZED = 'INITIALIZED',
  TIMEOUT = 'TIMEOUT',
  RECEIVED = 'RECEIVED',
  ERROR = 'ERROR',
  SENT = 'SENT',
}

export enum DeskBotFileStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PROCESSING = 'PROCESSING',
  EXPIRED = 'EXPIRED',
  ERROR = 'ERROR',
  DELETED = 'DELETED',
}

export enum DeskBotDetailTab {
  SETTINGS,
  FILES,
}

export const IFRAME_SIDEBAR_STATE = 'iframeSidebarState';

export const DEFAULT_IFRAME_WIDTH = 336;

export enum TicketStatusSystemMessageKey {
  ACTIVE_TO_IDLE_BY_SYSTEM = 'SYSTEM_MESSAGE_TICKET_ACTIVE_TO_IDLE_BY_SYSTEM',
  ACTIVE_TO_IDLE_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_ACTIVE_TO_IDLE_BY_AGENT',
  WIP_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_WIP_BY_AGENT',
  WIP_TO_PENDING_BY_SYSTEM = 'SYSTEM_MESSAGE_TICKET_WIP_TO_UNASSIGNED_BY_SYSTEM',
  IDLE_TO_ACTIVE_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_IDLE_TO_ACTIVE_BY_AGENT',
  IDLE_TO_ACTIVE_BY_CUSTOMER = 'SYSTEM_MESSAGE_TICKET_IDLE_TO_ACTIVE_BY_CUSTOMER',
  IDLE_TO_ACTIVE_BY_SYSTEM = 'SYSTEM_MESSAGE_TICKET_IDLE_TO_ACTIVE_BY_SYSTEM',
  CLOSED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_CLOSED_BY_AGENT',
  CLOSED_BY_CUSTOMER = 'SYSTEM_MESSAGE_TICKET_CLOSED_BY_CUSTOMER',
  CLOSED_BY_PLATFORM_API = 'SYSTEM_MESSAGE_TICKET_CLOSED_BY_PLATFORM_API',
  CLOSED_BY_SYSTEM = 'SYSTEM_MESSAGE_TICKET_CLOSED_BY_SYSTEM',
  REOPENED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_REOPENED_BY_AGENT',
  REOPENED_BY_CUSTOMER = 'SYSTEM_MESSAGE_TICKET_REOPENED_BY_CUSTOMER',
}

export enum TicketAssignmentSystemMessagesKey {
  ASSIGNED_BY_SYSTEM = 'SYSTEM_MESSAGE_TICKET_ASSIGNED_BY_SYSTEM',
  ASSIGNED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_ASSIGNED_BY_AGENT',
  GROUP_ASSIGNED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_GROUP_ASSIGNED_BY_AGENT',
  GROUP_UNASSIGNED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_GROUP_UNASSIGNED_BY_AGENT',
  TRANSFERRED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_TRANSFERRED_BY_AGENT',
  GROUP_TRANSFERRED_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_GROUP_TRANSFERRED_BY_AGENT',
  GROUP_TRANSFERRED_BY_PLATFORM_API = 'SYSTEM_MESSAGE_TICKET_GROUP_TRANSFERRED_BY_PLATFORM_API',
}

export enum TicketPrioritySystemMessagesKey {
  UPDATE_PRIORITY_BY_AGENT = 'SYSTEM_MESSAGE_TICKET_PRIORITY_VALUE_UPDATED_BY_AGENT',
  UPDATE_PRIORITY_BY_CUSTOMER = 'SYSTEM_MESSAGE_TICKET_PRIORITY_VALUE_UPDATED_BY_CUSTOMER',
  UPDATE_PRIORITY_BY_PLATFORM_API = 'SYSTEM_MESSAGE_TICKET_PRIORITY_VALUE_UPDATED_BY_PLATFORM_API',
}

export enum BotMessagesKey {
  CUSTOMER_NAME = 'customer_name',
  TICKET_NAME = 'ticket_name',
  SELECTED_QUESTION = 'selected_question',
}

export enum FileEncryptionOption {
  ALL = 'ALL',
  MY_TICKETS = 'MY_TICKETS',
}

export const DeskAvatarType = {
  Agent: AvatarType.Member,
  Customer: AvatarType.User,
  Bot: AvatarType.Bot,
};
