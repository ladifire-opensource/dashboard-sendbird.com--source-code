import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { snakeCaseKeys } from '@utils';

export const fetchTicketMessages: FetchTicketMessagesAPI = ({ appId, channelUrl, params }) => {
  return axios.get(`${getGateURL()}/platform/v3/group_channels/${channelUrl}/messages`, {
    params: { ...snakeCaseKeys(params), include: params.include ?? false, including_removed: true },
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
