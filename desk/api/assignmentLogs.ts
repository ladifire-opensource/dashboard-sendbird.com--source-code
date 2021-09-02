import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, ClientStorage } from '@utils';

export const fetchAssignmentLogs: FetchAssignmentLogs = (pid, region = '', parameters) => {
  const url = `${getDeskURL(region)}/api/projects/assignments/`;
  const { ticketStatus2, ...rest } = parameters;
  return axios.get(url, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params: {
      ...snakeCaseKeys(rest),
      ticket_status2: ticketStatus2,
    },
  });
};
