import { FC } from 'react';
import { useIntl } from 'react-intl';

import { css } from 'styled-components';

import { Badge, BadgeProps, cssVariables, Icon, Tooltip } from 'feather';

type Props = Partial<BadgeProps> & {
  messageCount: number;
};

export const ProactiveChatMessageCountBadge: FC<Props> = ({ messageCount, ...badgeProps }) => {
  const intl = useIntl();

  return (
    <Tooltip
      content={intl.formatMessage({ id: 'desk.proactiveChatMessageCountBadge.tooltip' })}
      placement="top"
      popperProps={{ modifiers: { offset: { offset: '0, 8' } } }}
    >
      <Badge
        color="neutral"
        count={messageCount}
        max={9}
        prefixNode={
          <Icon
            icon="proactive-chat-filled"
            size={12}
            color={cssVariables('neutral-7')}
            css={css`
              margin-right: 4px;
            `}
          />
        }
        {...badgeProps}
      />
    </Tooltip>
  );
};
