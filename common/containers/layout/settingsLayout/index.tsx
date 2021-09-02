import React, { useRef, useCallback } from 'react';

import styled from 'styled-components';

import { ScrollBar } from 'feather';

import { SETTINGS_SIDEBAR_WIDTH } from '@constants/ui';
import { InformationCard } from '@ui/components/InformationCard';

import { SettingsCard } from './settingsCard';
import { SettingsCardGroup } from './settingsCardGroup';
import { SettingsSidebar, SettingsSidebarMenuItem } from './settingsSidebar';

type Props = {
  title: string;
  menuItems: ReadonlyArray<SettingsSidebarMenuItem>;
  activeMenuItem?: SettingsSidebarMenuItem;
  onMenuItemClick: (menuItem: SettingsSidebarMenuItem) => void;
  children: React.ReactNode;
};

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: ${SETTINGS_SIDEBAR_WIDTH}px 1fr;
  grid-gap: 56px;
  margin: 0 auto;
  padding-bottom: 56px;
  width: 1264px;
  min-height: 100%;
`;
const MainColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 24px;

  ${SettingsCard} + ${SettingsCard}, 
  ${SettingsCardGroup} + ${SettingsCardGroup},
  ${SettingsCard} + ${SettingsCardGroup},
  ${SettingsCardGroup} + ${SettingsCard},
  > ${InformationCard} + * {
    margin-top: 32px;
  }
`;

export const SettingsLayoutContext = React.createContext<{ setBodyFitToWindow: (isBodyFitToWindow: boolean) => void }>({
  setBodyFitToWindow: () => {},
});

export const SettingsLayout: React.FC<Props> = ({ title, menuItems, activeMenuItem, onMenuItemClick, children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const setBodyFitToWindow = useCallback((isBodyFitToWindow: boolean) => {
    if (wrapperRef.current) {
      wrapperRef.current.style.height = isBodyFitToWindow ? '100%' : 'auto';
    }
  }, []);

  return (
    <SettingsLayoutContext.Provider value={{ setBodyFitToWindow }}>
      <ScrollBar style={{ backgroundColor: '#FFF' }}>
        <Wrapper ref={wrapperRef}>
          <div>
            <SettingsSidebar
              headerText={title}
              items={menuItems}
              activeItem={activeMenuItem}
              onItemClick={onMenuItemClick}
            />
          </div>

          <MainColumn>{children}</MainColumn>
        </Wrapper>
      </ScrollBar>
    </SettingsLayoutContext.Provider>
  );
};

export * from './settingsHeader';
export * from './settingsCard';
export * from './settingsCardGroup';
export * from './settingsSidebar';
