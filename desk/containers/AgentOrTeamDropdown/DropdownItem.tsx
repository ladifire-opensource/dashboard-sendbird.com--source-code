import { FC, PropsWithChildren, LiHTMLAttributes, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, Icon, TwoLineDropdownItemWithAvatar } from 'feather';

import { AgentType, DeskAvatarType, EMPTY_TEXT } from '@constants';
import { useBotTypeLabel } from '@desk/hooks';
import { TextWithOverflowTooltip } from '@ui/components';

import { AgentBadge } from '../agents/AgentBadge';
import { convertAgentConnectionToAvatarStatus } from './convertAgentConnectionToAvatarStatus';

type Team = AgentGroup;
type ItemType = 'team' | 'agent';

type Props<T> = {
  isSelected: boolean;
  isHighlighted: boolean;
  unselectItemLabel: string;
  item: T | null;
} & LiHTMLAttributes<HTMLLIElement>;

const UnselectItemContent = styled(({ className, children }: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={className}
      css={`
        display: flex;
        flex-direction: row;
        align-items: center;

        svg {
          margin-right: 16px;
        }
      `}
    >
      <Icon icon="user-avatar" size={20} color="currentColor" />
      {children}
    </div>
  );
})``;

const SelectedIcon = styled(Icon).attrs({ icon: 'done', size: 20, color: cssVariables('purple-7') })`
  position: relative;
  top: 6px;
  align-self: flex-start;
`;

const AgentItemTitle = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 20px;
`;

const PositionedAgentBadge = styled(AgentBadge)`
  height: 16px;
`;

const Item = styled.li<{ $isHighlighted: boolean; $isSelected: boolean; $itemType: ItemType }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  outline: 0;
  cursor: pointer;
  padding: 0 16px;
  height: ${({ $itemType: $itemType }) => ($itemType === 'team' ? 32 : 48)}px;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;

  ${({ $isHighlighted }) => $isHighlighted && `background-color: ${cssVariables('neutral-1')};`};

  ${({ $isSelected }) =>
    $isSelected &&
    css`
      color: ${cssVariables('purple-7')};

      svg {
        fill: currentColor;
      }
    `};

  ${({ $itemType }) =>
    $itemType === 'agent' &&
    css`
      ${UnselectItemContent} {
        svg {
          margin-left: 6px;
          margin-right: 18px;
        }
      }

      ${UnselectItemContent} ~ ${SelectedIcon} {
        align-self: center;
        top: initial;
      }
    `}

  > *:first-child {
    flex: 1;
    min-width: 0;
  }

  > *:nth-child(2) {
    flex: none;
    margin-left: 8px;
  }
`;

export const TeamItem: FC<Props<Team>> = ({
  isSelected,
  isHighlighted,
  unselectItemLabel,
  item,
  tabIndex = 0,
  ...htmlAttributes
}) => {
  const intl = useIntl();
  return (
    <Item
      $itemType="team"
      $isSelected={isSelected}
      $isHighlighted={isHighlighted}
      tabIndex={tabIndex}
      {...htmlAttributes}
    >
      {item ? (
        <span>{item.key === null ? intl.formatMessage({ id: 'desk.team.defaultTeam' }) : item.name}</span>
      ) : (
        <UnselectItemContent>{unselectItemLabel}</UnselectItemContent>
      )}
      {isSelected && <SelectedIcon />}
    </Item>
  );
};

export const AgentItem: FC<Props<Agent>> = ({
  isSelected,
  isHighlighted,
  unselectItemLabel,
  item,
  tabIndex = 0,
  ...htmlAttributes
}) => {
  const getBotTypeLabel = useBotTypeLabel();
  const content = useMemo(() => {
    if (item == null) {
      return <UnselectItemContent>{unselectItemLabel}</UnselectItemContent>;
    }

    const { displayName, email, photoThumbnailUrl, connection, agentType, tier, role, bot } = item;

    const subtitle: string | undefined = (() => {
      if (agentType === AgentType.USER) {
        return email.trim() || EMPTY_TEXT;
      }

      if (agentType === AgentType.BOT && bot) {
        return getBotTypeLabel(bot.type);
      }

      return undefined;
    })();

    return (
      <TwoLineDropdownItemWithAvatar
        title={
          <AgentItemTitle>
            <TextWithOverflowTooltip tooltipDisplay="inline-block">{displayName}</TextWithOverflowTooltip>
            <PositionedAgentBadge agentType={agentType} role={role} tier={tier} />
          </AgentItemTitle>
        }
        subtitle={subtitle}
        avatar={{
          type: bot == null ? DeskAvatarType.Agent : DeskAvatarType.Bot,
          profileID: email || '',
          imageUrl: photoThumbnailUrl,
          status: convertAgentConnectionToAvatarStatus(connection),
        }}
        isSelected={isSelected}
      />
    );
  }, [getBotTypeLabel, isSelected, item, unselectItemLabel]);

  return (
    <Item
      $itemType="agent"
      $isSelected={isSelected}
      $isHighlighted={isHighlighted}
      tabIndex={tabIndex}
      {...htmlAttributes}
    >
      {content}
      {isSelected && <SelectedIcon />}
    </Item>
  );
};
