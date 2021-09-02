/**
 * Replace dynamic local storage keys with a single key storing a JSON for Call logs > Custom items.
 */

const legacyKeySuffix = '/calls/selectedCustomItemKey';

const run: ClientStorageMigration = ({ upsertObject }) => {
  const keys: string[] = [];

  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key) {
      keys.push(key);
    }
  }

  keys.forEach((key) => {
    if (key.endsWith(legacyKeySuffix)) {
      const appId = key.replace(legacyKeySuffix, '');
      upsertObject('callsSelectedCustomItemKey', { [appId]: localStorage.getItem(key) });
      localStorage.removeItem(key);
    }
  });
};

export default run;
