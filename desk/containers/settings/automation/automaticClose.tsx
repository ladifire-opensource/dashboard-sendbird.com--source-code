import { memo } from 'react';
import { useIntl } from 'react-intl';

import { deskActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout';

type Props = {
  automaticCloseAfterInquireEnabled: Project['automaticCloseAfterInquireEnabled'];
  isUpdating: DeskStoreState['isUpdating'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const AutomaticClosed = memo<Props>(
  ({ automaticCloseAfterInquireEnabled, isUpdating, updateProjectRequest }) => {
    const intl = useIntl();
    return (
      <SettingsToggleGrid
        data-test-id="SettingCustomerConfirmToggle"
        title={intl.formatMessage({ id: 'desk.settings.automation.customerConfirm.title' })}
        description={intl.formatMessage({ id: 'desk.settings.automation.customerConfirm.description' })}
        titleColumns={6}
        confirmDialogProps={{
          title: intl.formatMessage({
            id: automaticCloseAfterInquireEnabled
              ? 'desk.settings.automation.customerConfirm.dialog.on2off.title'
              : 'desk.settings.automation.customerConfirm.dialog.off2on.title',
          }),
          description: intl.formatMessage({
            id: automaticCloseAfterInquireEnabled
              ? 'desk.settings.automation.customerConfirm.dialog.desc.on2off'
              : 'desk.settings.automation.customerConfirm.dialog.desc.off2on',
          }),
          confirmText: intl.formatMessage({
            id: automaticCloseAfterInquireEnabled
              ? 'desk.settings.automation.customerConfirm.dialog.on2off.button.confirm'
              : 'desk.settings.automation.customerConfirm.dialog.off2on.button.confirm',
          }),
          onConfirm: () =>
            updateProjectRequest({
              automaticCloseAfterInquireEnabled: !automaticCloseAfterInquireEnabled,
            }),
        }}
        checked={automaticCloseAfterInquireEnabled}
        isFetching={isUpdating}
      />
    );
  },
);
