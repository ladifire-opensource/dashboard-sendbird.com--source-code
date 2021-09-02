import { memo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { deskActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout';
import { TicketStatus } from '@constants';
import { TicketStatusLozenge } from '@ui/components';

const InlineTicketStatusLozenge = styled(TicketStatusLozenge)`
  display: inline;
`;

const useFormattedMessage = (ticketTransferToMaxedOutAgentEnabled: Project['ticketTransferToMaxedOutAgentEnabled']) => {
  const intl = useIntl();
  const formattedMessage = {
    title: intl.formatMessage({ id: 'desk.settings.automation.manualAssignTransfer.title' }),
    description: intl.formatMessage({ id: 'desk.settings.automation.manualAssignTransfer.description' }),
  };

  if (ticketTransferToMaxedOutAgentEnabled) {
    return {
      ...formattedMessage,
      confirmDialog: {
        title: intl.formatMessage({ id: 'desk.settings.automation.manualAssignTransfer.dialog.on2off.title' }),
        description: intl.formatMessage(
          { id: 'desk.settings.automation.manualAssignTransfer.dialog.desc.on2off' },
          { active: <InlineTicketStatusLozenge ticketStatus={TicketStatus.ACTIVE} /> },
        ),
        confirmText: intl.formatMessage({
          id: 'desk.settings.automation.manualAssignTransfer.dialog.on2off.button.confirm',
        }),
      },
    };
  }
  return {
    ...formattedMessage,
    confirmDialog: {
      title: intl.formatMessage({ id: 'desk.settings.automation.manualAssignTransfer.dialog.off2on.title' }),
      description: intl.formatMessage(
        { id: 'desk.settings.automation.manualAssignTransfer.dialog.desc.off2on' },
        { active: <InlineTicketStatusLozenge ticketStatus={TicketStatus.ACTIVE} /> },
      ),
      confirmText: intl.formatMessage({
        id: 'desk.settings.automation.manualAssignTransfer.dialog.off2on.button.confirm',
      }),
    },
  };
};

type Props = {
  ticketTransferToMaxedOutAgentEnabled: Project['ticketTransferToMaxedOutAgentEnabled'];
  isUpdating: DeskStoreState['isUpdating'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const ManualAssignTransfer = memo<Props>(
  ({ ticketTransferToMaxedOutAgentEnabled, isUpdating, updateProjectRequest }) => {
    const { title, description, confirmDialog } = useFormattedMessage(ticketTransferToMaxedOutAgentEnabled);
    return (
      <SettingsToggleGrid
        title={title}
        titleColumns={6}
        description={description}
        confirmDialogProps={{
          title: confirmDialog.title,
          description: confirmDialog.description,
          confirmText: confirmDialog.confirmText,
          onConfirm: () =>
            updateProjectRequest({
              ticketTransferToMaxedOutAgentEnabled: !ticketTransferToMaxedOutAgentEnabled,
            }),
        }}
        checked={ticketTransferToMaxedOutAgentEnabled}
        isFetching={isUpdating}
      />
    );
  },
);
