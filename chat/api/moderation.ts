import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { fixedEncodeURIComponent, snakeCaseKeys } from '@utils';

export const sendAdminMessage = ({ appId, channelUrls, channelType, message, sendPush }: SendAdminMessageParams) => {
  return axios.post(
    `${getGateURL()}/platform/dapi/channels/${channelType}/admin_message/`,
    {
      message,
      channel_urls: channelUrls,
      send_push: sendPush,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const editMessage = ({ appId, channelType, channelURL, messageId, payload }: EditMessageParams) => {
  return axios.put(`${getGateURL()}/platform/v3/${channelType}/${channelURL}/messages/${messageId}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchGroupChannelsMessages: FetchGroupChannelsMessagesAPI = ({
  appId,
  channelUrl,
  messageId,
  ts,
  prevLimit,
  nextLimit,
  operatorFilter = 'all',
  include,
}) => {
  // Use dapi to bypass Soda's premium feature check logic about Message Retrieval
  return axios.get(`${getGateURL()}/platform/dapi/group_channels/${channelUrl}/messages`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
    params: {
      ...snakeCaseKeys({ messageId, prevLimit, nextLimit, operatorFilter }),
      message_ts: ts,
      include,
      presigned_file_url: true,
    },
  });
};

export const fetchGroupChannelsMessagesTotalCount: FetchGroupChannelsMessagesTotalCountAPI = ({ appId, channelUrl }) =>
  axios.get(`${getGateURL()}/platform/v3/group_channels/${channelUrl}/messages/total_count`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });

export const fetchGroupChannelsMembers: FetchGroupChannelsMembersAPI = ({ appId, channelUrl, token, limit }) => {
  return axios.get(`${getGateURL()}/platform/v3/group_channels/${channelUrl}/members`, {
    params: { token, limit },
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

export const fetchChannelBannedUsers = ({
  appId,
  channelUrl,
  token,
  limit,
  channelType,
}: {
  appId: string;
  channelUrl: string;
  token: string;
  limit: number;
  channelType: ChannelType;
}) => {
  return axios.get<{
    banned_list: BannedUserListItem[];
    next: string;
  }>(`${getGateURL()}/platform/v3/${channelType}/${channelUrl}/ban`, {
    params: { token, limit },
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

export const fetchChannelMutedUsers = ({
  appId,
  channelUrl,
  token,
  limit,
  channelType,
}: {
  appId: string;
  channelUrl: string;
  token: string;
  limit: number;
  channelType: ChannelType;
}) => {
  return axios.get<{
    muted_list: MutedUserListItem[];
    next: string;
  }>(`${getGateURL()}/platform/v3/${channelType}/${channelUrl}/mute`, {
    params: { token, limit },
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

export const muteGroupChannelUser = ({
  appId,
  channelUrl,
  userId,
  seconds,
  description,
}: MuteGroupChannelUserParams) => {
  return axios.post(
    `${getGateURL()}/platform/v3/group_channels/${channelUrl}/mute`,
    { user_id: userId, seconds, description },
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const unmuteGroupChannelUser = ({ appId, channelUrl, userId }: UnmuteGroupChannelUserParams) => {
  return axios.delete(
    `${getGateURL()}/platform/v3/group_channels/${channelUrl}/mute/${fixedEncodeURIComponent(userId)}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const banGroupChannelUser = ({ appId, channelUrl, payload }: BanGroupChannelUserParams) => {
  return axios.post(`${getGateURL()}/platform/v3/group_channels/${channelUrl}/ban`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const unbanGroupChannelUser = ({ appId, channelUrl, userId }: UnbanGroupChannelUserParams) => {
  return axios.delete(
    `${getGateURL()}/platform/v3/group_channels/${channelUrl}/ban/${fixedEncodeURIComponent(userId)}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const banOpenChannelUser = ({ appId, channelUrl, payload }: BanOpenChannelUserParams) => {
  return axios.post(`${getGateURL()}/platform/v3/open_channels/${channelUrl}/ban`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const unbanOpenChannelUser = ({ appId, channelUrl, userId }: UnbanOpenChannelUserParams) => {
  return axios.delete(
    `${getGateURL()}/platform/v3/open_channels/${channelUrl}/ban/${fixedEncodeURIComponent(userId)}`,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const freezeChannel = <T extends ChannelType>({
  appId,
  channelUrl,
  channelType,
  freeze,
}: CoreAPIPayload<{
  channelType: T;
  channelUrl: string;
  freeze: boolean;
}>): CancellableAxiosPromise<T extends 'open_channels' ? OpenChannel : GroupChannel> => {
  return axios.put(
    `${getGateURL()}/platform/v3/${channelType}/${channelUrl}/freeze`,
    {
      freeze,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const updateOperators = ({ appId, channelUrl, userIds }: UpdateOperatorsParams) => {
  return axios.put(
    `${getGateURL()}/platform/v3/open_channels/${channelUrl}`,
    { operators: userIds },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const getOpenChannelBanDetail = ({ appId, channelUrl, userId }: GetOpenChannelUserBanDetailParams) => {
  // if the user is not banned, it responds 200 status with body `{}`.
  return axios.get<BannedUserListItem | {}>(`${getGateURL()}/platform/v3/open_channels/${channelUrl}/ban/${userId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const getOpenChannelMuteDetail = ({ appId, channelUrl, userId }: GetOpenChannelUserBanDetailParams) => {
  return axios.get<ViewAMuteResponse>(`${getGateURL()}/platform/v3/open_channels/${channelUrl}/mute/${userId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const getGroupChannelBanDetail = ({ appId, channelUrl, userId }: GetOpenChannelUserBanDetailParams) => {
  // if the user is not banned, it responds 200 status with body `{}`.
  return axios.get<BannedUserListItem | {}>(`${getGateURL()}/platform/v3/group_channels/${channelUrl}/ban/${userId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const getGroupChannelMuteDetail = ({ appId, channelUrl, userId }: GetOpenChannelUserBanDetailParams) => {
  return axios.get<ViewAMuteResponse>(`${getGateURL()}/platform/v3/group_channels/${channelUrl}/mute/${userId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
