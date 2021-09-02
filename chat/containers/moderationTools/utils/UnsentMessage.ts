import { ClientStorage } from '@utils/ClientStorage';

const clientStorageKey = 'sendbirdPreservedModerationMessage';

/**
 * If dashboard fails to send a message, save the message in local storage to restore the message
 * in the chat input when the user revisits the moderation tool.
 */
const UnsentMessage = {
  clientStorageKey,
  get: () => ClientStorage.get(clientStorageKey) || '',
  set: (value: string) => ClientStorage.set(clientStorageKey, value),
  clear: () => ClientStorage.remove(clientStorageKey),
};

export default UnsentMessage;
