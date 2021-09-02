import { FC } from 'react';

import { Toggle } from 'feather';

import { useFeatureFlags } from '@hooks';
import { featureFlags, FeatureFlagKey } from '@utils/featureFlags';

import { SettingsHeader, SettingsGridCard, SettingsGridGroup } from '../../layout';
import { Brancher } from './brancher';

const { BUILD_MODE } = process.env;

export const FeatureFlagToggle: FC<{
  id: FeatureFlagKey;
  title: string;
  checked: boolean;
  onClick: (value: boolean) => void;
}> = ({ id, title, checked, onClick }) => {
  return (
    <SettingsGridCard title={title}>
      <Toggle name={id} checked={checked} onClick={onClick} data-test-id="toggle" />
    </SettingsGridCard>
  );
};

export const FeatureFlags = () => {
  const { flags, toggle } = useFeatureFlags();

  return (
    <>
      <SettingsHeader title="Feature flags" />
      {BUILD_MODE === 'staging' && (
        <SettingsGridCard title="Brancher" description="Select the branch you want to use.">
          <Brancher />
        </SettingsGridCard>
      )}
      <SettingsGridGroup>
        {featureFlags.map(({ id, title }) => (
          <FeatureFlagToggle
            key={id}
            id={id}
            checked={!!flags[id]}
            title={title}
            onClick={(value) => toggle(id, value)}
          />
        ))}
      </SettingsGridGroup>
    </>
  );
};
