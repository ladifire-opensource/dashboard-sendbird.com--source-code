import React from 'react';
import { useIntl } from 'react-intl';

import { deskActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout';

type Props = {
  transferEnabled: Project['transferEnabled'];
  isUpdating: DeskStoreState['isUpdating'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const TicketTransferByAgent: React.FC<Props> = React.memo(
  ({ transferEnabled, isUpdating, updateProjectRequest }) => {
    const intl = useIntl();

    return (
      <SettingsToggleGrid
        title={intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.title' })}
        description={intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.desc' })}
        checked={transferEnabled}
        confirmDialogProps={{
          title: transferEnabled
            ? intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.dialog.prevent.title' })
            : intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.dialog.allow.title' }),
          description: transferEnabled
            ? intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.dialog.desc.prevent' })
            : intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.dialog.desc.allow' }),
          confirmText: transferEnabled
            ? intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.dialog.turnOff' })
            : intl.formatMessage({ id: 'desk.settings.general.ticketTransferByAgent.dialog.turnOn' }),
          onConfirm: () => updateProjectRequest({ transferEnabled: !transferEnabled }),
        }}
        isFetching={isUpdating}
      />
    );
  },
);
