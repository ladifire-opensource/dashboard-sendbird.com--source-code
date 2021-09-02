import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Tooltip, TooltipTrigger, Icon, TooltipVariant } from 'feather';

type Props = { size: number; color?: string; isSupergroup?: boolean; className?: string };

export const UserCountIcon = styled(({ size, color = 'currentColor', isSupergroup = false, className }: Props) => {
  const intl = useIntl();

  return (
    <Tooltip
      variant={TooltipVariant.Dark}
      content={
        isSupergroup ? intl.formatMessage({ id: 'chat.channelList.list.column.memberCount.icon.supergroup' }) : ''
      }
      trigger={isSupergroup ? TooltipTrigger.Hover : TooltipTrigger.Manual}
      className={className}
      portalId="portal_tooltip"
    >
      <Icon icon={isSupergroup ? 'teams' : 'user'} color={color} size={size} css="display: block;" />
    </Tooltip>
  );
})``;
