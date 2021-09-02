import { axios, getDeskURL } from '@api/shared';
import { ClientStorage } from '@utils';

export const fetchMissedTickets: FetchMissedTicketsAPI = (pid, region = '', { limit, offset, order }) => {
  return axios.get(`${getDeskURL(region)}/api/projects/missed_tickets/`, {
    params: {
      limit,
      offset,
      order,
    },
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
