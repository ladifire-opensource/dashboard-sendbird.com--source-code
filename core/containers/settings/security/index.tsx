import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { coreActions } from '@actions';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { Unsaved, useAuthorization } from '@hooks';
import { selectApplication_DEPRECATED } from '@selectors';

import { IPWhitelist } from './IPWhitelist';
import { AccessTokenPermission } from './accessTokenPermission';
import { AllowedDomains } from './allowedDomains';

const mapStateToProps = (state: RootState) => ({
  application: selectApplication_DEPRECATED(state),
  settings: state.settings,
});

const mapDispatchToProps = {
  updateAccessTokenUserPolicyRequest: coreActions.updateAccessTokenUserPolicyRequest,
  addCredentialsFilterRequest: coreActions.addCredentialsFilterRequest,
  removeCredentialsFilterRequest: coreActions.removeCredentialsFilterRequest,
};

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
} & ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

const SecuritySettingsConnectable: React.FC<Props> = ({
  application,
  settings,
  setUnsaved,
  updateAccessTokenUserPolicyRequest,
  addCredentialsFilterRequest,
  removeCredentialsFilterRequest,
}) => {
  const { isFetchingAccessTokenUserPolicy, isAddingCredentialsFilter } = settings;

  const intl = useIntl();
  const { isPermitted } = useAuthorization();
  const isEditable = isPermitted(['application.settings.all']);

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'core.settings.application.tab.security' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <SettingsGridGroup>
        <AccessTokenPermission
          application={application}
          setUnsaved={setUnsaved}
          isEditable={isEditable}
          isFetchingAccessTokenUserPolicy={isFetchingAccessTokenUserPolicy}
          updateAccessTokenUserPolicyRequest={updateAccessTokenUserPolicyRequest}
        />
        <AllowedDomains
          application={application}
          isAddingCredentialsFilter={isAddingCredentialsFilter}
          isEditable={isEditable}
          addCredentialsFilterRequest={addCredentialsFilterRequest}
          removeCredentialsFilterRequest={removeCredentialsFilterRequest}
        />
        <IPWhitelist isEditable={isEditable} />
      </SettingsGridGroup>
    </AppSettingsContainer>
  );
};

export const SecuritySettings = connect(mapStateToProps, mapDispatchToProps)(SecuritySettingsConnectable);
