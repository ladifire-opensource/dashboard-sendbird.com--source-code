import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { deskActions } from '@actions';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { Unsaved } from '@hooks';

import { AllowAgentToCloseTicket } from './AllowAgentToCloseTicket';
import { BulkTransferEnabled } from './BulkTransferEnabled';
import { Satisfaction } from './Satisfaction';
import { ActiveToIdle } from './activeToIdle';
import { AutomaticClosed } from './automaticClose';
import { IdleToClosed } from './idleToClosed';
import { LiveTicketLimit } from './liveTicketLimit';
import { ManualAssignTransfer } from './manualAssignTransfer';
import { WipToPending } from './wipToPending';

const mapStateToProps = (state: RootState) => ({
  desk: state.desk,
});

const mapDispatchToProps = {
  updateProjectRequest: deskActions.updateProjectRequest,
};

export interface SettingsSelectItem {
  node?: React.ReactNode;
  label: string;
  value: string | number;
}

type Props = {
  setUnsaved: Unsaved['setUnsaved'];
} & ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps;

const AutomationConnectable: React.FC<Props> = ({ desk, updateProjectRequest, setUnsaved }) => {
  const intl = useIntl();
  const { isUpdating } = desk;
  const {
    liveTicketLimit,
    ticketTransferToMaxedOutAgentEnabled,
    bulkTransferEnabled,
    automaticCloseAfterInquireEnabled,
    activeToIdleEnabled,
    activeToIdleDuration,
    isAutomaticCloseIdleEnabled,
    idleToCloseDuration,
    idleTicketAutomaticCloseMessage,
    automaticWipToPendingEnabled,
    wipToPendingDuration,
    closeTicketWithoutConfirmation,
    autoRoutingLimits,
    enableTierBasedRouting,
  } = desk.project;

  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.automation.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <SettingsGridGroup>
        <LiveTicketLimit
          liveTicketLimit={liveTicketLimit}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
          autoRoutingLimits={autoRoutingLimits}
          enableTierBasedRouting={enableTierBasedRouting}
        />
        <ManualAssignTransfer
          ticketTransferToMaxedOutAgentEnabled={ticketTransferToMaxedOutAgentEnabled}
          isUpdating={isUpdating}
          updateProjectRequest={updateProjectRequest}
        />
        <BulkTransferEnabled
          bulkTransferEnabled={bulkTransferEnabled}
          isUpdating={isUpdating}
          updateProjectRequest={updateProjectRequest}
        />
        <AllowAgentToCloseTicket
          closeTicketWithoutConfirmation={closeTicketWithoutConfirmation}
          isUpdating={isUpdating}
          updateProjectRequest={updateProjectRequest}
        />
        <AutomaticClosed
          automaticCloseAfterInquireEnabled={automaticCloseAfterInquireEnabled}
          isUpdating={isUpdating}
          updateProjectRequest={updateProjectRequest}
        />
        <Satisfaction desk={desk} setUnsaved={setUnsaved} updateProjectRequest={updateProjectRequest} />
      </SettingsGridGroup>
      <SettingsGridGroup>
        <ActiveToIdle
          activeToIdleEnabled={activeToIdleEnabled}
          activeToIdleDuration={activeToIdleDuration}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
        <IdleToClosed
          isAutomaticCloseIdleEnabled={isAutomaticCloseIdleEnabled}
          idleToCloseDuration={idleToCloseDuration}
          idleTicketAutomaticCloseMessage={idleTicketAutomaticCloseMessage}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
        <WipToPending
          automaticWipToPendingEnabled={automaticWipToPendingEnabled}
          wipToPendingDuration={wipToPendingDuration}
          isUpdating={isUpdating}
          setUnsaved={setUnsaved}
          updateProjectRequest={updateProjectRequest}
        />
      </SettingsGridGroup>
    </AppSettingsContainer>
  );
};

export const Automation = connect(mapStateToProps, mapDispatchToProps)(AutomationConnectable);
