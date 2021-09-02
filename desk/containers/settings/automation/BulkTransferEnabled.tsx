import { memo } from 'react';
import { useIntl } from 'react-intl';

import { deskActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout';

type Props = {
  bulkTransferEnabled: Project['bulkTransferEnabled'];
  isUpdating: DeskStoreState['isUpdating'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const BulkTransferEnabled = memo<Props>(({ bulkTransferEnabled, isUpdating, updateProjectRequest }) => {
  const intl = useIntl();

  return (
    <SettingsToggleGrid
      data-test-id="SettingBulkTransferEnabledToggle"
      title={intl.formatMessage({ id: 'desk.settings.automation.bulkTransferEnabled.title' })}
      titleColumns={6}
      description={intl.formatMessage(
        { id: 'desk.settings.automation.bulkTransferEnabled.description' },
        { b: (text) => <b css="font-weight: 600;">{text}</b> },
      )}
      confirmDialogProps={{
        title: intl.formatMessage({
          id: bulkTransferEnabled
            ? 'desk.settings.automation.bulkTransferEnabled.dialog.on2off.title'
            : 'desk.settings.automation.bulkTransferEnabled.dialog.off2on.title',
        }),
        description: intl.formatMessage({
          id: bulkTransferEnabled
            ? 'desk.settings.automation.bulkTransferEnabled.dialog.desc.on2off'
            : 'desk.settings.automation.bulkTransferEnabled.dialog.desc.off2on',
        }),
        confirmText: intl.formatMessage({
          id: bulkTransferEnabled
            ? 'desk.settings.automation.bulkTransferEnabled.dialog.on2off.button.confirm'
            : 'desk.settings.automation.bulkTransferEnabled.dialog.off2on.button.confirm',
        }),
        onConfirm: () =>
          updateProjectRequest({
            bulkTransferEnabled: !bulkTransferEnabled,
          }),
      }}
      checked={bulkTransferEnabled}
      isFetching={isUpdating}
    />
  );
});
