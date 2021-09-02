import { axios, getDeskURL } from '@api/shared';
import { snakeCaseKeys, ClientStorage } from '@utils';

// url preview
export const fetchURLPreview = ({ pid, region = '', url }) => {
  return axios.post(
    `${getDeskURL(region)}/api/utils/url_preview/`,
    {
      url,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const updateTicketAssignment: PatchTicketAssignmentAPI = (pid, region = '', { assignmentId, payload }) => {
  return axios.patch(`${getDeskURL(region)}/api/assignments/${assignmentId}/`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const deleteDeskSendbirdMessage: DeleteDeskSendbirdMessageAPI = (pid, region, { ticketId, messageId }) => {
  return axios.delete(`${getDeskURL(region)}/api/tickets/${ticketId}/delete_sendbird_message/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    data: snakeCaseKeys({ messageId }),
  });
};

export const fetchFacebookPage: FetchFacebookPageAPI = (pid, region, { id }) => {
  return axios.get(`${getDeskURL(region)}/api/facebook_pages/${id}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchFacebookMessages: FetchFacebookMessagesAPI = (pid, region, { ticketId, params }) => {
  return axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/facebook_page_messages/?${params}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const sendFacebookMessage = ({ pid, region = '', ticketId, payload }) => {
  const facebookMessage = new FormData();
  facebookMessage.append('recipientId', payload.recipientId);
  if (payload.messageText) {
    facebookMessage.append('messageText', payload.messageText);
  }

  if (payload.filedata) {
    facebookMessage.append('filedata', payload.filedata);
  }
  return axios.post(`${getDeskURL(region)}/api/tickets/${ticketId}/facebook_create_message/`, facebookMessage, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const fetchFacebookFeeds: FetchFacebookFeedsAPI = (pid, region, { ticketId, params }) => {
  return axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/facebook_page_feeds/?${params}`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const createFacebookFeed = ({ pid, region = '', ticketId, payload }) => {
  const facebookFeed = new FormData();
  if (payload.parentFeedId) {
    facebookFeed.append('parentFeedId', payload.parentFeedId);
  }

  if (payload.messageText) {
    facebookFeed.append('messageText', payload.messageText);
  }

  if (payload.filedata) {
    facebookFeed.append('filedata', payload.filedata);
  }
  return axios.post(`${getDeskURL(region)}/api/tickets/${ticketId}/facebook_create_feed/`, facebookFeed, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const editFacebookFeed = ({
  pid,
  region = '',
  payload,
}: {
  pid: string;
  region: string;
  payload: {
    ticketId: number;
    feedId: string;
    messageText?: string;
    filedata?: any;
    isHidden?: boolean;
  };
}) => {
  const facebookFeed = new FormData();
  facebookFeed.append('ticketId', String(payload.ticketId));
  if (payload.messageText) {
    facebookFeed.append('messageText', payload.messageText);
  }

  if (payload.filedata) {
    facebookFeed.append('filedata', payload.filedata);
  }
  if (typeof payload.isHidden !== 'undefined') {
    facebookFeed.append('isHidden', String(payload.isHidden));
  }
  return axios.patch(`${getDeskURL(region)}/api/facebook_page_feeds/${payload.feedId}/`, facebookFeed, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const deleteFacebookFeed = ({
  pid,
  region = '',
  ticketId,
  feedId,
}: {
  pid: string;
  region: string;
  ticketId: number;
  feedId: string;
}) => {
  return axios.delete(`${getDeskURL(region)}/api/facebook_page_feeds/${feedId}/`, {
    data: {
      ticketId,
    },
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const facebookFeedLike = ({ pid, region = '', ticketId, feedId }) => {
  return axios.post(
    `${getDeskURL(region)}/api/facebook_page_feeds/${feedId}/create_reaction/`,
    {
      ticketId,
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const facebookFeedUnlike = ({ pid, region = '', ticketId, feedId }) => {
  return axios.delete(`${getDeskURL(region)}/api/facebook_page_feeds/${feedId}/delete_reaction`, {
    data: { ticketId },
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};

export const markAsRead = ({ pid, region = '', ticketId }) => {
  return axios.post(
    `${getDeskURL(region)}/api/tickets/${ticketId}/mark_as_read/`,
    {},
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const fetchTwitterDirectMessageEvents: FetchTwitterDirectMessageEventsAPI = (
  pid,
  region = '',
  { ticketId, params },
) => {
  return axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/twitter_direct_message_events/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const createTwitterDirectMessageEvent: CreateTwitterDirectMessageEventAPI = (
  pid,
  region = '',
  { ticketId, recipientId, messageText, mediaId },
) => {
  return axios.post(
    `${getDeskURL(region)}/api/tickets/${ticketId}/twitter_create_direct_message_event/`,
    { recipientId, messageText, mediaId },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const patchTwitterDirectMessageEvent: PatchTwitterDirectMessageEventAPI = (pid, region = '', { id, status }) =>
  axios.patch(
    `${getDeskURL(region)}/api/twitter_direct_message_events/${id}/`,
    { status },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const fetchTwitterStatuses: FetchTwitterStatusesAPI = (pid, region = '', { ticketId, params }) => {
  return axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/twitter_statuses/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
    params,
  });
};

export const createTwitterStatus: CreateTwitterStatusAPI = (
  pid,
  region = '',
  { ticketId, recipientId, messageText, inReplyToStatusId, mediaIds },
) => {
  return axios.post(
    `${getDeskURL(region)}/api/tickets/${ticketId}/twitter_create_status/`,
    {
      recipientId,
      messageText,
      inReplyToStatusId,
      mediaIds: mediaIds && mediaIds.join(','),
    },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );
};

export const patchTwitterStatusStatus: PatchTwitterStatusStatusAPI = (pid, region = '', { id, status }) =>
  axios.patch(
    `${getDeskURL(region)}/api/twitter_statuses/${id}/status/`,
    { status },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const patchTwitterStatusRetweeted: PatchTwitterStatusRetweetedAPI = (pid, region = '', { id, retweeted }) =>
  axios.patch(
    `${getDeskURL(region)}/api/twitter_status_twitter_users/${id}/retweeted/`,
    { retweeted },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const patchTwitterStatusFavorited: PatchTwitterStatusFavoritedAPI = (pid, region = '', { id, favorited }) =>
  axios.patch(
    `${getDeskURL(region)}/api/twitter_status_twitter_users/${id}/favorited/`,
    { favorited },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const fetchInstagramMedia: FetchInstagramMediaAPI = (pid, region = '', { ticketId }) =>
  axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/instagram_media/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const fetchInstagramComments: FetchInstagramCommentsAPI = (pid, region = '', { ticketId, params }) =>
  axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/instagram_comment_tickets/`, {
    params,
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const createInstagramComment: CreateInstagramCommentAPI = (
  pid,
  region = '',
  { ticketId, igMediaId, parentIgCommentId, text },
) =>
  axios.post(
    `${getDeskURL(region)}/api/tickets/${ticketId}/instagram_create_comment/`,
    { igMediaId, parentIgCommentId, text },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const deleteInstagramComment: DeleteInstagramCommentAPI = (pid, region = '', { ticketId, instagramCommentId }) =>
  axios.patch(
    `${getDeskURL(region)}/api/instagram_comments/${instagramCommentId}/delete_comment/`,
    { ticketId },
    {
      headers: {
        Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
        pid,
      },
    },
  );

export const fetchWhatsAppMessages: FetchWhatsAppMessagesAPI = (pid, region, { ticketId, params }) =>
  axios.get(`${getDeskURL(region)}/api/tickets/${ticketId}/nexmo_whatsapp_messages`, {
    params: snakeCaseKeys(params),
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const createWhatsAppMessage: CreateWhatsAppMessageAPI = (
  pid,
  region,
  { ticketId, toNumber, messageText, filedata },
) => {
  const payload = new FormData();
  payload.append('toNumber', toNumber);
  messageText && payload.append('messageText', messageText);
  filedata && payload.append('filedata', filedata);

  return axios.post(`${getDeskURL(region)}/api/tickets/${ticketId}/nexmo_create_whatsapp_message`, payload, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
      ...(filedata ? { 'content-type': 'multipart/form-data' } : {}),
    },
  });
};

export const fetchWhatsAppMedia: FetchWhatsAppMediaAPI = (pid, region, messageId) =>
  axios.get(`${getDeskURL(region)}/api/nexmo_whatsapp_messages/${messageId}/get_media_url/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });

export const fetchAgentTicketCounts: FetchConversationTicketCountsAPI = (pid, region, { agentId }) => {
  return axios.get(`${getDeskURL(region)}/api/agents/${agentId}/ticket_counts/`, {
    headers: {
      Authorization: `Token ${ClientStorage.get('deskApiToken')}`,
      pid,
    },
  });
};
