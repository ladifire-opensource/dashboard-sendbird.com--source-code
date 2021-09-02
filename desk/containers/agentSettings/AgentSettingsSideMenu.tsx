import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';

import { SideMenu, createSideMenuItemDefault } from 'feather';

import { useAgentSettingMenus } from './useAgentSettingMenus';

type Props = {
  className?: string;
  onMenuItemClick: (href: string) => void;
};

export const AgentSettingsSideMenu: React.FC<Props> = ({ className, onMenuItemClick: onMenuItemClickProp }) => {
  const intl = useIntl();
  const { agentMenus, activeAgentMenu } = useAgentSettingMenus();
  const menuItems = useMemo(() => {
    const onMenuItemClick = (href: string) => () => {
      onMenuItemClickProp(href);
    };

    return agentMenus.map(({ key, label, href }) =>
      createSideMenuItemDefault({ key, label, onClick: onMenuItemClick(href) }),
    );
  }, [agentMenus, onMenuItemClickProp]);

  return (
    <SideMenu
      className={className}
      title={intl.formatMessage({ id: 'desk.settings.title.forAgent' })}
      items={menuItems}
      activeItemKey={activeAgentMenu ? activeAgentMenu.key : undefined}
    />
  );
};
