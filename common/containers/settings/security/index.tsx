import { SettingsHeader } from '../../layout/settingsLayout';
import { LoginIPRestriction } from './LoginIPRestriction';
import { SamlSsoConfig } from './SamlSsoConfig';
import { TwoFactorEnforcement } from './TwoFactorEnforcement';

export const Security = () => (
  <>
    <SettingsHeader title="Access control" />
    <TwoFactorEnforcement />
    <LoginIPRestriction />
    <SamlSsoConfig />
  </>
);
