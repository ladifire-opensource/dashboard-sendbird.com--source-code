import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, ClientStorage } from '@utils';

export const fetchTwitterUser: FetchTwitterUserAPI = (
  pid,
  region = '',
  { agentTwitterUserId, customerTwitterUserId },
) =>
  axios.get(
    `${getDeskURL(
      region,
    )}/api/twitter_users/${agentTwitterUserId}/get_twitter_user_information?twitterUserId=${customerTwitterUserId}`,
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );

export const fetchTwitterUserDetail = (pid, region, { id }) =>
  axios.get(`${getDeskURL(region)}/api/twitter_users/${id}`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });

export const followTwitterUser: FollowTwitterUserAPI = (
  pid,
  region = '',
  { agentTwitterUserId, customerTwitterUserId },
) =>
  axios.post(
    `${getDeskURL(region)}/api/twitter_users/${agentTwitterUserId}/follow`,
    { twitterUserId: customerTwitterUserId },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );

export const unfollowTwitterUser: UnfollowTwitterUserAPI = (
  pid,
  region = '',
  { agentTwitterUserId, customerTwitterUserId },
) =>
  axios.post(
    `${getDeskURL(region)}/api/twitter_users/${agentTwitterUserId}/unfollow`,
    { twitterUserId: customerTwitterUserId },
    { headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid } },
  );

export const fetchTwitterUserMedia: FetchTwitterUserMediaAPI = (pid, region = '', { id, mediaUrl }) =>
  axios.get(`${getDeskURL(region)}/api/twitter_users/${id}/get_media_url`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
    params: snakeCaseKeys({ mediaUrl }),
  });

export const getTwitterStatus: GetTwitterStatusAPI = (pid, region = '', { id, statusId }) =>
  axios.get(`${getDeskURL(region)}/api/twitter_users/${id}/get_twitter_status`, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
    params: { statusId },
  });

export const uploadTwitterMedia: UploadTwitterMediaAPI = (pid, region, { id, channelType, filedata }) => {
  const payload = new FormData();
  payload.append('channel_type', channelType);
  payload.append('filedata', filedata);
  return axios.post(`${getDeskURL(region)}/api/twitter_users/${id}/upload_media`, payload, {
    headers: { Authorization: `Token ${ClientStorage.get('deskApiToken')}`, pid },
  });
};
