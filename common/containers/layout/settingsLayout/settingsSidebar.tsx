import React, { useCallback, useContext } from 'react';

import styled, { css } from 'styled-components';

import { IconName, cssVariables, transitionDefault, Icon, ScrollBar } from 'feather';

import { GNBHeightContext } from '@common/containers/layout/navigationLayout/gnbHeightContext';
import { SETTINGS_SIDEBAR_WIDTH } from '@constants/ui';
import { ZIndexes } from '@ui';

const Header = styled.h1`
  font-size: 11px;
  line-height: 12px;
  font-weight: 600;
  color: ${cssVariables('neutral-8')};
  text-transform: uppercase;
  margin: 0;
  padding-left: 16px;
  padding-top: 40px;
  padding-bottom: 20px;
`;

const IconFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const MenuList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  height: 100%;
`;

const MenuListItem = styled.li<{ isActive: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 32px;
  padding: 0 16px;
  color: ${cssVariables('neutral-9')};
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s ${transitionDefault}, background-color 0.2s ${transitionDefault};

  ${IconFrame} svg * {
    transition: fill 0.2s ${transitionDefault};
    fill: ${cssVariables('neutral-9')};
  }

  & + & {
    margin-top: 12px;
  }

  &:hover {
    ${(props) =>
      !props.isActive &&
      css`
        color: ${cssVariables('purple-7')};

        ${IconFrame} svg * {
          fill: ${cssVariables('purple-7')};
        }
      `}
  }

  ${(props) =>
    props.isActive &&
    css`
      cursor: default;
      background-color: ${cssVariables('neutral-1')};
      color: ${cssVariables('purple-7')};

      ${IconFrame} svg * {
        fill: ${cssVariables('purple-7')};
      }
    `}
`;

const SettingsSidebarWrapper = styled.div<{ positionTop: number }>`
  position: fixed;
  top: ${({ positionTop }) => positionTop}px;
  bottom: 0;
  z-index: ${ZIndexes.navigation};
  background: #fff;
  width: ${SETTINGS_SIDEBAR_WIDTH}px;
`;

const SIDEBAR_HEADER_HEIGHT = 72;
const ScrollBarWrapper = styled.div`
  background: #fff;
  padding-bottom: 20px;
  height: calc(100% - ${SIDEBAR_HEADER_HEIGHT}px);
`;

export type SettingsSidebarMenuItem = {
  key: string;
  label: string;
  icon: IconName;
  path?: string;
};

type Props = {
  headerText: string;
  items: readonly SettingsSidebarMenuItem[];
  activeItem?: SettingsSidebarMenuItem;
  onItemClick?: (item: SettingsSidebarMenuItem) => void;
};

export const SettingsSidebar: React.FC<Props> = ({ headerText, items, activeItem, onItemClick }) => {
  const handleItemClick = useCallback((item) => () => onItemClick && onItemClick(item), [onItemClick]);
  const gnbHeight = useContext(GNBHeightContext);

  return (
    <SettingsSidebarWrapper positionTop={gnbHeight}>
      <Header>{headerText}</Header>
      <ScrollBarWrapper>
        <ScrollBar>
          <MenuList>
            {items.map((item) => (
              <MenuListItem
                key={item.key}
                role="link"
                onClick={item === activeItem ? undefined : handleItemClick(item)}
                isActive={item === activeItem}
              >
                <IconFrame>
                  <Icon icon={item.icon} size={20} />
                </IconFrame>

                {item.label}
              </MenuListItem>
            ))}
          </MenuList>
        </ScrollBar>
      </ScrollBarWrapper>
    </SettingsSidebarWrapper>
  );
};
