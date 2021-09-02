import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { useIsDeskEnabled } from '@hooks/useIsDeskEnabled';

export enum AgentSettingsMenuKey {
  QuickReplies = 'quick_replies',
}

export type SettingMenu = {
  key: string;
  label: string;
  href: string;
};

export const useAgentSettingMenus = () => {
  const intl = useIntl();
  const location = useLocation();
  const appID = useSelector((state: RootState) => state.applicationState.data?.app_id || '');

  const isAccessibleToDeskSettings = useIsDeskEnabled();

  const agentMenus = useMemo(
    () =>
      isAccessibleToDeskSettings
        ? [
            {
              key: AgentSettingsMenuKey.QuickReplies,
              label: intl.formatMessage({ id: 'desk.settings.quickReplies.title' }),
              href: `/${appID}/desk/settings/quick-replies`,
            },
          ]
        : [],
    [appID, intl, isAccessibleToDeskSettings],
  );

  return useMemo(() => {
    const activeAgentMenu = agentMenus.find((item) => location.pathname.startsWith(item.href));
    const isActiveMenuExactMatch = activeAgentMenu ? activeAgentMenu.href === location.pathname : false;
    const fallbackMenuPath = agentMenus[0]?.href;

    return {
      agentMenus,
      activeAgentMenu,
      isActiveMenuExactMatch,
      fallbackMenuPath,
    };
  }, [agentMenus, location.pathname]);
};
