import React from 'react';

import styled from 'styled-components';

import { SettingsCard, SettingsCardFooter } from './settingsCard';

const Container = styled.div`
  position: relative;
  && {
    ${SettingsCard} {
      &:not(:first-child) {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        margin-top: -1px;
      }

      &:not(:last-child) {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:not(:last-child) ${SettingsCardFooter} {
        height: 56px;
      }
    }
  }
`;

type Props = {
  className?: string;
  children?: React.ReactNode;
};

export const SettingsCardGroup = styled((({ className, children }) => {
  return <Container className={className}>{children}</Container>;
}) as React.FC<Props>)``;
