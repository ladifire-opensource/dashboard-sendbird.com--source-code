import { ClientStorage } from '@utils';

let SENDBIRD_TOKEN: string = '';

/**
 * @returns SENDBIRD_TOKEN
 */
export const getSBAuthToken = () => {
  if (SENDBIRD_TOKEN === '') {
    SENDBIRD_TOKEN = ClientStorage.get('sendbirdToken') as string;
  }

  return SENDBIRD_TOKEN;
};

export const setSBAuthToken = (token: string) => {
  SENDBIRD_TOKEN = token;
  ClientStorage.set('sendbirdToken', token);
};

export const clearSBAuthToken = () => {
  ClientStorage.remove('sendbirdToken');
  SENDBIRD_TOKEN = '';
};

let DESK_API_TOKEN: string = '';

export const getDeskAPIToken = () => {
  if (DESK_API_TOKEN === '') {
    DESK_API_TOKEN = ClientStorage.get('deskApiToken') as string;
  }

  return DESK_API_TOKEN;
};

export const setDeskAPIToken = (token) => {
  DESK_API_TOKEN = token;
  ClientStorage.set('deskApiToken', token);
};

const clearDeskAPIToken = () => {
  ClientStorage.remove('deskApiToken');
  DESK_API_TOKEN = '';
};

export const initSession = (token: string) => {
  setSBAuthToken(token);
};

export const clearSession = () => {
  clearSBAuthToken();
  clearDeskAPIToken();
};
