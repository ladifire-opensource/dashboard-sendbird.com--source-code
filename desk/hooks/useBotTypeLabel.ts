import { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { DeskBotType } from './../../constants/desk';

export const BOT_TYPE_INTL_KEYS: Record<DeskBotType, string> = {
  [DeskBotType.CUSTOMIZED]: 'desk.agent.bot.type.custom',
  [DeskBotType.FAQBOT]: 'desk.agent.bot.type.faq',
};

export const useBotTypeLabel = () => {
  const intl = useIntl();
  return useCallback(
    (type: DeskBotType) => {
      const key = BOT_TYPE_INTL_KEYS[type];
      return key ? intl.formatMessage({ id: key }) : type;
    },
    [intl],
  );
};
