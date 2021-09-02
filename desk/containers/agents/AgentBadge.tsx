import { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { IconName, Icon, cssVariables, Tooltip, TooltipVariant } from 'feather';

import { AgentTier } from '@constants';

type Props = {
  agentType: Agent['agentType'];
  tier: AgentTier;
  role?: Agent['role'];
  size?: number;
  className?: string;
};

const AgentBadgeTooltip = styled(Tooltip)`
  display: inline-flex;
`;

const iconSet: Record<AgentTier, string | null> = {
  [AgentTier.EXPERT]: 'flag-filled',
  [AgentTier.INTERMEDIATE]: null,
};

const intlKeySet: Record<AgentTier, string> = {
  [AgentTier.EXPERT]: 'desk.agent.tier.expert',
  [AgentTier.INTERMEDIATE]: 'desk.agent.tier.intermediate',
};

export const AgentBadge = memo<Props>(({ className, agentType, tier, role, size }) => {
  const intl = useIntl();
  const isAdmin = role === 'ADMIN';
  const { icon, intlKey } = useMemo<{ icon: IconName | null; intlKey: string }>(() => {
    if (agentType === 'BOT') {
      return { icon: 'bot-filled' as IconName, intlKey: 'desk.bot' };
    }

    if (isAdmin) {
      return { icon: 'admin-filled' as IconName, intlKey: 'desk.admin' };
    }

    return { icon: iconSet[tier] as IconName | null, intlKey: intlKeySet[tier] };
  }, [agentType, isAdmin, tier]);

  if (!icon) {
    return null;
  }

  return (
    <AgentBadgeTooltip
      className={className}
      portalId="portal_popup"
      variant={TooltipVariant.Dark}
      placement="top"
      content={intl.formatMessage({ id: intlKey })}
    >
      <Icon
        icon={icon}
        size={size || 16}
        color={cssVariables('neutral-5')}
        css={css`
          margin-left: 4px;
        `}
      />
    </AgentBadgeTooltip>
  );
});
