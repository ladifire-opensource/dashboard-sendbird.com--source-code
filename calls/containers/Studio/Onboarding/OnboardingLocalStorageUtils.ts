import { ClientStorage } from '@utils';

const KEY = 'callsStudioOnboardingFinishedApps';

const getFinishedApps = () => {
  const data = ClientStorage.get(KEY);
  try {
    if (!data) return {};

    const parsed = JSON.parse(data);

    return typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
};

const isFinished = (appId: string) => !!getFinishedApps()[appId];

const appendFinished = (appId: string) => {
  const prev = getFinishedApps();
  ClientStorage.set(KEY, JSON.stringify({ ...prev, [appId]: true }));
};

export const OnboardingLocalStorageUtils = { isFinished, appendFinished };
