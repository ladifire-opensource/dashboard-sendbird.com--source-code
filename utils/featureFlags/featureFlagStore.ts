import { ClientStorage } from '@utils';

export const featureFlags = [
  { id: 'intlInspector', title: 'Enable intl inspector' },
  { id: 'deskIntlKo', title: 'Desk Language: Korean' },
  { id: 'deskFAQBot', title: 'Enable Desk FAQ bot' },
  { id: 'mockWoowahan', title: '[Desk] Mock Woowahan Organization' },
  { id: 'ncsoft', title: 'NCSoft' },
  { id: 'roomStatusFilter', title: 'Enable status filter in group calls page' },
  { id: 'rtl', title: 'Allow RTL' },
  { id: 'spotv', title: 'SPOTV' },
] as const;

export type FeatureFlagKey = typeof featureFlags[number]['id'];

const toggleFeatureFlag = (key: FeatureFlagKey, isEnabled: boolean) => {
  if (isEnabled) {
    ClientStorage.upsertObject('featureFlags', { [key]: true });
    return;
  }
  ClientStorage.removeFromObject('featureFlags', [key]);
};

const isFeatureFlagEnabled = (key: FeatureFlagKey) => {
  return ClientStorage.getObject('featureFlags')?.[key] === true;
};

export const FeatureFlagStore = { toggle: toggleFeatureFlag, get: isFeatureFlagEnabled };
