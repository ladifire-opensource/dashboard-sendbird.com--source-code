import { IFRAME_INTEGRATION_ALLOWED_LIST } from '@constants/uids';

const { nodeEnv } = process.env;

export const isAllowedToUseIframe = (uid: string) =>
  IFRAME_INTEGRATION_ALLOWED_LIST.includes(uid) || nodeEnv === 'development';
