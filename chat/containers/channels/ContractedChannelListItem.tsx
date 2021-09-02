import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault, Checkbox, Avatar, AvatarType, Typography, Headings } from 'feather';
import moment from 'moment-timezone';

import { DATE_WITH_SECONDS_FORMAT } from '@constants';
import { useAuthorization } from '@hooks';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';

import { FreezeIcon } from './FreezeIcon';
import { UserCountIcon } from './UserCountIcon';
import { SUPERGROUP_COLOR } from './constants';
import { useChannelListActions } from './hooks/useChannelList';

const ContractedChannelURL = styled.div`
  display: -webkit-box;
  width: 100%;
  max-height: 32px; // 2 lines
  overflow: hidden;
  word-break: break-all;
  color: ${cssVariables('neutral-10')};
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  ${Typography['caption-01']};
`;

const ContractedChannelName = styled.div`
  ${Headings['heading-01']};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${cssVariables('neutral-10')};
`;

const ChannelCover = styled(Avatar).attrs({ type: AvatarType.Channel, size: 20 })``;

const CreationTime = styled.time`
  position: relative;
  top: 2px;
  flex: 1 0;
  margin-left: 16px;
  text-align: right;
  white-space: nowrap;
  color: ${cssVariables('neutral-7')};
  ${Typography['caption-01']};
`;

const ChannelNameRow = styled.div`
  display: flex;
  align-items: flex-start;
  min-width: 0;
`;

const ContractedChannelUsers = styled.div<{ $isSupergroup: boolean }>`
  display: flex;
  align-items: center;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};
  font-size: 12px;
  font-weight: 400;

  ${UserCountIcon} {
    margin-right: 4px;
  }

  ${({ $isSupergroup }) =>
    $isSupergroup &&
    css`
      color: ${SUPERGROUP_COLOR};
      font-weight: 600;
    `}
`;

const ContractedChannelCheckbox = styled.div`
  display: flex;
  position: relative;
  transition: width 0.2s ${transitionDefault}, opacity 0.2s ${transitionDefault};
  opacity: 0;
  z-index: 0;
  width: 0;
  pointer-events: none;

  > * {
    margin-left: auto;
  }
`;

const ContractedChannelContent = styled.div`
  display: flex;
  position: relative;
  flex: 1;
  flex-direction: column;
  align-items: stretch;
  z-index: 2;
  min-width: 0;

  > * + ${ContractedChannelUsers} {
    margin-top: 4px;
  }

  > * + ${ContractedChannelURL} {
    margin-top: 8px;
  }
`;

const checkboxActive = css`
  width: 28px;
  opacity: 1;
  z-index: 1;
  pointer-events: all;
`;

const Container = styled.li<{
  $isActive: boolean;
  $checked?: boolean;
  $isEditing: boolean;
  $isEditable: boolean;
}>`
  display: flex;
  transition: background 0.2s ${transitionDefault};
  border-bottom: 1px solid ${cssVariables('neutral-2')};
  cursor: pointer;
  padding: 12px 16px;
  padding-left: 8px;

  &:hover {
    background: ${cssVariables('neutral-1')};
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      box-shadow: inset 2px 0 0 0 ${cssVariables('purple-7')};
      background: ${cssVariables('neutral-2')};

      ${ContractedChannelName},${ContractedChannelUsers} {
        color: ${cssVariables('purple-7')};
      }
    `};

  ${({ $isEditable }) =>
    $isEditable &&
    css`
      :hover {
        ${ContractedChannelCheckbox} {
          ${checkboxActive}
        }
      }
    `}

  ${({ $checked, $isEditing }) =>
    ($checked || $isEditing) &&
    css`
      ${ContractedChannelCheckbox} {
        ${checkboxActive}
      }
    `}

  > * + * {
    margin-left: 8px;
  }
`;

type Props = {
  channel: Channel;
  onClick: (payload: { url: string; customType: string }) => void;
  onCheckClick: React.MouseEventHandler<HTMLInputElement>;
  isActive: boolean;
  checked: boolean;
  isEditing: boolean;
  userCount: string;
};

export const ContractedChannelListItem = React.memo(
  ({ channel, onClick, onCheckClick, isActive, checked, isEditing, userCount }: Props) => {
    const intl = useIntl();
    const { isPermitted } = useAuthorization();
    const { handleChannelSelectionChange } = useChannelListActions();
    const handleCheckChange = useCallback(
      ({ target }) => {
        handleChannelSelectionChange(channel, target.checked);
      },
      [channel, handleChannelSelectionChange],
    );

    const handleItemClick = useCallback(() => {
      onClick({ url: channel.channel_url ?? '', customType: channel.custom_type });
    }, [onClick, channel]);

    const createdAtMomentObj = moment(channel.created_at * 1000);

    // is_super is undefined in open channels
    const isSupergroup = Boolean((channel as GroupChannel).is_super);

    const formatTimeAgo = useFormatTimeAgo();

    return (
      <Container
        onClick={handleItemClick}
        $isActive={isActive}
        $checked={checked}
        $isEditing={isEditing}
        $isEditable={isPermitted(['application.channels.openChannel.all', 'application.channels.groupChannel.all'])}
      >
        <ContractedChannelCheckbox>
          <Checkbox checked={checked} onChange={handleCheckChange} onClick={onCheckClick} />
        </ContractedChannelCheckbox>
        <ChannelCover profileID={channel.channel_url} imageUrl={channel.cover_url} />
        <ContractedChannelContent>
          <ChannelNameRow>
            <ContractedChannelName aria-label="Channel name">
              {channel.name || intl.formatMessage({ id: 'chat.channelList.emptyChannelNamePlaceholder' })}
            </ContractedChannelName>
            {channel.freeze && (
              <FreezeIcon
                css={`
                  position: relative;
                  top: -2px;
                  height: 20px;
                  vertical-align: top;
                  margin-left: 2px;
                `}
              />
            )}
            <CreationTime
              dateTime={createdAtMomentObj.toISOString()}
              title={createdAtMomentObj.format(DATE_WITH_SECONDS_FORMAT)}
            >
              {formatTimeAgo(createdAtMomentObj.valueOf())}
            </CreationTime>
          </ChannelNameRow>
          <ContractedChannelUsers aria-label="Number of users" $isSupergroup={isSupergroup}>
            <UserCountIcon size={12} isSupergroup={isSupergroup} />
            {userCount}
          </ContractedChannelUsers>
          <ContractedChannelURL aria-label="Channel URL">{channel.channel_url}</ContractedChannelURL>
        </ContractedChannelContent>
      </Container>
    );
  },
);
