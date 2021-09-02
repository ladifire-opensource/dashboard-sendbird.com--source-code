import React from 'react';
import { useIntl } from 'react-intl';

import { AppSettingsContainer, AppSettingPageHeader } from '@common/containers/layout';
import { useShallowEqualSelector } from '@hooks';

import { FileEncryption } from './FileEncryption';

export const Security: React.FC = () => {
  const intl = useIntl();
  const { project, isUpdating } = useShallowEqualSelector((state) => {
    const { project, isUpdating } = state.desk;
    return { project, isUpdating };
  });
  return (
    <AppSettingsContainer>
      <AppSettingPageHeader>
        <AppSettingPageHeader.Title>
          {intl.formatMessage({ id: 'desk.settings.security.title' })}
        </AppSettingPageHeader.Title>
      </AppSettingPageHeader>
      <FileEncryption project={project} isFetching={isUpdating} />
    </AppSettingsContainer>
  );
};
