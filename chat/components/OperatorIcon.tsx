import { useIntl } from 'react-intl';

import { Icon, IconProps, Tooltip, TooltipVariant } from 'feather';

type Props = Pick<IconProps, 'color' | 'size'> & { className?: string };

export const OperatorIcon = ({ color, size, className }: Props) => {
  const intl = useIntl();
  return (
    <Tooltip
      variant={TooltipVariant.Dark}
      content={intl.formatMessage({ id: 'chat.channelDetail.tooltip.operator' })}
      placement="top"
      portalId="portal_tooltip"
      className={className}
    >
      <Icon
        color={color}
        icon="admin-filled"
        size={size}
        assistiveText={intl.formatMessage({ id: 'chat.channelDetail.tooltip.operator' })}
      />
    </Tooltip>
  );
};
