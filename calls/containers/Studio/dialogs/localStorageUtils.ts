import { ClientStorage } from '@utils';

const LOCAL_STORAGE_KEY = 'callsStudioMobileAppUsers';

export enum LocalStorageUpdateAction {
  Add,
  Delete,
}

export const readLocalStorage = (): Record<string, string[]> => {
  const rawData = ClientStorage.get(LOCAL_STORAGE_KEY) ?? '{}';
  try {
    return JSON.parse(rawData);
  } catch (error) {
    // failed to parse stored JSON
    return {};
  }
};

export const loadUserIdsFromLocalStorage = (appId: string, localStorageData?: ReturnType<typeof readLocalStorage>) => {
  const data = localStorageData ?? readLocalStorage();
  return data[appId] ?? [];
};

const sanitizeStringArray = (value: string[]) => (Array.isArray(value) ? value.map(String) : []);

export const updateLocalStorage = async (action: LocalStorageUpdateAction, appId: string, userId: string) => {
  if (!appId || !userId) {
    return;
  }

  const currentData = readLocalStorage();
  const currentUserList = sanitizeStringArray(loadUserIdsFromLocalStorage(appId, currentData));

  switch (action) {
    case LocalStorageUpdateAction.Add: {
      const newData = { ...currentData, [appId]: [...currentUserList, userId] };
      ClientStorage.set(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      return;
    }

    case LocalStorageUpdateAction.Delete: {
      const newData = { ...currentData, [appId]: currentUserList.filter((v) => v !== userId) };
      ClientStorage.set(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      return;
    }

    default:
      return;
  }
};
