import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchStatsTicketCounts: FetchStatsTicketCountsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/ticket_counts/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsClosedTicketCounts: FetchStatsClosedTicketCountsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/closed_ticket_counts/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsAssignmentClosingRates: FetchStatsAssignmentClosingRatesAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/assignment_closing_rates/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsClosingAssignedTimes: FetchStatsClosingAssignedTimesAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/closing_assigned_times/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsHandoverAssignedTimes: FetchStatsHandoverAssignedTimesAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/handover_assigned_times/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsAssignmentCounts: FetchStatsAssignmentCountsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/assignment_counts/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsTicketResponseTimes: FetchStatsTicketResponseTimesAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/ticket_response_times/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsTicketMessageCounts: FetchStatsTicketMessageCountsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/ticket_message_counts/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsTicketDurationTimes: FetchStatsTicketDurationTimesAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/ticket_duration_times/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsByAgents: FetchStatsByAgentsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/agents2/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsByTeams: FetchStatsByTeamsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/groups/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsByBots: FetchStatsByBotsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/bots/`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchHourlyAverageTicketCounts: FetchHourlyAverageTicketCountAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/hourly_average_ticket_counts`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchHourlyAverageMessageCounts: FetchHourlyAverageMessageCountsAPI = (pid, region = '', params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/hourly_average_message_counts/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStat: FetchAgentStatAPI = (pid, region = '', { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatTicketResponseTimes: FetchAgentStatTicketResponseTimesAPI = (
  pid,
  region = '',
  { id, ...params },
) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/ticket_response_times`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatConnectionLogsTime: FetchAgentStatConnectionLogsTimeAPI = (
  pid,
  region = '',
  { id, ...params },
) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/connection_logs_time`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatTicketCounts: FetchAgentStatTicketCountsAPI = (pid, region = '', { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/ticket_counts`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatAssignmentCounts: FetchAgentStatAssignmentCountsAPI = (
  pid,
  region = '',
  { id, ...params },
) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/assignment_counts`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatConnectionLogs: FetchAgentStatConnectionLogsAPI = (pid, region = '', { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/connection_logs`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatCSAT: FetchAgentStatCSATScoreAPI = (pid, region = '', { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/customer_satisfaction_scores`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchAgentStatHourlyClosedTickets: FetchAgentStatHourlyClosedTicketsAPI = (
  pid,
  region = '',
  { id, ...params },
) => {
  return axios.get(`${getDeskURL(region)}/api/stats/agents/${id}/hourly_average_ticket_counts`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchCSAT: FetchCSATAPI = (pid, region, params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/customer_satisfaction_scores`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchClosedStatuses: FetchStatsClosedStatusAPI = (pid, region, params) => {
  return axios.get(`${getDeskURL(region)}/api/stats/projects/close_statuses`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBot: FetchStatsBotAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBotAssignmentCounts: FetchStatsBotAssignmentCountsAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}/assignment_counts`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBotClosedTicketCounts: FetchStatsBotClosedTicketCountsAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}/closed_ticket_counts`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBotTicketClosingRates: FetchStatsBotTicketClosingRatesAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}/assignment_closing_rates`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBotClosingTime: FetchStatsBotClosingTimeAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}/closing_assigned_times`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBotHandoverTime: FetchStatsBotHandoverTimeAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}/handover_assigned_times`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const fetchStatsBotCSAT: FetchStatsBotCSATAPI = (pid, region, { id, ...params }) => {
  return axios.get(`${getDeskURL(region)}/api/stats/bots/${id}/customer_satisfaction_scores`, {
    headers: {
      Authorization: `Token ${localStorage.getItem('deskApiToken')}`,
      pid,
    },
    params,
  });
};
