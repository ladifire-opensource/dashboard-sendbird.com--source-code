import { AxiosPromise } from 'axios';

import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';
import { CLOUD_FRONT_URL } from '@constants';
import { fixedEncodeURIComponent } from '@utils';

export const updateProfileURL = ({ appId, profileURL }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/profile_url/`,
    {
      url: profileURL,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const changeAppName: ChangeAppNameAPI = ({ appId, appName }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/change_app_name/`,
    {
      app_name: appName,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const togglePushEnabled = ({ appId, push_enabled }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/applications/detail/`,
    {
      push_enabled,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchPushConfiguration = <T extends PushTypePath>({
  app_id,
  push_type,
}: {
  app_id: string;
  push_type: T;
}) => {
  return axios.get<{
    push_configurations: PushConfiguration<T>[];
  }>(`${getGateURL()}/platform/v3/applications/push/${push_type}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': app_id,
    },
  });
};

export const pushRegisterProvider = <T extends PushTypePath>({
  appId,
  payload,
  pushTypePath,
}: {
  appId: string;
  payload: any;
  pushTypePath: T;
}) => {
  return axios.post<{
    push_configurations: PushConfiguration<T>[];
  }>(`${getGateURL()}/platform/v3/applications/push/${pushTypePath}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updatePushConfiguration = ({
  appId,
  pushConfigurationId,
  pushTypePath,
  payload,
}: {
  appId: string;
  payload: any;
  pushConfigurationId: string;
  pushTypePath: PushTypePath;
}) => {
  return axios.put<{ push_configurations: string }>(
    `${getGateURL()}/platform/v3/applications/push/${pushTypePath}/${pushConfigurationId}`,
    payload,
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const deletePushConfiguration = ({
  appId,
  push_type_path,
  pushConfigurationId,
}: {
  appId: string;
  push_type_path: PushTypePath;
  pushConfigurationId: string;
}) => {
  return axios.delete(`${getGateURL()}/platform/v3/applications/push/${push_type_path}/${pushConfigurationId}`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchPushMessageTemplates = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/push/message_templates`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updatePushMessageTemplates = ({ appId, templateName, payload }) => {
  return axios.post(`${getGateURL()}/platform/v3/applications/push/message_templates/${templateName}`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updatePushSettings: UpdatePushSettingsAPI = ({ appId, update }) => {
  return axios.put(`${getGateURL()}/platform/v3/applications/push/settings`, update, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateFileMessageEvent = ({ appId, file_message_event }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/file_message_event/`,
    {
      file_message_event,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const getWebhooksAllCategories = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/settings/webhook`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
    params: {
      display_all_webhook_categories: true,
    },
  });
};

export const getWebhooksInformation = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/settings/webhook`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateWebhookInformation: UpdateWebhookInformationAPI = ({
  appId,
  enabled,
  enabled_events,
  url,
  include_members,
  include_unread_count,
}) => {
  return axios.put(
    `${getGateURL()}/platform/v3/applications/settings/webhook`,
    { enabled, url, enabled_events, include_members, include_unread_count },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const updateOfflineCallbackURL = ({ appId, callback_url }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/offline_callback_url/`,
    {
      callback_url,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const testOfflineCallbackURL = ({ appId, callback_url }) => {
  return axios.post(
    `${getGateURL()}/platform/dapi/settings/offline_callback_url_test/`,
    {
      callback_url,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const updateMaxLengthMessage = ({ appId, max_length_message }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/max_length_message/`,
    {
      max_length_message,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const updateIgnoreMessageOffset = ({ appId, ignore_message_offset }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/ignore_message_offset/`,
    {
      ignore_message_offset,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const updateAutoEventMessage = ({ appId, auto_event_message }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/auto_event_message/`,
    {
      auto_event_message,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchDefaultProfanity = (): AxiosPromise<{ en: string }> => {
  return axios.get(`${CLOUD_FRONT_URL}/data/profanity_filters.json`);
};

export const updateAccessTokenUserPolicy = ({ appId, guest_user_policy }) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/access_token_user_policy/`,
    {
      guest_user_policy,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const addCredentialsFilter = ({ appId, credentials_key }) => {
  return axios.post(
    `${getGateURL()}/platform/dapi/settings/credentials_filter/`,
    {
      credentials_key,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const removeCredentialsFilter = ({ appId, id }) => {
  return axios.delete(`${getGateURL()}/platform/dapi/settings/credentials_filter/${id}/`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const deleteApplication = ({ appId }) => {
  return axios.delete(`${getGateURL()}/platform/v3/applications`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateModerationInfoADMM = ({ appId, is_moderator_info_in_admin_message }) => {
  return axios.put(
    `${getGateURL()}/dashboard/application/${appId}/`,
    {
      is_moderator_info_in_admin_message,
    },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const fetchSettingsGlobal: FetchSettingsGlobalAPI = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/settings_global`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateSettingsGlobal: UpdateSettingsGlobalAPI = ({ appId, payload }) => {
  return axios.put(`${getGateURL()}/platform/v3/applications/settings_global`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const fetchSettingsForCustomChannelTypes: FetchSettingsForCustomChannelTypesAPI = ({ appId, limit, token }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/settings_by_channel_custom_type`, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
    params: { limit, token },
  });
};

export const fetchSettingsForCustomChannelType: FetchSettingsForCustomChannelTypeAPI = ({ appId, custom_type }) => {
  return axios.get(
    `${getGateURL()}/platform/v3/applications/settings_by_channel_custom_type/${fixedEncodeURIComponent(custom_type)}`,
    {
      headers: { authorization: getSBAuthToken(), 'App-Id': appId },
    },
  );
};

/**
 * https://sendbird.com/docs/chat/v3/platform-api/guides/custom-channel-settings#2-create-settings-for-a-custom-channel-type
 */
export const createSettingsForCustomChannelType: CreateSettingsForCustomChannelTypeAPI = ({ appId, ...payload }) => {
  return axios.post(`${getGateURL()}/platform/v3/applications/settings_by_channel_custom_type`, payload, {
    headers: { authorization: getSBAuthToken(), 'App-Id': appId },
  });
};

/**
 * https://sendbird.com/docs/chat/v3/platform-api/guides/custom-channel-settings#2-update-settings-for-a-custom-channel-type
 */
export const updateSettingsForCustomChannelType: UpdateSettingsForCustomChannelTypeAPI = ({
  appId,
  custom_type,
  ...payload
}) => {
  return axios.put(
    `${getGateURL()}/platform/v3/applications/settings_by_channel_custom_type/${fixedEncodeURIComponent(custom_type)}`,
    payload,
    {
      headers: { authorization: getSBAuthToken(), 'App-Id': appId },
    },
  );
};

export const fetchTranslationSetting = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/translation`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateTranslationSetting = ({ appId, payload }) => {
  return axios.put(`${getGateURL()}/platform/v3/applications/translation`, payload, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const getIPWhitelist: GetIPWhitelistAPI = ({ appId }) => {
  return axios.get(`${getGateURL()}/platform/v3/applications/settings/ip_whitelist`, {
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const putIPWhitelist: PutIPWhitelistAPI = ({ appId, ip_whitelist_addresses }) => {
  return axios.put(
    `${getGateURL()}/platform/v3/applications/settings/ip_whitelist`,
    { ip_whitelist_addresses },
    {
      headers: {
        authorization: getSBAuthToken(),
        'App-Id': appId,
      },
    },
  );
};

export const deleteIPWhitelist: DeleteIPWhitelistAPI = ({ appId, ip_whitelist_addresses }) => {
  return axios.delete(`${getGateURL()}/platform/v3/applications/settings/ip_whitelist`, {
    data: { ip_whitelist_addresses },
    headers: {
      authorization: getSBAuthToken(),
      'App-Id': appId,
    },
  });
};

export const updateOpenChannelDynamicPartitioningOption: UpdateOpenChannelDynamicPartitioningOptionAPI = ({
  appId,
  option_type,
}) => {
  return axios.put(
    `${getGateURL()}/platform/dapi/settings/open_channels_dynamic_partitioning/`,
    { option_type },
    { headers: { authorization: getSBAuthToken(), 'App-Id': appId } },
  );
};
