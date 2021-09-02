import { logException } from '@utils/logException';

import { importAll } from '../importAll';

const getMigrationHistory = (storage: ClientStorage) => {
  try {
    return storage.getObject('migration');
  } catch (error) {
    logException(error);
    return null;
  }
};

const addMigrationHistory = (storage: ClientStorage, key: string) => {
  try {
    storage.upsertObject('migration', { [key]: true });
  } catch (error) {
    logException(error);
  }
};

const migrationKeyMatchesPattern = (key: string) =>
  key.match(/^\d{4}-\d{2}-\d{2}-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i);

export const runMigrations = (storage: ClientStorage) => {
  const migrationHistory = getMigrationHistory(storage);
  Object.entries(
    importAll<ClientStorageMigrationModule>(
      require.context('./migrations', false, /\d{4}-\d{2}-\d{2}-\w{8}-\w{4}-\w{4}-\w{4}-\w{12}\.ts$/),
    ),
  )
    .map<[string, ClientStorageMigration]>(([key, { default: runMigration }]) => [
      key.replace(/\.ts$/i, ''),
      runMigration,
    ])
    .filter(([key]) => migrationKeyMatchesPattern(key) && !migrationHistory?.[key])
    .sort(([key1], [key2]) => key1.localeCompare(key2))
    .forEach(([key, runMigration]) => {
      try {
        runMigration(storage);
        addMigrationHistory(storage, key);
      } catch (error) {
        logException(error);
      }
    });
};
