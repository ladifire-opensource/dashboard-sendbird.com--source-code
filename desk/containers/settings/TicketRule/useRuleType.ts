import { useMemo } from 'react';
import { useRouteMatch } from 'react-router-dom';

import { TicketRuleType } from './constants';

export const useRuleType = () => {
  const match = useRouteMatch();

  return useMemo(() => {
    const splitMatchedUrl = match?.url.split('/');

    if (!splitMatchedUrl || splitMatchedUrl.length < 5 || splitMatchedUrl.length > 6) {
      throw new Error('Match url is invalid');
    }

    const offset = splitMatchedUrl?.length === 5 ? 1 : 2;
    const pageName = splitMatchedUrl?.[splitMatchedUrl.length - offset];

    switch (pageName) {
      case 'priority_rules':
        return {
          type: TicketRuleType.PRIORITY,
          consequent: {
            key: 'priority',
          },
          intlKeyByType: 'priorityRules',
          pathname: 'priority_rules',
        };

      default:
        return {
          type: TicketRuleType.ASSIGNMENT,
          consequent: {
            key: 'id',
          },
          intlKeyByType: 'assignmentRules',
          pathname: 'assignment_rules',
        };
    }
  }, [match]);
};
