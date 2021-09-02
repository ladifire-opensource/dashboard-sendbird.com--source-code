import { AxiosResponse } from 'axios';

import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { LIST_LIMIT } from '@constants';

import { getEditChannelRequestPayload } from './EditChannelUtils';

export const createOpenChannel: CreateOpenChannelAPI = ({ appId, data }) => {
  const payload = new FormData();
  Object.keys(data)
    .filter((key) => !!data[key])
    .forEach((key) => {
      payload.append(key, data[key]);
    });
  return axios.post(`${getGateURL()}/platform/v3/open_channels`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchMetadata: FetchMetadataAPI = ({ appId, channelType, channel_url }) => {
  return axios.get(`${getGateURL()}/platform/v3/${channelType}/${channel_url}/metadata`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const setMetadata: SetMetadataAPI = async ({ appId, channelType, channel_url, deletes, payload }) => {
  const responses: Array<AxiosResponse> = [];
  const errors: Array<{}> = [];

  if (Object.entries(deletes).length > 0) {
    responses.push(
      ...((
        await Promise.all(
          deletes.map((key) =>
            axios
              .delete(`${getGateURL()}/platform/v3/${channelType}/${channel_url}/metadata/${key}`, {
                headers: {
                  authorization: getSBAuthToken(),
                  'App-Id': appId,
                },
              })
              .catch((error) => {
                if (error.data && error.data.code === 400201) {
                  // Resource not found. Because it's a DELETE request, ignore this error
                  return null;
                }
                errors.push(error);
                return null;
              }),
          ),
        )
      ).filter((response) => response) as ReadonlyArray<AxiosResponse>),
    );
  }

  const upsertMetadataResponse = await axios
    .put(
      `${getGateURL()}/platform/v3/${channelType}/${channel_url}/metadata`,
      {
        metadata: payload,
        upsert: true,
      },
      {
        headers: {
          authorization: getSBAuthToken(),
          'App-Id': appId,
        },
      },
    )
    .catch((error) => {
      errors.push(error);
      return null;
    });

  if (upsertMetadataResponse) {
    responses.push(upsertMetadataResponse);
  }

  return { responses, errors };
};

export const editChannel: EditChannelAPI = ({ appId, channelUrl, channelType, data }) => {
  const payload = getEditChannelRequestPayload(data);

  return axios.put(`${getGateURL()}/platform/v3/${channelType}/${channelUrl}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const deleteChannel: DeleteChannelAPI = ({ appId, channelType, channel_url }) => {
  return axios.delete(`${getGateURL()}/platform/v3/${channelType}/${channel_url}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchOpenChannels: FetchOpenChannelsAPI = ({ appId, listToken }) => {
  return axios.get(`${getGateURL()}/platform/v3/open_channels?token=${listToken}&limit=${LIST_LIMIT}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const searchOpenChannels: SearchOpenChannelsAPI = ({ appId, queryOptions }) => {
  return axios.get(`${getGateURL()}/platform/v3/open_channels${queryOptions}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchOpenChannel: FetchOpenChannelAPI = ({ appId, channel_url }) => {
  return axios.get(`${getGateURL()}/platform/v3/open_channels/${channel_url}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchClassicOpenChannelMigrationStatus: FetchClassicOpenChannelMigrationStatusAPI = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/open_channels/migrate_classic_open_channels`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const startClassicOpenChannelMigration: StartClassicOpenChannelMigrationAPI = ({ appId }) => {
  return axios.post(
    `${getGateURL()}/platform/v3/open_channels/migrate_classic_open_channels`,
    {},
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const fetchGroupChannels: FetchGroupChannelsAPI = ({ appId, listToken, limit, customType, showEmpty }) => {
  return axios.get(`${getGateURL()}/platform/v3/group_channels`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
    params: { token: listToken, limit, custom_type: customType, show_empty: showEmpty },
  });
};

export const searchGroupChannels: SearchGroupChannelsAPI = ({ appId, queryOptions, listToken, limit, showEmpty }) => {
  return axios.get(`${getGateURL()}/platform/v3/group_channels${queryOptions}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
    params: { token: listToken, limit, show_empty: showEmpty },
  });
};

export const fetchMyGroupChannels: FetchMyGroupChannelsAPI = ({ appId, userId, listToken, limit, showEmpty }) => {
  return axios.get(`${getGateURL()}/platform/v3/users/${encodeURIComponent(userId)}/my_group_channels`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
    params: { token: listToken, limit, show_empty: showEmpty },
  });
};

export const fetchGroupChannel: FetchGroupChannelAPI = ({ appId, channel_url }) => {
  return axios.get(`${getGateURL()}/platform/v3/group_channels/${channel_url}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};
