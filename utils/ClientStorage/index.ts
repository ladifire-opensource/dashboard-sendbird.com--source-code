import { runMigrations } from './runMigrations';

class ClientStorage implements ClientStorage {
  constructor() {
    runMigrations(this);
  }

  public get = (key: ClientStorageKey) => {
    return localStorage.getItem(key);
  };

  public set = (key: ClientStorageKey, value: string) => {
    localStorage.setItem(key, value);
  };

  public getObject = (key: ClientStorageKey): Object | null => {
    const data = this.get(key);
    return data ? JSON.parse(data) : null;
  };

  public setObject = (key: ClientStorageKey, value: Object) => {
    this.set(key, JSON.stringify(value));
  };

  public upsertObject = (key: ClientStorageKey, updates: Object) => {
    this.setObject(key, { ...this.getObject(key), ...updates });
  };

  public removeFromObject = (key: ClientStorageKey, keys: string[]) => {
    const data = this.getObject(key);
    if (data == null) {
      return;
    }

    keys.forEach((key) => {
      delete data[key];
    });
    this.setObject(key, data);
  };

  public remove = (key: ClientStorageKey) => {
    localStorage.removeItem(key);
  };
}

const staticClientStorage = new ClientStorage();

export { staticClientStorage as ClientStorage, ClientStorage as _ClientStorage };
