import { createAction } from '@actions/createAction';

import { WebhooksActionTypes } from './types';

export const WebhooksActions: WebhooksActionCreators = {
  /** Fetch webhooks */
  fetchWebhooksRequest: () => createAction(WebhooksActionTypes.FETCH_WEBHOOKS_REQUEST),
  fetchWebhooksSuccess: (response) => createAction(WebhooksActionTypes.FETCH_WEBHOOKS_SUCCESS, response),
  fetchWebhooksFail: (error) => createAction(WebhooksActionTypes.FETCH_WEBHOOKS_FAIL, error),

  /** Add webhook */
  addWebhookRequest: (payload) => createAction(WebhooksActionTypes.ADD_WEBHOOK_REQUEST, payload),
  addWebhookSuccess: (response) => createAction(WebhooksActionTypes.ADD_WEBHOOK_SUCCESS, response),
  addWebhookFail: (error) => createAction(WebhooksActionTypes.ADD_WEBHOOK_FAIL, error),

  /** Edit webhook (also delete webhook) */
  editWebhookRequest: (payload) => createAction(WebhooksActionTypes.EDIT_WEBHOOK_REQUEST, payload),
  editWebhookSuccess: () => createAction(WebhooksActionTypes.EDIT_WEBHOOK_SUCCESS),
  editWebhookFail: (error) => createAction(WebhooksActionTypes.EDIT_WEBHOOK_FAIL, error),

  /** Search webhook */
  searchWebhookRequest: (payload) => createAction(WebhooksActionTypes.SEARCH_WEBHOOK_REQUEST, payload),
  serachWebhookSuccess: (response) => createAction(WebhooksActionTypes.SEARCH_WEBHOOK_SUCCESS, response),
  searchWebhookFail: (error) => createAction(WebhooksActionTypes.SEARCH_WEBHOOK_FAIL, error),

  /** Get signature */
  getSignatureRequest: (payload) => createAction(WebhooksActionTypes.GET_SIGNATURE_REQUEST, payload),
  getSignatureSuccess: (resposne) => createAction(WebhooksActionTypes.GET_SIGNATURE_SUCCESS, resposne),
  getSignatureFail: (error) => createAction(WebhooksActionTypes.GET_SIGNATURE_FAIL, error),
};
