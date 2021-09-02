import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, getTicketStatus2, ClientStorage } from '@utils';

export const fetchDataExports: FetchDataExports = (
  pid,
  region = '',
  { limit, offset, requestType, status, startDate, endDate, order, ...params },
) => {
  const url = `${getDeskURL(region)}/api/projects/exports/`;
  return axios.get(url, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: snakeCaseKeys({ limit, offset, requestType, status, startDate, endDate, order, ...params }),
  });
};

export const getDownloadURL: GetDownloadURL = (pid, region = '', { id }) => {
  const url = `${getDeskURL(region)}/api/exports/${id}/presigned_url/`;
  return axios.get(url, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const exportTicketDetailWithRange: ExportTicketDetailWithRange = (
  pid,
  region = '',
  { startDate, endDate, ticketStatus },
) => {
  const url = `${getDeskURL(region)}/api/exports/ticket_information/`;
  return axios.post(
    url,
    { startDate, endDate, status2: getTicketStatus2(ticketStatus) },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportTicketDetail: ExportTicketDetail = (pid, region = '', { ticket }) => {
  const url = `${getDeskURL(region)}/api/exports/ticket_information/`;
  return axios.post(url, { ticket }, { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } });
};

export const exportTicketMessages: ExportTicketMessages = (pid, region = '', { ticket }) => {
  const url = `${getDeskURL(region)}/api/exports/chat_message/`;
  return axios.post(url, { ticket }, { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } });
};

export const exportTicketCount: ExportDeskSummaryReport = (pid, region = '', { channelType, startDate, endDate }) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_ticket_counts/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAvgHourlyTicketCount: ExportDeskSummaryReport = (
  pid,
  region = '',
  { channelType, startDate, endDate },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_hourly_average_tickets/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportMessageCount: ExportDeskSummaryReport = (pid, region = '', { channelType, startDate, endDate }) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_message_counts/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAvgHourlyMessageCount: ExportDeskSummaryReport = (
  pid,
  region = '',
  { channelType, startDate, endDate },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_hourly_average_messages/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAvgFirstResponseTime: ExportDeskSummaryReport = (
  pid,
  region = '',
  { channelType, startDate, endDate },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_ticket_response_times/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAvgResolutionTime: ExportDeskSummaryReport = (
  pid,
  region = '',
  { channelType, startDate, endDate },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_ticket_duration_times/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportCSAT: ExportDeskSummaryReport = (pid, region = '', { channelType, startDate, endDate }) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_customer_satisfaction_scores/`;
  return axios.post(
    url,
    { channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportMissedTicket: ExportMissedTicket = (pid, region = '', { order }) => {
  const url = `${getDeskURL(region)}/api/exports/missed_tickets/`;
  return axios.post(url, { order }, { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } });
};

/*
  Agent Statistics
*/

export const exportAgentPerformance: ExportAgentPerformance = (
  pid,
  region = '',
  { role, channelType, startDate, endDate },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_agent_performance/`;
  return axios.post(
    url,
    { role, channelType, startDate, endDate },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAgentAssignments: ExportAgentReport = (
  pid,
  region = '',
  { agent, startDate, endDate, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_agent_assignment_count/`;
  return axios.post(
    url,
    { agent, startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAgentFirstResponseTime: ExportAgentReport = (
  pid,
  region = '',
  { agent, startDate, endDate, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_agent_assignment_response_time/`;
  return axios.post(
    url,
    { agent, startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAgentClosedTickets: ExportAgentReport = (
  pid,
  region = '',
  { agent, startDate, endDate, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_agent_ticket_counts/`;
  return axios.post(
    url,
    { agent, startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAgentAvgHourlyClosedTickets: ExportAgentReport = (
  pid,
  region = '',
  { agent, startDate, endDate, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_agent_hourly_average_ticket_counts/`;
  return axios.post(
    url,
    { agent, startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAgentCSAT: ExportAgentReport = (pid, region = '', { agent, startDate, endDate, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_agent_customer_satisfaction_scores/`;
  return axios.post(
    url,
    { agent, startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportAgentDailyConnectionStatus: ExportAgentReport = (
  pid,
  region = '',
  { agent, startDate, endDate, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_agent_connection_logs_time/`;
  return axios.post(
    url,
    { agent, startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

/*
  Team Statistics
*/

export const exportTeamPerformance: ExportTeamPerformance = (pid, region = '', { startDate, endDate, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_group_performance/`;
  return axios.post(
    url,
    { startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportTeamCloseTickets: ExportTeamReport = (
  pid,
  region = '',
  { startDate, endDate, group, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_closed_ticket_counts/`;
  return axios.post(
    url,
    { startDate, endDate, group, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportTeamAvgFirstResponseTime: ExportTeamReport = (
  pid,
  region = '',
  { startDate, endDate, group, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_ticket_response_times/`;
  return axios.post(
    url,
    { startDate, endDate, group, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportTeamAvgFirstResolutionTime: ExportTeamReport = (
  pid,
  region = '',
  { startDate, endDate, group, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_ticket_duration_times/`;
  return axios.post(
    url,
    { startDate, endDate, group, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportTeamAvgHourlyClosedTickets: ExportTeamReport = (
  pid,
  region = '',
  { startDate, endDate, group, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_hourly_average_tickets/`;
  return axios.post(
    url,
    { startDate, endDate, group, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportTeamCSAT: ExportTeamReport = (pid, region = '', { startDate, endDate, group, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_customer_satisfaction_scores/`;
  return axios.post(
    url,
    { startDate, endDate, group, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

/*
  Bot Statistics
*/

export const exportBotPerformance: ExportBotPerformance = (pid, region = '', { startDate, endDate, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_project_bot_performance/`;
  return axios.post(
    url,
    { startDate, endDate, channelType },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportBotCloseTickets: ExportBotReport = (pid, region = '', { startDate, endDate, bot, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_bot_closed_ticket_counts/`;
  return axios.post(
    url,
    { startDate, endDate, channelType, bot },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportBotClosingRates: ExportBotReport = (pid, region = '', { startDate, endDate, bot, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_bot_assignment_closing_rates/`;
  return axios.post(
    url,
    { startDate, endDate, channelType, bot },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportBotAssignments: ExportBotReport = (pid, region = '', { startDate, endDate, bot, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_bot_assignment_counts/`;
  return axios.post(
    url,
    { startDate, endDate, channelType, bot },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportBotAvgTimeToClosing: ExportBotReport = (
  pid,
  region = '',
  { startDate, endDate, bot, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_bot_closing_assigned_times/`;
  return axios.post(
    url,
    { startDate, endDate, channelType, bot },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportBotAvgTimeToHandover: ExportBotReport = (
  pid,
  region = '',
  { startDate, endDate, bot, channelType },
) => {
  const url = `${getDeskURL(region)}/api/exports/report_bot_handover_assigned_times/`;
  return axios.post(
    url,
    { startDate, endDate, channelType, bot },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};

export const exportBotCSAT: ExportBotReport = (pid, region = '', { startDate, endDate, bot, channelType }) => {
  const url = `${getDeskURL(region)}/api/exports/report_bot_customer_satisfaction_scores/`;
  return axios.post(
    url,
    { startDate, endDate, channelType, bot },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );
};
