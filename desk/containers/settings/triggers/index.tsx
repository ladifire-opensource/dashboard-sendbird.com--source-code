import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { deskActions } from '@actions';
import { SettingsGridGroup } from '@common/containers/layout';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { Unsaved } from '@hooks';

import { AwayMessage } from './awayMessage';
import { DefaultCloseMessage } from './defaultCloseMessage';
import { DelayMessage } from './delayMessage';
import { InqueryMessage } from './inqueryMessage';
import { WelcomeMessage } from './welcomeMessage';

const getDeskTriggersSettings = (project: Project) => ({
  welcomeMessage: project.welcomeMessage || '',
  awayMessage: project.awayMessage || '',
  delayMessage: project.delayMessage || '',
  delayMessageTime: project.delayMessageTime || 0,
  // downtimeMessageEnabled: project.downtimeMessageEnabled || false,
  // downtimeMessage: project.downtimeMessage || '',
  inquireCloseMessage: project.inquireCloseMessage || '',
  inquireCloseConfirmedMessage: project.inquireCloseConfirmedMessage || '',
  inquireCloseDeclinedMessage: project.inquireCloseDeclinedMessage || '',
  closeMessage: project.closeMessage || '',
  idleTicketAutomaticCloseMessage: project.idleTicketAutomaticCloseMessage || '',
});

const mapStateToProps = (state: RootState) => ({
  desk: state.desk,
  organization: state.organizations.current,
});

const mapDispatchToProps = {
  updateProjectRequest: deskActions.updateProjectRequest,
};

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
} & ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

export const TriggersSettingsConnectable: React.FC<Props> = ({ desk, setUnsaved, updateProjectRequest }) => {
  const intl = useIntl();
  const { isUpdating } = desk;
  const deskSettings = getDeskTriggersSettings(desk.project);
  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.triggers.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <SettingsGridGroup>
        <WelcomeMessage
          welcomeMessage={deskSettings.welcomeMessage}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
        <AwayMessage
          awayMessage={deskSettings.awayMessage}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
        <DelayMessage
          delayMessage={deskSettings.delayMessage}
          delayMessageTime={deskSettings.delayMessageTime}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
        <DefaultCloseMessage
          closeMessage={deskSettings.closeMessage}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
      </SettingsGridGroup>
      <InqueryMessage
        inquireCloseMessage={deskSettings.inquireCloseMessage}
        inquireCloseConfirmedMessage={deskSettings.inquireCloseConfirmedMessage}
        inquireCloseDeclinedMessage={deskSettings.inquireCloseDeclinedMessage}
        isUpdating={isUpdating}
        setUnsaved={setUnsaved}
        updateProjectRequest={updateProjectRequest}
      />
    </AppSettingsContainer>
  );
};

export const TriggersSettings = connect(mapStateToProps, mapDispatchToProps)(TriggersSettingsConnectable);
