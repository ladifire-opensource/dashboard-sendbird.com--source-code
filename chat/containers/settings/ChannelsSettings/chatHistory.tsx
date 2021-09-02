import React from 'react';
import { useIntl } from 'react-intl';

import { SettingsToggleGrid } from '@common/containers/layout/settingsGrid/settingsToggleGrid';

type Props = {
  application: Application;
  isFetchingIgnoreMessageOffset: SettingsState['isFetchingIgnoreMessageOffset'];
  isEditable: boolean;
  updateIgnoreMessageOffsetRequest: (value: boolean) => void;
};

export const ChatHistory: React.FC<Props> = React.memo(
  ({ application, isFetchingIgnoreMessageOffset, isEditable, updateIgnoreMessageOffsetRequest }) => {
    const intl = useIntl();
    const { ignore_message_offset } = application;
    return (
      <SettingsToggleGrid
        title={intl.formatMessage({ id: 'core.settings.application.message.chatHistory.title' })}
        description={intl.formatMessage({ id: 'core.settings.application.message.chatHistory.desc' })}
        checked={ignore_message_offset}
        isFetching={isFetchingIgnoreMessageOffset}
        confirmDialogProps={{
          title: intl.formatMessage(
            { id: 'core.settings.application.message.chatHistory.dialog.title' },
            { nextToggle: ignore_message_offset ? 'Hide' : 'Show' },
          ),
          description: intl.formatMessage({
            id: ignore_message_offset
              ? 'core.settings.application.message.chatHistory.dialog.desc_on2off'
              : 'core.settings.application.message.chatHistory.dialog.desc_off2on',
          }),
          confirmText: intl.formatMessage({ id: 'core.settings.application.message.chatHistory.dialog.button' }),
          onConfirm: () => updateIgnoreMessageOffsetRequest(!ignore_message_offset),
        }}
        isToggleDisabled={!isEditable}
      />
    );
  },
);
