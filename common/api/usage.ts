import { axios, getGateURL } from '@api/shared';
import { getSBAuthToken } from '@api/tokens';

export const fetchUsageAlertEmail: FetchUsageAlertEmail = (uid) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/usage_alert_email/`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const updateUsageAlertEmail: UpdateUsageAlertEmail = (uid, payload) => {
  return axios.put(`${getGateURL()}/dashboard_api/organizations/${uid}/usage_alert_email/`, payload, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchOrganizationDailyUsage: FetchOrganizationDailyUsage = (uid, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/daily_usage/?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchOrganizationDailyAccumulateUsage: FetchOrganizationDailyAccumulateUsage = (uid, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/daily_acc_usage/?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchOrganizationMonthlyUsage: FetchOrganizationMonthlyUsage = (uid, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/monthly_usage/?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

/**
 * Not used currently but we could use this someday
 */
export const fetchApplicationDailyUsage: FetchApplicationDailyUsage = (app_id, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/applications/${app_id}/daily_usage/?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchApplicationMonthlyUsage: FetchApplicationMonthlyUsage = (app_id, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/applications/${app_id}/monthly_usage/?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchMonthlyUsageByApplications: FetchMonthlyUsageByApplications = (uid, params) => {
  return axios.get(`${getGateURL()}/dashboard_api/organizations/${uid}/monthly_feature_usage_detail/?${params}`, {
    headers: {
      authorization: getSBAuthToken(),
    },
  });
};

export const fetchApplicationMonthlyUsageWithOrgUsages: FetchApplicationMonthlyUsageWithOrgUsages = (
  app_id,
  params,
) => {
  return axios.get(`${getGateURL()}/dashboard_api/applications/${app_id}/monthly_usage_with_org_usages/`, {
    headers: { authorization: getSBAuthToken() },
    params,
  });
};
