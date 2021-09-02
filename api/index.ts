import isEmpty from 'lodash/isEmpty';

import * as chatApi from '@chat/api';
import * as commonApi from '@common/api';
import * as coreApi from '@core/api';
import * as deskApi from '@desk/api';

import { getGateURL, getDashboardURL } from './shared';

const SOCIAL_AUTH_URL = `${getGateURL()}/dashboard/auth/social/`;
const getGoogleAuthURL = (state = {}) =>
  `https://accounts.google.com/o/oauth2/auth?redirect_uri=${getDashboardURL()}/auth/google&client_id=45411407729-jjelgac8298ug989b94ltmqp4bhr5jpo.apps.googleusercontent.com&scope=email&response_type=token id_token${
    isEmpty(state) ? '' : `&state=${state}`
  }`;

export { getGoogleAuthURL, SOCIAL_AUTH_URL };

export { chatApi, commonApi, coreApi, deskApi };
export * from './shared';
export * from './tokens';
