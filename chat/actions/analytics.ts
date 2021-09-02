import { createAction } from '@actions/createAction';
import { AnalyticsActionTypes } from '@actions/types';

export const AnalyticsActions = {
  exportAnalyticsRequest: (payload) => createAction(AnalyticsActionTypes.EXPORT_ANALYTICS_REQUEST, payload),
  exportAnalyticsSuccess: (payload) => createAction(AnalyticsActionTypes.EXPORT_ANALYTICS_SUCCESS, payload),
  exportAnalyticsFail: (payload) => createAction(AnalyticsActionTypes.EXPORT_ANALYTICS_FAIL, payload),
};
