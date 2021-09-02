import { useIntl } from 'react-intl';

import { cssVariables, TooltipTargetIcon, Tooltip, TooltipVariant } from 'feather';

export const FreezeIcon = ({ className }: { className?: string }) => {
  const intl = useIntl();
  return (
    <Tooltip
      className={className}
      variant={TooltipVariant.Dark}
      placement="top"
      content={intl.formatMessage({ id: 'chat.channelList.icon.freeze' })}
      css={`
        flex: none;

        svg {
          // prevent color change inside a Feather <Link> component
          fill: ${cssVariables('purple-7')} !important;
        }
      `}
    >
      <TooltipTargetIcon
        role="img"
        icon="freeze"
        size={16}
        color={cssVariables('purple-7')}
        aria-label={intl.formatMessage({ id: 'chat.channelList.icon.freeze' })}
      />
    </Tooltip>
  );
};
