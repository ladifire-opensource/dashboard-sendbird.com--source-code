import React from 'react';
import { useIntl } from 'react-intl';

import { deskActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout';

type Props = {
  proactiveChatEnabled: Project['proactiveChatEnabled'];
  isUpdating: DeskStoreState['isUpdating'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const ProactiveChatSetting: React.FC<Props> = ({ proactiveChatEnabled, isUpdating, updateProjectRequest }) => {
  const intl = useIntl();

  return (
    <SettingsToggleGrid
      title={intl.formatMessage({ id: 'desk.settings.proactiveChat.title' })}
      description={intl.formatMessage({ id: 'desk.settings.proactiveChat.desc' })}
      checked={proactiveChatEnabled}
      confirmDialogProps={{
        title: proactiveChatEnabled
          ? intl.formatMessage({ id: 'desk.settings.proactiveChat.dialog.title.on2off' })
          : intl.formatMessage({ id: 'desk.settings.proactiveChat.dialog.title.off2on' }),
        description: proactiveChatEnabled
          ? intl.formatMessage({ id: 'desk.settings.proactiveChat.dialog.desc.on2off' })
          : intl.formatMessage({ id: 'desk.settings.proactiveChat.dialog.desc.off2on' }),
        confirmText: proactiveChatEnabled
          ? intl.formatMessage({ id: 'desk.settings.proactiveChat.dialog.on2off' })
          : intl.formatMessage({ id: 'desk.settings.proactiveChat.dialog.off2on' }),
        onConfirm: () => updateProjectRequest({ proactiveChatEnabled: !proactiveChatEnabled }),
      }}
      isFetching={isUpdating}
    />
  );
};
