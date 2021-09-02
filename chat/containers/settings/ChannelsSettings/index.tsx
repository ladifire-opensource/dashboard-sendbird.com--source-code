import { useCallback, FC, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { Subtitles, cssVariables } from 'feather';

import { coreActions } from '@actions';
import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout/appSettingsLayout';
import { SettingsGridGroup } from '@common/containers/layout/settingsGrid';
import { useAuthorization, useShallowEqualSelector, useDispatchAction } from '@hooks';
import { UnsavedPrompt } from '@ui/components';

import { DynamicPartitioningOptions } from './DynamicPartitioningOptions';
import { AutoMessage } from './autoMessage';
import { ChatHistory } from './chatHistory';
import { useCurrentDynamicPartitioningOption, useAvailableDynamicPartitioningOptions } from './hooks';

type UnsavedInfo = { dynamicPartitioning: boolean; autoMessage: boolean };

const SectionTitle = styled.h3`
  color: ${cssVariables('neutral-7')};
  margin-bottom: 12px;
  ${Subtitles['subtitle-02']};

  ${SettingsGridGroup} + & {
    margin-top: 32px;
  }
`;

const buildUpdaterOnlyIfChanged = (currentValue: boolean, updater: (newValue: boolean) => void) => (value: boolean) => {
  if (currentValue !== value) {
    // call updater only when value was changed
    updater(value);
  }
};

export const ChannelsSettings: FC = () => {
  const intl = useIntl();
  const [unsavedInfo, setUnsavedInfo] = useState<UnsavedInfo>({ dynamicPartitioning: false, autoMessage: false });
  const { application, isFetchingIgnoreMessageOffset, isFetchingAutoEventMessage } = useShallowEqualSelector(
    (state) => {
      const { isFetchingIgnoreMessageOffset, isFetchingAutoEventMessage } = state.settings;
      return {
        application: state.applicationState.data,
        isFetchingIgnoreMessageOffset,
        isFetchingAutoEventMessage,
      };
    },
  );
  const { isPermitted } = useAuthorization();
  const {
    isUsingDynamicPartitioning,
    option: currentDynamicPartitioningOption,
  } = useCurrentDynamicPartitioningOption();
  const dynamicPartitioningOptions = useAvailableDynamicPartitioningOptions();
  const isEditable = isPermitted(['application.settings.all']);

  const updateIgnoreMessageOffsetRequest = useDispatchAction(coreActions.updateIgnoreMessageOffsetRequest);
  const updateAutoEventMessageRequest = useDispatchAction(coreActions.updateAutoEventMessageRequest);

  const updateUnsavedInfo = useCallback(
    (key: keyof UnsavedInfo, newValue: boolean) =>
      setUnsavedInfo((currentValue) => ({ ...currentValue, [key]: newValue })),
    [],
  );

  const setAutoMessageUnsaved = useMemo(
    () => buildUpdaterOnlyIfChanged(unsavedInfo.autoMessage, (newValue) => updateUnsavedInfo('autoMessage', newValue)),
    [unsavedInfo.autoMessage, updateUnsavedInfo],
  );

  const setDynamicPartitioningUnsaved = useMemo(
    () =>
      buildUpdaterOnlyIfChanged(unsavedInfo.dynamicPartitioning, (newValue) =>
        updateUnsavedInfo('dynamicPartitioning', newValue),
      ),
    [unsavedInfo.dynamicPartitioning, updateUnsavedInfo],
  );

  if (!application) {
    return null;
  }

  const isOpenChannelsSectionVisible = dynamicPartitioningOptions.length > 0 || !isUsingDynamicPartitioning;

  return (
    <AppSettingsContainer
      css={css`
        ${AppSettingPageHeader} + * {
          margin-top: 32px;
        }
      `}
    >
      <UnsavedPrompt when={Object.values(unsavedInfo).some((value) => value)} />
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'chat.settings.channels.title' })}
        </AppSettingPageHeader.Title>
        <AppSettingPageHeader.Description>
          {intl.formatMessage({ id: 'chat.settings.channels.description' })}
        </AppSettingPageHeader.Description>
      </AppSettingPageHeader>
      {isOpenChannelsSectionVisible && (
        <>
          <SectionTitle id="channels-openchannels">
            {intl.formatMessage({ id: 'chat.settings.channels.openChannels' })}
          </SectionTitle>
          <SettingsGridGroup aria-labelledby="channels-openchannels">
            <DynamicPartitioningOptions
              key={currentDynamicPartitioningOption || ''}
              setUnsaved={setDynamicPartitioningUnsaved}
            />
          </SettingsGridGroup>
        </>
      )}
      <SectionTitle id="channels-groupchannels">
        {intl.formatMessage({ id: 'chat.settings.channels.groupChannels' })}
      </SectionTitle>
      <SettingsGridGroup aria-labelledby="channels-groupchannels">
        <ChatHistory
          application={application}
          isFetchingIgnoreMessageOffset={isFetchingIgnoreMessageOffset}
          isEditable={isEditable}
          updateIgnoreMessageOffsetRequest={updateIgnoreMessageOffsetRequest}
        />
        <AutoMessage
          application={application}
          isFetchingAutoEventMessage={isFetchingAutoEventMessage}
          isEditable={isEditable}
          setUnsaved={setAutoMessageUnsaved}
          updateAutoEventMessageRequest={updateAutoEventMessageRequest}
        />
      </SettingsGridGroup>
    </AppSettingsContainer>
  );
};
