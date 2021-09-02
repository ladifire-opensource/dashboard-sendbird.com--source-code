import { axios, getGateURL, getSBAuthToken } from '@api';

import { Participant, Room, RoomState, RoomType, UserSummary } from './types';

export const getDirectCalls: GetDirectCallsAPI = (appId, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/v2oip/direct_calls`, {
    params,
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const getDirectCall: GetDirectCallAPI = (appId, { call_id }) => {
  return axios.get(`${getGateURL()}/dashboard_api/v2oip/direct_calls/${call_id}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchCallStats = (appId: string, call_id: string) => {
  return axios.get<CallStat[]>(`${getGateURL()}/dashboard_api/v2oip/direct_calls/${call_id}/stats`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

export const fetchUserSummary = (appId: string, userId: string) => {
  return axios.get<UserSummary>(
    `${getGateURL()}/dashboard_api/v2oip/users/${encodeURIComponent(userId)}/call_summary`,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const fetchRooms = (
  appId: string,
  params?: {
    next?: string;
    prev?: string;
    limit?: number;
    type?: RoomType;
    state?: RoomState;
    created_at_start_date?: number;
    created_at_end_date?: number;
    current_participant_range_gte?: number;
    room_ids?: string; // comma-separated string
    created_by_user_ids?: string; // comma-separated string
  },
) => {
  return axios.get<{ rooms: Room[]; next: string | null; prev: string | null }>(
    `${getGateURL()}/dashboard_api/v2oip/rooms`,
    { params, headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const fetchRoom = (appId: string, roomId: string) => {
  return axios.get<{ room: Room }>(`${getGateURL()}/dashboard_api/v2oip/rooms/${roomId}`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

export const createRoom = (appId: string, payload: { type: RoomType }) => {
  return axios.post<{ room: Room }>(`${getGateURL()}/dashboard_api/v2oip/rooms`, payload, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

export const fetchParticipants = (
  appId: string,
  roomId: string,
  params?: { next?: string; prev?: string; limit?: number },
) => {
  return axios.get<{ participants: Participant[]; next: string | null; prev: string | null }>(
    `${getGateURL()}/dashboard_api/v2oip/rooms/${roomId}/participants`,
    { params, headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export type WebhookSetting = {
  enabled_events: WebhookEvent[];
  url: string;
  enabled: boolean;
};

export const fetchWebhookSetting = (appId: string, params?: { display_all_webhook_categories?: boolean }) => {
  return axios.get<{ webhook: WebhookSetting & { all_webhook_categories: WebhookEvent[] } }>(
    `${getGateURL()}/dashboard_api/v2oip/applications/${appId}/settings/webhook`,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId }, params },
  );
};

export const updateWebhookSetting = (appId: string, payload: Partial<WebhookSetting>) => {
  return axios.put<{ webhook: WebhookSetting }>(
    `${getGateURL()}/dashboard_api/v2oip/applications/${appId}/settings/webhook`,
    payload,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const fetchRelayMethod = (appId: string) => {
  return axios.get<{ general: { relay_method: RelayMethod } }>(
    `${getGateURL()}/dashboard_api/v2oip/applications/${appId}/settings/general`,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const updateRelayMethod = (appId: string, payload: { relay_method: RelayMethod }) => {
  return axios.put<{ general: { relay_method: RelayMethod } }>(
    `${getGateURL()}/dashboard_api/v2oip/applications/${appId}/settings/general`,
    payload,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const createFreeVoucher = (appId: string) => {
  return axios.post<Voucher>(
    `${getGateURL()}/dashboard_api/billing/vouchers/start_free_trial`,
    {},
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export type ChatIntegrationEvent = 'direct_call:dial' | 'direct_call:end';

export type ChatIntegrationSetting = {
  enabled: boolean;
  enabled_events: ChatIntegrationEvent[];
  all_chat_integration_categories: ChatIntegrationEvent[];
};

export const fetchChatIntegration = (
  appId: string,
  params: { display_all_chat_integration_categories: boolean } = { display_all_chat_integration_categories: true },
) => {
  return axios.get<{ chat_integration: ChatIntegrationSetting }>(
    `${getGateURL()}/dashboard_api/v2oip/applications/${appId}/settings/chat_integration`,
    { params, headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const updateChatIntegration = (
  appId: string,
  payload: { enabled: boolean; enabled_events: ChatIntegrationEvent[] },
) => {
  return axios.put<{ chat_integration: ChatIntegrationSetting }>(
    `${getGateURL()}/dashboard_api/v2oip/applications/${appId}/settings/chat_integration`,
    payload,
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const fetchDailyUsage = (appId: string, params: { start: string; end: string }) => {
  return axios.get<{ daily_usage: Record<string, Record<CallType, number>> }>(
    `${getGateURL()}/dashboard_api/v2oip/usage/daily`,
    { params, headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};

export const fetchMonthlyUsage = (appId: string, params: { date_start: string; date_end: string }) => {
  return axios.get<{ monthly_usage: Record<string, Record<CallType, number>> }>(
    `${getGateURL()}/dashboard_api/v2oip/usage/monthly`,
    { params, headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};
