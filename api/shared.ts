import { cancellableAxios } from './cancellableAxios';

export const getDeskURL = (region: string, BUILD_MODE: string = process.env.BUILD_MODE || '') => {
  switch (BUILD_MODE) {
    case 'pen':
      return 'https://desk-test.sendbird.com';
    case 'staging':
      return 'https://desk-staging.sendbird.com';
    case 'production':
      return `https://desk-api-${region}.sendbird.com`;
    default:
      return 'http://localhost:8000';
  }
};

export const getDashboardURL = (BUILD_MODE: string = process.env.BUILD_MODE || '') => {
  switch (BUILD_MODE) {
    case 'pen':
      return 'https://dashboard-test.sendbird.com';
    case 'staging':
      return 'https://dashboard-st.sendbird.com';
    case 'production':
      return 'https://dashboard.sendbird.com';
    default:
      return 'http://localhost:8888';
  }
};

export const getDashboardAPIUrl = (
  NODE_ENV: string = process.env.NODE_ENV || '',
  BUILD_MODE: string = process.env.BUILD_MODE || '',
) => {
  switch (BUILD_MODE) {
    case 'pen':
      return 'https://dashboard-test.sendbird.com';
    case 'staging':
      return NODE_ENV === 'development' ? 'http://localhost:9100' : 'https://dashboard-st.sendbird.com';
    case 'production':
      return 'https://dashboard.sendbird.com';
    default:
      return 'http://localhost:9100';
  }
};

/**
 * Returns Gate `protocol://hostname:port` based on process.env.BUILD_MODE
 *
 * Gate endpoint URLs **end with a trailing slash** except when they are prepended with `/platform/v3` or `/dashboard_api/v2oip`
 * so that they are consistent with https://sendbird.com/docs
 *
 * e.g.
 *
 * ```
 * ${getGateURL()}/dashboard_api/billing/vouchers/start_free_trial/ (O)
 * ${getGateURL()}/dashboard_api/billing/vouchers/start_free_trial (X)
 * ```
 *
 * Exception:
 * ```
 * ${getGateURL()}/platform/v3/users/my_user_id (O)
 * ${getGateURL()}/platform/v3/users/my_user_id/ (X)
 *
 * ${getGateURL()}/dashboard_api/v2oip/direct_calls (O)
 * ${getGateURL()}/dashboard_api/v2oip/direct_calls/ (X)
 * ```
 */
export const getGateURL = (env: { [key: string]: string | undefined } = process.env) => env.GATE_URL;

export const axios = cancellableAxios;
