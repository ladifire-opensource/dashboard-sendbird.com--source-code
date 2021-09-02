import { FC } from 'react';
import { useIntl } from 'react-intl';

import { deskActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout';

type Props = {
  closeTicketWithoutConfirmation: boolean;
  isUpdating: boolean;
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const AllowAgentToCloseTicket: FC<Props> = ({
  closeTicketWithoutConfirmation,
  isUpdating,
  updateProjectRequest,
}) => {
  const intl = useIntl();

  return (
    <SettingsToggleGrid
      data-test-id="SettingAllowAgentToCloseTicketToggle"
      title={intl.formatMessage({ id: 'desk.settings.automation.allowAgentToCloseTicket.title' })}
      description={intl.formatMessage({ id: 'desk.settings.automation.allowAgentToCloseTicket.desc' })}
      confirmDialogProps={{
        title: intl.formatMessage({
          id: closeTicketWithoutConfirmation
            ? 'desk.settings.automation.allowAgentToCloseTicket.dialog.title.off'
            : 'desk.settings.automation.allowAgentToCloseTicket.dialog.title.on',
        }),
        description: intl.formatMessage({
          id: closeTicketWithoutConfirmation
            ? 'desk.settings.automation.allowAgentToCloseTicket.dialog.desc.off'
            : 'desk.settings.automation.allowAgentToCloseTicket.dialog.desc.on',
        }),
        confirmText: intl.formatMessage({
          id: closeTicketWithoutConfirmation
            ? 'desk.settings.automation.allowAgentToCloseTicket.dialog.button.off.confirm'
            : 'desk.settings.automation.allowAgentToCloseTicket.dialog.button.on.confirm',
        }),
        cancelText: intl.formatMessage({ id: 'desk.settings.automation.allowAgentToCloseTicket.dialog.button.cancel' }),
        onConfirm: () => updateProjectRequest({ closeTicketWithoutConfirmation: !closeTicketWithoutConfirmation }),
      }}
      checked={closeTicketWithoutConfirmation}
      isFetching={isUpdating}
    />
  );
};
