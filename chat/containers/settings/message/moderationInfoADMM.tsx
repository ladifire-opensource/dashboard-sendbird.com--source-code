import React, { useEffect, useState, useCallback } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import styled from 'styled-components';

import { CodeSnippet, Language, CodeSnippetTheme } from 'feather';

import { coreActions } from '@actions';
import { SettingsToggleGrid } from '@common/containers/layout/settingsGrid/settingsToggleGrid';

type Props = {
  settings: SettingsState;
  isEditable: boolean;

  fetchModeratorInfoADMMRequest: typeof coreActions.fetchModeratorInfoADMMRequest;
  updateModeratorInfoADMMRequest: typeof coreActions.updateModeratorInfoADMMRequest;
};

const codeString = `{
  "user": {
    "nickname": "Sendbird User",
    "user_id": "sendbird-sdk-user-id",
    "profile_url": "https://cdn.sendbird.com/example/profile-sample.svg",
  }
}
`;

const CodeContainer = styled.div`
  pre {
    font-size: 13px;
  }
`;

export const ModerationInfoADMM: React.FC<Props> = React.memo(
  ({ settings, isEditable, fetchModeratorInfoADMMRequest, updateModeratorInfoADMMRequest }) => {
    const intl = useIntl();
    const { isModeratorInfoInAdminMessage, isFetchingModeratorInfoADMM } = settings;

    const [theme, setTheme] = useState<CodeSnippetTheme>(CodeSnippetTheme.Light);
    const handleChangeTheme = useCallback((currentTheme: CodeSnippetTheme, nextTheme: CodeSnippetTheme) => {
      setTheme(nextTheme);
    }, []);

    useEffect(() => {
      fetchModeratorInfoADMMRequest();
    }, [fetchModeratorInfoADMMRequest]);

    return (
      <SettingsToggleGrid
        title={intl.formatMessage({ id: 'core.settings.application.message.moderatorInfo.title' })}
        titleColumns={10}
        description={
          <FormattedMessage
            id="core.settings.application.message.moderatorInfo.desc"
            values={{ adminMessage: <b>Admin Message</b>, data: <b>data</b>, user: <b>user</b> }}
          />
        }
        isToggleDisabled={!isEditable}
        checked={isModeratorInfoInAdminMessage}
        gap={['0', '32px']}
        isFetching={isFetchingModeratorInfoADMM}
        confirmDialogProps={{
          title: intl.formatMessage(
            { id: 'core.settings.application.message.moderatorInfo.dialog.title' },
            { nextToggle: isModeratorInfoInAdminMessage ? 'off' : 'on' },
          ),
          description: intl.formatMessage({
            id: isModeratorInfoInAdminMessage
              ? 'core.settings.application.message.moderatorInfo.dialog.desc_on2off'
              : 'core.settings.application.message.moderatorInfo.dialog.desc_off2on',
          }),
          confirmText: intl.formatMessage({ id: 'label.ok' }),
          onConfirm: () => updateModeratorInfoADMMRequest(!isModeratorInfoInAdminMessage),
        }}
        gridItemConfig={{ body: { justifySelf: 'end' } }}
        extra={
          <CodeContainer>
            <CodeSnippet
              data={[{ language: Language.Json, code: codeString }]}
              hasLineNumber={true}
              theme={theme}
              onChangeTheme={handleChangeTheme}
            />
          </CodeContainer>
        }
      />
    );
  },
);
