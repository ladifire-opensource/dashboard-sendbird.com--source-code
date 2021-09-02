import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import {
  createSideMenuItemExpandable,
  createSideMenuItemSub,
  SideMenu,
  createSideMenuItemDefault,
  SideMenuItem,
} from 'feather';
import flatMap from 'lodash/flatMap';

import { Product } from '@constants';
import { SettingMenu, AppSettingMenuKey } from '@hooks';
import { useAppSettingMenus } from '@hooks/useAppSettingMenus';

type Props = {
  className?: string;
  onMenuItemClick: (href: string) => void;
};

const nestedExpandableMenuKeys = [AppSettingMenuKey.DeskTicketRules];

export const AppSettingsSideMenu: React.FC<Props> = ({ className, onMenuItemClick: onMenuItemClickProp }) => {
  const intl = useIntl();
  const { applicationMenus, chatMenus, deskMenus, activeMenu, callsMenus } = useAppSettingMenus();
  const menuItems = useMemo(() => {
    const onMenuItemClick = (href: string) => () => {
      onMenuItemClickProp(href);
    };
    const convertSettingsMenuToSideMenuItem = (parentKey?: string): ((v: SettingMenu) => SideMenuItem) => {
      return ({ parentKey: subParentKey, key, label, labelSuffixNode, href }) => {
        if (nestedExpandableMenuKeys.includes(key)) {
          return createSideMenuItemExpandable({ key, label, labelSuffixNode, isExpanded: true, parentKey });
        }

        const bothParentKey = subParentKey || parentKey;
        if (bothParentKey) {
          return createSideMenuItemSub({
            key,
            label,
            labelSuffixNode,
            onClick: href ? onMenuItemClick(href) : undefined,
            parentKey: bothParentKey,
          });
        }
        return createSideMenuItemDefault({ key, label, labelSuffixNode, onClick: onMenuItemClick(href as string) });
      };
    };

    const isMenuGrouped = [applicationMenus, chatMenus, deskMenus].filter((v) => v.length > 0).length > 1;
    if (!isMenuGrouped) {
      return [...applicationMenus, ...chatMenus, ...deskMenus].map(convertSettingsMenuToSideMenuItem());
    }
    const menuGroups = ([
      [{ key: 'application', label: 'Application' }, applicationMenus],
      [{ key: Product.chat, label: 'Chat' }, chatMenus],
      [{ key: Product.calls, label: 'Calls' }, callsMenus],
      [{ key: Product.desk, label: 'Desk' }, deskMenus],
    ] as const)
      .filter(([, menus]) => menus.length > 0)
      .map(([group, menus]) => [
        createSideMenuItemExpandable({ ...group, isExpanded: true }),
        ...menus.map(convertSettingsMenuToSideMenuItem(group.key)),
      ]);
    return flatMap(menuGroups);
  }, [applicationMenus, chatMenus, deskMenus, callsMenus, onMenuItemClickProp]);

  return (
    <SideMenu
      className={className}
      title={intl.formatMessage({ id: 'core.settings.header.title' })}
      items={menuItems}
      activeItemKey={activeMenu ? activeMenu.key : undefined}
    />
  );
};
