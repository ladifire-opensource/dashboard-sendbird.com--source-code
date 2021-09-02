import { toast } from 'feather';
import { ofType } from 'redux-observable';
import { of, from } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions, coreActions } from '@actions';
import { SettingsActionTypes } from '@actions/types';
import { coreApi } from '@api';
import { PushConfigurationRegisterMode } from '@constants';
import { generateBadRequest, getErrorMessage } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { logException } from '@utils/logException';
import {
  ALERT_SETTINGS_PUSH_ENABLED,
  ALERT_SETTINGS_PUSH_DISABLED,
  ALERT_SETTINGS_PUSH_NOTIFICATION_TEMPLATES,
  ALERT_SETTINGS_FILE_MESSAGE_EVENT,
  ALERT_SETTINGS_WEBHOOKS,
  ALERT_SETTINGS_MAX_LENGTH_OF_MESSAGE,
  ALERT_SETTINGS_DISPLAY_PAST_MESSAGE_ON,
  ALERT_SETTINGS_DISPLAY_PAST_MESSAGE_OFF,
  ALERT_SETTINGS_AUTO_EVENT_MESSAGE,
  ALERT_SETTINGS_ACCESS_TOKEN_POLICY,
  ALERT_SETTINGS_CREDENTIAL_FILTER_ADDED,
  ALERT_SETTINGS_CREDENTIAL_FILTER_DELETED,
  ALERT_SETTINGS_APPLICATION_DELETED,
  ALERT_SETTINGS_APNS_CERT_ERROR,
  ALERT_SETTINGS_APNS,
  ALERT_SETTINGS_FCM,
  ALERT_SETTINGS_PUSH_CONFIGURATION_DELETED,
} from '@utils/text';

export const togglePushEnabledEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.TOGGLE_PUSH_ENABLED_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const push_enabled = action.payload;
      const application = selectApplication_DEPRECATED(state);

      const request = coreApi.togglePushEnabled({
        appId: application.app_id,
        push_enabled,
      });
      return from(request).pipe(
        map((response) => response.data.application),
        mergeMap((newApp) => {
          toast.success({ message: push_enabled ? ALERT_SETTINGS_PUSH_ENABLED : ALERT_SETTINGS_PUSH_DISABLED });
          return from([
            coreActions.togglePushEnabledSuccess(),
            coreActions.setApplicationRequest({
              ...application,
              push_enabled: newApp.push_enabled,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.togglePushEnabledFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.togglePushEnabledFail(error));
    }),
  );
};

export const fetchPushMessageTemplatesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.FETCH_PUSH_MESSAGE_TEMPLATES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const request = coreApi.fetchPushMessageTemplates({
        appId: application.app_id,
      });
      return from(request).pipe(
        map((response) => response.data.push_message_templates),
        mergeMap((response) => {
          return from([coreActions.fetchPushMessageTemplatesSuccess(response)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchPushMessageTemplatesFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.fetchPushMessageTemplatesFail(error));
    }),
  );
};

export const updatePushMessageTemplatesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_PUSH_MESSAGE_TEMPLATES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { onSuccess, templateName, payload } = action.payload;

      const request = coreApi.updatePushMessageTemplates({
        appId: application.app_id,
        templateName,
        payload,
      });
      return from(request).pipe(
        map((response) => response.data.push_message_templates),
        mergeMap((push_message_templates) => {
          const newApp = { ...application };
          push_message_templates.forEach(({ template_name, template }) => {
            newApp.attrs = {
              ...newApp.attrs,
              push_message_templates: {
                ...newApp.attrs.push_message_templates,
                [template_name]: template,
              },
            };
          });
          toast.success({ message: ALERT_SETTINGS_PUSH_NOTIFICATION_TEMPLATES });
          onSuccess?.();
          return from([coreActions.updatePushMessageTemplatesSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updatePushMessageTemplatesFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updatePushMessageTemplatesFail(error));
    }),
  );
};

export const updateFileMessageEventEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_FILE_MESSAGE_EVENT_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const request = coreApi.updateFileMessageEvent({
        appId: application.app_id,
        file_message_event: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          const newApp = {
            ...application,
            file_message_event: response.file_message_event,
          };
          toast.success({ message: ALERT_SETTINGS_FILE_MESSAGE_EVENT });
          return from([coreActions.updateFileMessageEventSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateFileMessageEventFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateFileMessageEventFail(error));
    }),
  );
};

export const getWebhooksAllCategoriesEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.GET_WEBHOOKS_ALL_CATEGORIES_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { app_id } = selectApplication_DEPRECATED(state);
      const request = coreApi.getWebhooksAllCategories({ appId: app_id });

      return from(request).pipe(
        map((response) => {
          // All regions will has `webhook` as a top object key
          if (Object.prototype.hasOwnProperty.call(response.data, 'webhook')) {
            return response.data.webhook.all_webhook_categories;
          }
          return response.data.all_webhook_categories;
        }),
        mergeMap((allCategories) => {
          return from([coreActions.getWebhookAllCategoriesSuccess(allCategories)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.getWebhookAllCategoriesFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.getWebhookAllCategoriesFail(error));
    }),
  );
};

export const getWebhooksInformationEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.GET_WEBHOOKS_INFORMATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const request = coreApi.getWebhooksInformation({ appId: application.app_id });

      return from(request).pipe(
        map((response) => response.data.webhook),
        mergeMap((webhook) => {
          return from([coreActions.getWebhooksInformationSuccess(webhook)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.getWebhooksInformationFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.getWebhooksInformationFail(error));
    }),
  );
};

export const updateWebhookInformationEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_WEBHOOK_INFORMATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { onSuccess, enabled, enabled_events, url, include_members, include_unread_count } = action.payload;

      const request = coreApi.updateWebhookInformation({
        appId: application.app_id,
        enabled,
        enabled_events,
        url,
        include_members,
        include_unread_count,
      });
      return from(request).pipe(
        map((response) => response.data.webhook),
        mergeMap((webhook) => {
          const newApp = Object.assign({}, application, {
            attrs: {
              ...application.attrs,
              webhook,
            },
          });
          toast.success({ message: ALERT_SETTINGS_WEBHOOKS });
          onSuccess && onSuccess();
          return from([
            coreActions.updateWebhookInformationSuccess(webhook),
            coreActions.setApplicationRequest(newApp),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateWebhookInformationFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateWebhookInformationFail(error));
    }),
  );
};

export const updateMaxMessageLengthEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_MAX_LENGTH_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { max_length_message, onSuccess } = action.payload;

      const request = coreApi.updateMaxLengthMessage({
        appId: application.app_id,
        max_length_message,
      });
      return from(request).pipe(
        map((response) => response.data.max_length_message),
        mergeMap((max_length_message) => {
          const newApp = Object.assign({}, application, {
            max_length_message,
          });
          toast.success({ message: ALERT_SETTINGS_MAX_LENGTH_OF_MESSAGE });
          onSuccess && onSuccess();
          return from([coreActions.updateMaxLengthMessageSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateMaxLengthMessageFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateMaxLengthMessageFail(error));
    }),
  );
};

export const updateIgnoreMessageOffsetEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_IGNORE_MESSAGE_OFFSET_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const request = coreApi.updateIgnoreMessageOffset({
        appId: application.app_id,
        ignore_message_offset: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data.ignore_message_offset),
        mergeMap((ignore_message_offset) => {
          const newApp = Object.assign({}, application, {
            ignore_message_offset,
          });
          ignore_message_offset
            ? toast.success({ message: ALERT_SETTINGS_DISPLAY_PAST_MESSAGE_ON })
            : toast.success({ message: ALERT_SETTINGS_DISPLAY_PAST_MESSAGE_OFF });
          return from([coreActions.updateIgnoreMessageOffsetSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateIgnoreMessageOffsetFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateIgnoreMessageOffsetFail(error));
    }),
  );
};

export const updateAutoEventMessageEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_AUTO_EVENT_MESSAGE_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { auto_event_message, onSuccess } = action.payload;

      const request = coreApi.updateAutoEventMessage({
        appId: application.app_id,
        auto_event_message,
      });
      return from(request).pipe(
        map((response) => response.data.auto_event_message),
        mergeMap((auto_event_message) => {
          const newApp = Object.assign({}, application, {
            attrs: {
              ...application.attrs,
              auto_event_message,
            },
          });
          toast.success({ message: ALERT_SETTINGS_AUTO_EVENT_MESSAGE });
          onSuccess && onSuccess();
          return from([coreActions.updateAutoEventMessageSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateAutoEventMessageFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateAutoEventMessageFail(error));
    }),
  );
};

export const updateAccessTokenUserPolicyEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_ACCESS_TOKEN_USER_POLICY_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { guest_user_policy, onSuccess } = action.payload;

      const request = coreApi.updateAccessTokenUserPolicy({
        appId: application.app_id,
        guest_user_policy,
      });
      return from(request).pipe(
        map((response) => response.data.guest_user_policy),
        mergeMap((guest_user_policy: string) => {
          const newApp = {
            ...application,
            guest_user_policy: parseInt(guest_user_policy),
          };
          toast.success({ message: ALERT_SETTINGS_ACCESS_TOKEN_POLICY });
          onSuccess && onSuccess();
          return from([coreActions.updateAccessTokenUserPolicySuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateAccessTokenUserPolicyFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateAccessTokenUserPolicyFail(error));
    }),
  );
};

export const addCredentialsFilterEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.ADD_CREDENTIALS_FILTER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { allowedDomain, onSuccess } = action.payload;

      const request = coreApi.addCredentialsFilter({
        appId: application.app_id,
        credentials_key: allowedDomain,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          const newApp = {
            ...application,
            credentials_list: application.credentials_list.concat([response]),
          };
          toast.success({ message: ALERT_SETTINGS_CREDENTIAL_FILTER_ADDED });
          onSuccess && onSuccess();
          return from([coreActions.addCredentialsFilterSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.addCredentialsFilterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.addCredentialsFilterFail(error));
    }),
  );
};

export const removeCredentialsFilterEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.REMOVE_CREDENTIALS_FILTER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const request = coreApi.removeCredentialsFilter({
        appId: application.app_id,
        id: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((response) => {
          const newApp = {
            ...application,
            credentials_list: application.credentials_list.filter((credential) => {
              return credential.id !== response.id;
            }),
          };
          toast.success({ message: ALERT_SETTINGS_CREDENTIAL_FILTER_DELETED });
          return from([coreActions.removeCredentialsFilterSuccess(), coreActions.setApplicationRequest(newApp)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.removeCredentialsFilterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.removeCredentialsFilterFail(error));
    }),
  );
};

export const deleteAppEpic: SBEpic<DeleteApplicationRequestAction> = (action$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.DELETE_APPLICATION_REQUEST),
    mergeMap((action) => {
      const { appId, onSuccess } = action.payload;

      const request = coreApi.deleteApplication({ appId });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          toast.success({ message: ALERT_SETTINGS_APPLICATION_DELETED });
          onSuccess?.(appId);
          return from([
            coreActions.deleteApplicationSuccess({ appId }),
            commonActions.hideDialogsRequest(),
            coreActions.resetApplicationRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.deleteApplicationFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.deleteApplicationFail(error));
    }),
  );
};

export const pushAPNSRegisterEpic: SBEpicWithState<PushAPNSRegisterRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.PUSH_APNS_REGISTER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const { mode, pushConfigurationId, data, pushTypePath, onSuccess, onFailure } = action.payload;

      const {
        apnsEnvType,
        apnsFile,
        hasUnreadCountBadge,
        mutableContent,
        contentAvailable,
        pushSound,
        apnsCertPassword,
      } = data;

      const payload = new FormData();
      payload.append('apns_cert_env_type', apnsEnvType);
      if (apnsFile) {
        payload.append('apns_cert', apnsFile[0]);
        if (apnsCertPassword) {
          payload.append('apns_cert_password', apnsCertPassword);
        }
      }

      if (typeof hasUnreadCountBadge === 'boolean') {
        payload.append('has_unread_count_badge', String(hasUnreadCountBadge));
      }
      if (typeof mutableContent === 'boolean') {
        payload.append('mutable_content', String(mutableContent));
      }
      if (typeof contentAvailable === 'boolean') {
        payload.append('content_available', String(contentAvailable));
      }

      if (typeof pushSound === 'string' && !!pushSound) {
        payload.append('push_sound', pushSound);
      }

      const request =
        mode === PushConfigurationRegisterMode.Add || !pushConfigurationId
          ? coreApi.pushRegisterProvider({
              appId: application.app_id,
              pushTypePath,
              payload,
            })
          : coreApi.updatePushConfiguration({
              appId: application.app_id,
              pushConfigurationId,
              pushTypePath,
              payload,
            });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap(() => {
          onSuccess();
          toast.success({ message: ALERT_SETTINGS_APNS });
          return from([coreActions.pushAPNSRegisterSuccess({}), commonActions.hideDialogsRequest()]);
        }),
        catchError((error) => {
          if (error?.status === 400) {
            if (error.data.code === 400111) {
              onFailure('Invalid APNS certificate.');
            } else if (error.data.code === 400108) {
              onFailure('APNS certificate password is not valid.');
            } else {
              onFailure(ALERT_SETTINGS_APNS_CERT_ERROR);
            }
          } else {
            onFailure(getErrorMessage(error));
          }
          return from([coreActions.pushAPNSRegisterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.pushAPNSRegisterFail(error));
    }),
  );
};

export const pushFCMRegisterEpic: SBEpicWithState<PushFCMRegisterRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.PUSH_FCM_REGISTER_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);
      const { mode, pushConfigurationId, data, pushTypePath, onSuccess, onFailure } = action.payload;
      const { apiKey, senderId, pushSound } = data;

      const request =
        mode === PushConfigurationRegisterMode.Add || !pushConfigurationId
          ? coreApi.pushRegisterProvider({
              appId: application.app_id,
              payload: {
                api_key: apiKey,
                push_sound: pushSound,
              },
              pushTypePath,
            })
          : coreApi.updatePushConfiguration({
              appId: application.app_id,
              payload: {
                api_key: apiKey,
                gcm_sender_id: senderId,
                push_sound: pushSound,
              },
              pushConfigurationId,
              pushTypePath,
            });
      return from(request).pipe(
        mergeMap(() => {
          onSuccess();
          toast.success({ message: ALERT_SETTINGS_FCM });
          return from([coreActions.pushFCMRegisterSuccess({}), commonActions.hideDialogsRequest()]);
        }),
        catchError((error) => {
          onFailure(getErrorMessage(error));
          return from([coreActions.pushFCMRegisterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.pushFCMRegisterFail(error));
    }),
  );
};

export const deletePushConfigurationEpic: SBEpicWithState<DeletePushConfigurationRequestAction> = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.DELETE_PUSH_CONFIGURATION_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const { push_type, ...payload } = action.payload;
      const request = coreApi.deletePushConfiguration({
        appId: application.app_id,
        push_type_path: push_type.toLowerCase() as PushTypePath,
        ...payload,
      });
      return from(request).pipe(
        mergeMap(() => {
          action.payload.onSuccess?.();
          toast.success({ message: ALERT_SETTINGS_PUSH_CONFIGURATION_DELETED });
          return from([coreActions.pushFCMRegisterSuccess({}), commonActions.hideDialogsRequest()]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.pushFCMRegisterFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.pushFCMRegisterFail(error));
    }),
  );
};

export const fetchModeratorInfoADMMEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.FETCH_MODERATOR_INFO_ADMM_REQUEST),
    withLatestFrom(state$),
    mergeMap(([, state]) => {
      const { app_id } = selectApplication_DEPRECATED(state);
      const request = coreApi.getApplicationSummary({ app_id });
      return from(request).pipe(
        map((response) => response.data.is_moderator_info_in_admin_message),
        mergeMap((response) => {
          return from([coreActions.fetchModeratorInfoADMMSuccess(response)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.fetchModeratorInfoADMMFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.fetchModeratorInfoADMMFail(error));
    }),
  );
};

export const updateModeratorInfoADMMEpic: SBEpicWithState = (action$, state$) => {
  return action$.pipe(
    ofType(SettingsActionTypes.UPDATE_MODERATOR_INFO_ADMM_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;
      const request = coreApi.updateModerationInfoADMM({
        appId,
        is_moderator_info_in_admin_message: action.payload,
      });
      return from(request).pipe(
        map((response) => response.data.is_moderator_info_in_admin_message),
        mergeMap((response) => {
          toast.success({ message: 'Moderation information in Admin Message has been changed' });
          return from([coreActions.updateModeratorInfoADMMSuccess(response)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), coreActions.updateModeratorInfoADMMFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(coreActions.updateModeratorInfoADMMFail(error));
    }),
  );
};
