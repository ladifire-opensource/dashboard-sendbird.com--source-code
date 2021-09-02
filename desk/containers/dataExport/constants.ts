import { PrimitiveColor, TreeData } from 'feather';

import {
  DeskAgentExportRequestType,
  DeskBotExportRequestType,
  DeskDataExportStatus,
  DeskSummaryExportRequestType,
  DeskTeamExportRequestType,
  DeskTicketExportRequestType,
  DeskViewsExportRequestType,
} from '@constants';

export const TICKET_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.tickets.allTickets',
    value: DeskTicketExportRequestType.ALL_TICKETS,
    icon: 'tickets',
    tooltipContent: 'desk.dataExport.filters.dataType.tickets',
  },
  {
    label: 'desk.dataExport.filters.dataType.tickets.ticketDetails',
    value: DeskTicketExportRequestType.TICKET_DETAILS,
    icon: 'tickets',
    tooltipContent: 'desk.dataExport.filters.dataType.tickets',
  },
  {
    label: 'desk.dataExport.filters.dataType.tickets.ticketMessages',
    value: DeskTicketExportRequestType.CHAT_MESSAGE,
    icon: 'tickets',
    tooltipContent: 'desk.dataExport.filters.dataType.tickets',
  },
];

export const VIEWS_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.views.missedTickets',
    value: DeskViewsExportRequestType.VIEWS_MISSED_TICKET,
    icon: 'tickets',
    tooltipContent: 'desk.dataExport.filters.dataType.views',
  },
];

export const SUMMARY_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.tickets',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_TICKETS,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.ticketsPerHour',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_TICKETS_PER_HOUR,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.messages',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_MESSAGES,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.messagesPerHour',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_MESSAGE_PER_HOUR,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.avgFirstResponseTime',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_AVG_FIRST_RESPONSE,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.avgResolutionTime',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_AVG_RESOLUTION_TIME,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary.csat',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY_CSAT,
    icon: 'reports-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.performanceSummary',
  },
];

export const AGENT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.performance',
    value: DeskAgentExportRequestType.REPORT_AGENT_PERFORMANCE,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.assignments',
    value: DeskAgentExportRequestType.REPORT_ASSIGNMENTS,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.avgFirstResponseTime',
    value: DeskAgentExportRequestType.REPORT_FIRST_RESPONSE_TIME,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.closedTickets',
    value: DeskAgentExportRequestType.REPORT_CLOSED_TICKET_COUNT,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.closedTicketsPerHour',
    value: DeskAgentExportRequestType.REPORT_CLOSED_HOURLY_AVERAGE_TICKET_COUNT,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.csat',
    value: DeskAgentExportRequestType.REPORT_CUSTOMER_SATISFACTION_SCORE,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent.dailyStatusTracking',
    value: DeskAgentExportRequestType.REPORT_CONNECTION_LOGS_TIME,
    icon: 'agents-filled',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsAgent',
  },
];

export const BOT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.performance',
    value: DeskBotExportRequestType.REPORT_BOT_PERFORMANCE,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.assignments',
    value: DeskBotExportRequestType.REPORT_BOT_ASSIGNMENT_COUNT,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.closedTickets',
    value: DeskBotExportRequestType.REPORT_BOT_CLOSED_TICKET_COUNT,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.closedAssignmentRate',
    value: DeskBotExportRequestType.REPORT_BOT_ASSIGNMENT_CLOSING_RATE,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.avgTimeToClosing',
    value: DeskBotExportRequestType.REPORT_BOT_CLOSING_ASSIGNED_TIME,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.avgTimeToHandover',
    value: DeskBotExportRequestType.REPORT_BOT_HANDOVER_ASSIGNED_TIME,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot.csat',
    value: DeskBotExportRequestType.REPORT_BOT_CUSTOMER_SATISFACTION_SCORE,
    icon: 'bot',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsBot',
  },
];

export const TEAM_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam.performance',
    value: DeskTeamExportRequestType.REPORT_TEAM_PERFORMANCE,
    icon: 'teams',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsTeam',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam.closedTickets',
    value: DeskTeamExportRequestType.REPORT_TEAM_CLOSED_TICKETS,
    icon: 'teams',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsTeam',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam.closedTicketsPerHour',
    value: DeskTeamExportRequestType.REPORT_TEAM_CLOSED_TICKET_PER_HOUR,
    icon: 'teams',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsTeam',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam.avgFirstResponseTime',
    value: DeskTeamExportRequestType.REPORT_TEAM_AVG_FIRST_RESPONSE_TIME,
    icon: 'teams',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsTeam',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam.avgResolutionTime',
    value: DeskTeamExportRequestType.REPORT_TEAM_AVG_RESOLUTION_TIME,
    icon: 'teams',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsTeam',
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam.csat',
    value: DeskTeamExportRequestType.REPORT_TEAM_CUSTOMER_SATISFACTION_SCORE,
    icon: 'teams',
    tooltipContent: 'desk.dataExport.filters.dataType.reportsTeam',
  },
];

export const ALL_EXPORT_TYPE_DROPDOWN_ITEMS: TreeData[] = [
  {
    label: 'desk.dataExport.filters.dataType.tickets',
    value: DeskTicketExportRequestType.TICKETS,
    icon: 'tickets',
    children: TICKET_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  },
  {
    label: 'desk.dataExport.filters.dataType.views',
    value: DeskViewsExportRequestType.VIEWS,
    icon: 'tickets',
    children: VIEWS_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  },
  {
    label: 'desk.dataExport.filters.dataType.performanceSummary',
    value: DeskSummaryExportRequestType.REPORT_SUMMARY,
    icon: 'reports-filled',
    children: SUMMARY_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsAgent',
    value: DeskAgentExportRequestType.REPORT_AGENT,
    icon: 'agents-filled',
    children: AGENT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsBot',
    value: DeskBotExportRequestType.REPORT_BOT,
    icon: 'bot',
    children: BOT_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  },
  {
    label: 'desk.dataExport.filters.dataType.reportsTeam',
    value: DeskTeamExportRequestType.REPORT_TEAM,
    icon: 'teams',
    children: TEAM_EXPORT_TYPE_CHILDREN_DROPDOWN_ITEMS,
  },
];

export const ALL_EXPORT_TYPE_VALUES = ALL_EXPORT_TYPE_DROPDOWN_ITEMS.reduce((acc, cur) => {
  if (cur.children) {
    return acc.concat(cur.children.map((child) => child.value));
  }
  return acc;
}, [] as string[]);

export const DATA_REQUEST_TYPE_MAP: Record<string, { exportFrom: string; label: string }> = {
  [DeskTicketExportRequestType.ALL_TICKETS]: {
    exportFrom: 'desk.dataExport.filters.dataType.tickets',
    label: 'desk.dataExport.filters.dataType.tickets.allTickets',
  },
  [DeskTicketExportRequestType.TICKET_DETAILS]: {
    exportFrom: 'desk.dataExport.filters.dataType.tickets',
    label: 'desk.dataExport.filters.dataType.tickets.ticketDetails',
  },
  [DeskTicketExportRequestType.CHAT_MESSAGE]: {
    exportFrom: 'desk.dataExport.filters.dataType.tickets',
    label: 'desk.dataExport.filters.dataType.tickets.ticketMessages',
  },
  [DeskViewsExportRequestType.VIEWS_MISSED_TICKET]: {
    exportFrom: 'desk.dataExport.filters.dataType.views',
    label: 'desk.dataExport.filters.dataType.views.missedTickets',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_TICKETS]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.tickets',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_TICKETS_PER_HOUR]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.ticketsPerHour',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_MESSAGES]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.messages',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_MESSAGE_PER_HOUR]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.messagesPerHour',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_AVG_FIRST_RESPONSE]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.avgFirstResponseTime',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_AVG_RESOLUTION_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.avgResolutionTime',
  },
  [DeskSummaryExportRequestType.REPORT_SUMMARY_CSAT]: {
    exportFrom: 'desk.dataExport.filters.dataType.performanceSummary',
    label: 'desk.dataExport.filters.dataType.performanceSummary.csat',
  },
  [DeskAgentExportRequestType.REPORT_AGENT_PERFORMANCE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.performance',
  },
  [DeskAgentExportRequestType.REPORT_ASSIGNMENTS]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.assignments',
  },
  [DeskAgentExportRequestType.REPORT_FIRST_RESPONSE_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.avgFirstResponseTime',
  },
  [DeskAgentExportRequestType.REPORT_CLOSED_TICKET_COUNT]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.closedTickets',
  },
  [DeskAgentExportRequestType.REPORT_CLOSED_HOURLY_AVERAGE_TICKET_COUNT]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.closedTicketsPerHour',
  },
  [DeskAgentExportRequestType.REPORT_CUSTOMER_SATISFACTION_SCORE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.csat',
  },
  [DeskAgentExportRequestType.REPORT_CONNECTION_LOGS_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsAgent',
    label: 'desk.dataExport.filters.dataType.reportsAgent.dailyStatusTracking',
  },
  [DeskTeamExportRequestType.REPORT_TEAM_PERFORMANCE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsTeam',
    label: 'desk.dataExport.filters.dataType.reportsTeam.performance',
  },
  [DeskTeamExportRequestType.REPORT_TEAM_CLOSED_TICKETS]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsTeam',
    label: 'desk.dataExport.filters.dataType.reportsTeam.closedTickets',
  },
  [DeskTeamExportRequestType.REPORT_TEAM_CLOSED_TICKET_PER_HOUR]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsTeam',
    label: 'desk.dataExport.filters.dataType.reportsTeam.closedTicketsPerHour',
  },
  [DeskTeamExportRequestType.REPORT_TEAM_AVG_FIRST_RESPONSE_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsTeam',
    label: 'desk.dataExport.filters.dataType.reportsTeam.avgFirstResponseTime',
  },
  [DeskTeamExportRequestType.REPORT_TEAM_AVG_RESOLUTION_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsTeam',
    label: 'desk.dataExport.filters.dataType.reportsTeam.avgResolutionTime',
  },
  [DeskTeamExportRequestType.REPORT_TEAM_CUSTOMER_SATISFACTION_SCORE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsTeam',
    label: 'desk.dataExport.filters.dataType.reportsTeam.csat',
  },
  [DeskBotExportRequestType.REPORT_BOT_PERFORMANCE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.performance',
  },
  [DeskBotExportRequestType.REPORT_BOT_CLOSED_TICKET_COUNT]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.closedTickets',
  },
  [DeskBotExportRequestType.REPORT_BOT_ASSIGNMENT_COUNT]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.assignments',
  },
  [DeskBotExportRequestType.REPORT_BOT_ASSIGNMENT_CLOSING_RATE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.closedAssignmentRate',
  },
  [DeskBotExportRequestType.REPORT_BOT_CLOSING_ASSIGNED_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.avgTimeToClosing',
  },
  [DeskBotExportRequestType.REPORT_BOT_HANDOVER_ASSIGNED_TIME]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.avgTimeToHandover',
  },
  [DeskBotExportRequestType.REPORT_BOT_CUSTOMER_SATISFACTION_SCORE]: {
    exportFrom: 'desk.dataExport.filters.dataType.reportsBot',
    label: 'desk.dataExport.filters.dataType.reportsBot.csat',
  },
};

export const STATUS_LIST: DropdownItem<DeskDataExportStatus>[] = [
  { label: 'desk.dataExport.filters.status.all', value: null },
  { label: 'desk.dataExport.filters.status.completed', value: DeskDataExportStatus.COMPLETED },
  { label: 'desk.dataExport.filters.status.expired', value: DeskDataExportStatus.EXPIRED },
  { label: 'desk.dataExport.filters.status.failed', value: DeskDataExportStatus.FAILED },
  { label: 'desk.dataExport.filters.status.processing', value: DeskDataExportStatus.PROCESSING },
];

export const STATUS_MAP: Record<DeskDataExportStatus, { color: PrimitiveColor; label: string }> = {
  [DeskDataExportStatus.COMPLETED]: {
    color: 'green',
    label: 'desk.dataExport.downloadStatus.completed',
  },
  [DeskDataExportStatus.PROCESSING]: {
    color: 'blue',
    label: 'desk.dataExport.downloadStatus.processing',
  },
  [DeskDataExportStatus.FAILED]: {
    color: 'red',
    label: 'desk.dataExport.downloadStatus.failed',
  },
  [DeskDataExportStatus.EXPIRED]: {
    color: 'neutral',
    label: 'desk.dataExport.downloadStatus.expired',
  },
};

export enum DeskDataExportSortBy {
  CREATED_AT = 'created_at',
  EXPIRED_AT = 'expired_at',
}
