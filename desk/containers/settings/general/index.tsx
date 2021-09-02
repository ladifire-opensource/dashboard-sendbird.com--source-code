import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import moment from 'moment-timezone';

import { deskActions } from '@actions';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { Unsaved } from '@hooks';

import { WorkHours } from './WorkHours';
import { MarkAsReadtype } from './markAsReadType';
import { ProactiveChatSetting } from './proactiveChat';
import { TicketTransferByAgent } from './ticketTransferByAgent';
import { DeskTimezone } from './timezone';

const getDeskGeneralSettings = (project: Project) => ({
  timezone: project.timezone || moment.tz.guess(),
  transferEnabled: project.transferEnabled,
  markAsReadType: project.markAsReadType,
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

export const GeneralSettingsConnectable: React.FC<Props> = ({ desk, setUnsaved, updateProjectRequest }) => {
  const intl = useIntl();
  const deskSettings = getDeskGeneralSettings(desk.project);
  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.general.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <DeskTimezone
        timezone={deskSettings.timezone}
        isUpdating={desk.isUpdating}
        setUnsaved={setUnsaved}
        updateProjectRequest={updateProjectRequest}
      />
      <WorkHours project={desk.project} isUpdating={desk.isUpdating} setUnsaved={setUnsaved} />
      <TicketTransferByAgent
        transferEnabled={deskSettings.transferEnabled}
        isUpdating={desk.isUpdating}
        updateProjectRequest={updateProjectRequest}
      />
      <MarkAsReadtype
        markAsReadType={deskSettings.markAsReadType}
        isUpdating={desk.isUpdating}
        setUnsaved={setUnsaved}
        updateProjectRequest={updateProjectRequest}
      />
      <ProactiveChatSetting
        proactiveChatEnabled={desk.project.proactiveChatEnabled}
        isUpdating={desk.isUpdating}
        updateProjectRequest={updateProjectRequest}
      />
    </AppSettingsContainer>
  );
};

export const GeneralSettings = connect(mapStateToProps, mapDispatchToProps)(GeneralSettingsConnectable);
