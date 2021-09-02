import {
  BASIC_SOCIAL_INTEGRATION_ALLOWED_LIST,
  INSTAGRAM_INTEGRATION_ALLOWED_LIST,
  WHATSAPP_INTEGRATION_ALLOWED_LIST,
} from '@constants/uids';

const { nodeEnv } = process.env;

export const isAllowedToUseSocial = (uid: string) =>
  BASIC_SOCIAL_INTEGRATION_ALLOWED_LIST.includes(uid) || nodeEnv === 'development';

export const isAllowedToUseInstagram = (uid: string) =>
  INSTAGRAM_INTEGRATION_ALLOWED_LIST.includes(uid) || nodeEnv === 'development';

export const isAllowedToUseWhatsApp = (uid: string) =>
  WHATSAPP_INTEGRATION_ALLOWED_LIST.includes(uid) || nodeEnv === 'development';
