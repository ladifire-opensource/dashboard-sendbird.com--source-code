import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

// create
export const createAnnouncement: CreateAnnouncementAPI = ({ appId, payload }) => {
  return axios.post(`${getGateURL()}/platform/v3/announcements`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

// fetch
export const fetchAnnouncement: FetchAnnouncementAPI = ({ appId, eventId }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcements/${eventId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchAnnouncements: FetchAnnouncementsAPI = ({ appId, listToken, limit, status }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcements`, {
    params: { token: listToken, limit, status },
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchAnnouncementGroups: FetchAnnouncementGroupsAPI = ({ appId, limit, token }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcement_group`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
    params: { limit, token },
  });
};

export const fetchAnnouncementOpenRate: FetchAnnouncementOpenRateAPI = ({ appId, eventId }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcement_open_rate/${eventId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchAnnouncementOpenRateByGruop = ({ appId, group }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcement_open_rate_by_group/${group}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchAnnouncementStat = ({ appId, stats }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcement_stats/${stats}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

// delete
export const deleteAnnouncement = ({ appId, eventId }) => {
  return axios.delete(`${getGateURL()}/platform/v3/announcements/${eventId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateAnnouncement: UpdateAnnouncementAPI = ({ appId, id, payload }) => {
  return axios.put(`${getGateURL()}/platform/v3/announcements/${id}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

// cancel - LEGACY
export const cancelAnnouncement_LEGACY: UpdateAnnouncementAPI_LEGACY = ({ appId, eventId }) => {
  return axios.put(
    `${getGateURL()}/platform/v3/announcements/${eventId}/cancel`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

// abort - LEGACY
export const abortAnnouncement_LEGACY: UpdateAnnouncementAPI_LEGACY = ({ appId, eventId }) => {
  return axios.put(
    `${getGateURL()}/platform/v3/announcements/${eventId}/abort`,
    {},
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const getAnnouncementOpenStatus: GetAnnouncementOpenStatusAPI = ({ appId, eventId, limit, token }) => {
  return axios.get(`${getGateURL()}/platform/v3/announcement_open_status/${eventId}`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
    params: { limit, token },
  });
};
