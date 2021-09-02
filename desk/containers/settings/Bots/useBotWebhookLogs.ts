import { useContext, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import qs from 'qs';

import { DrawerContext } from '@ui/components';

export const BOT_WEBHOOK_LOG_DRAWER_ID = 'BotWebhookLogsDrawer';
export const useBotWebhookLogs = () => {
  const history = useHistory();
  const { openDrawer, closeDrawer } = useContext(DrawerContext);
  const { webhook } = qs.parse(history.location.search, { ignoreQueryPrefix: true }) as { webhook: number };

  const openWebhookLogs = useCallback(
    (botId: DeskBot['id']) => {
      const currentParams = qs.parse(history.location.search, { ignoreQueryPrefix: true });
      if (currentParams.webhook != null) {
        currentParams.webhook = botId;
        history.push(`${history.location.pathname}?${qs.stringify(currentParams)}`);
      }
      history.push(`${history.location.pathname}?${qs.stringify({ ...currentParams, webhook: botId })}`);
      openDrawer(BOT_WEBHOOK_LOG_DRAWER_ID);
    },
    [history, openDrawer],
  );

  const closeWebhookLogs = useCallback(() => {
    const currentParams = qs.parse(history.location.search, { ignoreQueryPrefix: true });
    delete currentParams.webhook;
    history.push(`${history.location.pathname}?${qs.stringify(currentParams)}`);
    closeDrawer(BOT_WEBHOOK_LOG_DRAWER_ID);
  }, [closeDrawer, history]);

  return useMemo(
    () => ({
      webhook,
      openWebhookLogs,
      closeWebhookLogs,
    }),
    [closeWebhookLogs, openWebhookLogs, webhook],
  );
};
