import { FC, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';

import { Button } from 'feather';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsCardGroup, SettingsGridCard } from '@common/containers/layout';
import { useOrganization, useShowDialog } from '@hooks';
import { useAuthorization } from '@hooks';

import SamlSsoConfigForm from './SamlSsoConfigForm';

export const SamlSsoConfig: FC = () => {
  const intl = useIntl();
  const showDialog = useShowDialog();
  const organization = useOrganization();
  const { isPermitted } = useAuthorization();
  const isPermissionDenied = useMemo(() => !isPermitted(['organization.security.all']), [isPermitted]);

  const { uid } = organization;

  const {
    slug_name,
    sso_entity_id,
    sso_idp_cert,
    sso_idp_url,
    sso_enforcing,
    sso_jit_provisioning,
    sso_default_role,
  } = organization;

  const currentConfiguration: SSOConfigurationFormValues = useMemo(() => {
    return {
      slug_name: slug_name || '',
      sso_entity_id: sso_entity_id || '',
      sso_idp_cert: sso_idp_cert || '',
      sso_idp_url: sso_idp_url || '',
      sso_enforcing: !!sso_enforcing,
      sso_jit_provisioning: !!sso_jit_provisioning,
      sso_default_role: sso_default_role || '',
    };
  }, [slug_name, sso_entity_id, sso_idp_cert, sso_idp_url, sso_enforcing, sso_jit_provisioning, sso_default_role]);

  const isEditMode = [sso_entity_id, sso_idp_cert, sso_idp_url].some((value) => !!value && value.trim().length > 0);

  const onAddConfigureButtonClick = useCallback(() => {
    showDialog({
      dialogTypes: DialogType.SSOConfig,
      dialogProps: {
        uid,
        currentConfiguration,
        isEditMode: false,
      },
    });
  }, [currentConfiguration, showDialog, uid]);

  const renderAddConfigureButton = useCallback(
    () => (
      <Button buttonType="tertiary" onClick={onAddConfigureButtonClick} disabled={isPermissionDenied}>
        {intl.formatMessage({ id: 'common.settings.security.samlsso.button.addConfigure' })}
      </Button>
    ),
    [intl, isPermissionDenied, onAddConfigureButtonClick],
  );

  return (
    <SettingsCardGroup>
      <SettingsGridCard
        title={intl.formatMessage({ id: 'common.settings.security.samlsso.title' })}
        description={intl.formatMessage({ id: 'common.settings.security.samlsso.description' })}
        gridItemConfig={{
          subject: { alignSelf: 'start' },
        }}
      >
        {isEditMode ? (
          <SamlSsoConfigForm currentConfiguration={currentConfiguration} uid={uid} />
        ) : (
          renderAddConfigureButton()
        )}
      </SettingsGridCard>
    </SettingsCardGroup>
  );
};
