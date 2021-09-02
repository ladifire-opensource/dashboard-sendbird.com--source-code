import React from 'react';

import styled from 'styled-components';

import { SettingsGridGroup } from '@common/containers/layout/settingsGrid';

import { FieldsGroupTitle } from './CommonFormComponents';

type Props = {
  title: React.ReactNode;
  children?: React.ReactNode;
};

const SettingsGroupContainer = styled.div`
  & + & {
    margin-top: 32px;
  }
`;

export const BotSettingsGroup = React.memo<Props>(({ title, children }) => {
  return (
    <SettingsGroupContainer>
      <FieldsGroupTitle>{title}</FieldsGroupTitle>
      {children && <SettingsGridGroup>{children}</SettingsGridGroup>}
    </SettingsGroupContainer>
  );
});
