/**
 * Rename all local storage keys to follow camelCase.
 */

const keyMap = [
  ['iframe_sidebar_state', 'iframeSidebarState'],
  ['sb_htmlKeyStore', 'sbHtmlKeyStore'],
  ['sendbird_preserved_moderation_message', 'sendbirdPreservedModerationMessage'],
  ['sendbird_token', 'sendbirdToken'],
];

const run: ClientStorageMigration = ({ set }) => {
  keyMap.forEach(([oldKey, newKey]) => {
    const value = localStorage.getItem(oldKey);
    if (value) {
      set(newKey as ClientStorageKey, value);
      localStorage.removeItem(oldKey);
    }
  });
};

export default run;
