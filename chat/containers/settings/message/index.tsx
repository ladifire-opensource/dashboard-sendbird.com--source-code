import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { commonActions, coreActions } from '@actions';
import { AppSettingPageHeader, AppSettingsContainer } from '@common/containers/layout/appSettingsLayout';
import { SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { Unsaved, useAuthorization, useIsCallsAllowedRegion } from '@hooks';
import { selectApplication_DEPRECATED } from '@selectors';

import { CallsIntegration } from './CallsIntegration';
import { DomainFilter } from './DomainFilter';
import { CharacterLimit } from './characterLimit';
import { ModerationInfoADMM } from './moderationInfoADMM';

const mapStateToProps = (state: RootState) => ({
  application: selectApplication_DEPRECATED(state),
  settings: state.settings,
});

const mapDispatchToProps = {
  showDialogsRequest: commonActions.showDialogsRequest,
  updateMaxLengthMessageRequest: coreActions.updateMaxLengthMessageRequest,
  fetchModeratorInfoADMMRequest: coreActions.fetchModeratorInfoADMMRequest,
  updateModeratorInfoADMMRequest: coreActions.updateModeratorInfoADMMRequest,
};

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
} & ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

export const MessageSettingsConnectable: React.FC<Props> = React.memo(
  ({
    application,
    settings,
    setUnsaved,
    showDialogsRequest,
    updateMaxLengthMessageRequest,
    fetchModeratorInfoADMMRequest,
    updateModeratorInfoADMMRequest,
  }) => {
    const intl = useIntl();
    const isCallsAllowedRegion = useIsCallsAllowedRegion();
    const { isPermitted, isFeatureEnabled, isSelfService } = useAuthorization();
    const isEditable = isPermitted(['application.settings.all']);

    const renderDomainFilter = isSelfService ? isFeatureEnabled('domain_filter') : true;

    return (
      <AppSettingsContainer>
        <AppSettingPageHeader>
          <AppSettingPageHeader.Title>
            {intl.formatMessage({ id: 'chat.settings.messages.title' })}
          </AppSettingPageHeader.Title>
          <AppSettingPageHeader.Description>
            {intl.formatMessage({ id: 'chat.settings.messages.description' })}
          </AppSettingPageHeader.Description>
        </AppSettingPageHeader>
        <SettingsGridGroup>
          <CharacterLimit
            application={application}
            isFetchingMaxLengthMessage={settings.isFetchingMaxLengthMessage}
            isEditable={isEditable}
            setUnsaved={setUnsaved}
            updateMaxLengthMessageRequest={updateMaxLengthMessageRequest}
          />
        </SettingsGridGroup>
        {renderDomainFilter && (
          <DomainFilter isEditable={isEditable} setUnsaved={setUnsaved} showDialogsRequest={showDialogsRequest} />
        )}
        <ModerationInfoADMM
          settings={settings}
          isEditable={isEditable}
          fetchModeratorInfoADMMRequest={fetchModeratorInfoADMMRequest}
          updateModeratorInfoADMMRequest={updateModeratorInfoADMMRequest}
        />
        {isCallsAllowedRegion && <CallsIntegration />}
      </AppSettingsContainer>
    );
  },
);

export const MessageSettings = connect(mapStateToProps, mapDispatchToProps)(MessageSettingsConnectable);
