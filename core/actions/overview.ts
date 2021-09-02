import { createAction } from '@actions/createAction';
import { OverviewActionTypes } from '@actions/types';

export const OverviewActions = {
  fetchMAURequest: (payload) => createAction(OverviewActionTypes.FETCH_MAU_REQUEST, payload),
  fetchMAUSuccess: (payload) => createAction(OverviewActionTypes.FETCH_MAU_SUCCESS, payload),
  fetchMAUFail: (payload) => createAction(OverviewActionTypes.FETCH_MAU_FAIL, payload),
  fetchDAURequest: (payload) => createAction(OverviewActionTypes.FETCH_DAU_REQUEST, payload),
  fetchDAUSuccess: (payload) => createAction(OverviewActionTypes.FETCH_DAU_SUCCESS, payload),
  fetchDAUFail: (payload) => createAction(OverviewActionTypes.FETCH_DAU_FAIL, payload),
  fetchMessagesCountRequest: (payload) => createAction(OverviewActionTypes.FETCH_MESSAGES_COUNT_REQUEST, payload),
  fetchMessagesCountSuccess: (payload) => createAction(OverviewActionTypes.FETCH_MESSAGES_COUNT_SUCCESS, payload),
  fetchMessagesCountFail: (payload) => createAction(OverviewActionTypes.FETCH_MESSAGES_COUNT_FAIL, payload),
  fetchDailyCCURequest: (payload) => createAction(OverviewActionTypes.FETCH_DAILY_CCU_REQUEST, payload),
  fetchDailyCCUSuccess: (payload) => createAction(OverviewActionTypes.FETCH_DAILY_CCU_SUCCESS, payload),
  fetchDailyCCUFail: (payload) => createAction(OverviewActionTypes.FETCH_DAILY_CCU_FAIL, payload),
  fetchMonthlyCCURequest: (payload) => createAction(OverviewActionTypes.FETCH_MONTHLY_CCU_REQUEST, payload),
  fetchMonthlyCCUSuccess: (payload) => createAction(OverviewActionTypes.FETCH_MONTHLY_CCU_SUCCESS, payload),
  fetchMonthlyCCUFail: (payload) => createAction(OverviewActionTypes.FETCH_MONTHLY_CCU_FAIL, payload),
  fetchHourlyCCURequest: (payload) => createAction(OverviewActionTypes.FETCH_HOURLY_CCU_REQUEST, payload),
  fetchHourlyCCUSuccess: (payload) => createAction(OverviewActionTypes.FETCH_HOURLY_CCU_SUCCESS, payload),
  fetchHourlyCCUFail: (payload) => createAction(OverviewActionTypes.FETCH_HOURLY_CCU_FAIL, payload),
};
