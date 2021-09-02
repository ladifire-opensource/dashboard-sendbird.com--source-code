import { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import {
  Avatar,
  AvatarType,
  Tag,
  cssVariables,
  TableBatchAction,
  OverflowMenu,
  TableProps,
  Typography,
  Link,
  transitionDefault,
  Subtitles,
} from 'feather';
import moment from 'moment-timezone';

import { useCurrentDynamicPartitioningOption } from '@chat/containers/settings/ChannelsSettings/hooks';
import { useGroupChannelMaxMemberCount } from '@chat/hooks/useGroupChannelMaxMemberCount';
import { EMPTY_TEXT, DATE_WITH_SECONDS_FORMAT } from '@constants';
import { useAppId, useResizeObserver } from '@hooks';
import { LoadMoreTableColumn } from '@ui/components';

import { FreezeIcon } from '../FreezeIcon';
import { GroupChannelTypeTooltipContent } from '../GroupChannelTypeTooltipContent';
import { UserCountIcon } from '../UserCountIcon';
import { SUPERGROUP_COLOR } from '../constants';
import { useCanEditOpenChannels, useCanEditGroupChannels } from '../editChannelPermissionHooks';
import { useChannelListActions } from './useChannelList';
import { useCheckEnterChannelAvailability } from './useCheckEnterChannelAvailability';
import { useEmptyView } from './useEmptyView';

type ChannelTyped<T extends ChannelType> = T extends 'open_channels' ? OpenChannel : GroupChannel;

type Options<T extends ChannelType> = {
  channelType: T;
  onChannelClick: (payload: { url: string; customType: string }) => void;
  selectedChannels: ChannelTyped<T>[];
  onSelectedChannelsChange: (selectedChannels: ChannelTyped<T>[]) => void;
  dataSource: readonly ChannelTyped<T>[];
  isLoading: boolean;
};

const UserCount = styled.div<{ $color?: string }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${({ $color = cssVariables('neutral-10') }) => $color};

  svg {
    margin-right: 4px;
  }

  b {
    ${Subtitles['subtitle-01']}
  }
`;

const ChannelNameGrid = styled.div`
  display: grid;
  grid-template-areas:
    'avatar name'
    'avatar url';
  grid-template-rows: auto auto;
  grid-template-columns: auto 1fr;
  grid-column-gap: 12px;
  align-items: center;
  max-width: 100%;
`;

const ChannelName = styled.div`
  display: flex;
  grid-area: name;
  min-width: 0;
  color: ${cssVariables('neutral-10')};

  > span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ChannelNameLink = styled(Link)`
  width: 100%;
  margin-top: -12px;
  margin-bottom: -12px;
  padding-top: 12px;
  padding-bottom: 12px;

  &:hover {
    text-decoration: none;

    ${ChannelName} {
      transition: 0.2s ${transitionDefault};
      color: ${cssVariables('purple-7')};
      text-decoration: underline;
    }
  }

  &:not(:active):focus {
    box-shadow: inset 0 0 0 2px ${cssVariables('purple-7')};
  }
`;

const ChannelUrl = styled.div`
  grid-area: url;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${cssVariables('neutral-7')};
  ${Typography['caption-01']};
`;

const DateTImeCellContent = ({ timestampInMilliseconds }: { timestampInMilliseconds: number }) => {
  const momentObj = useMemo(() => moment(timestampInMilliseconds), [timestampInMilliseconds]);

  const content = useMemo(() => {
    const stringRepresentation = momentObj.format(DATE_WITH_SECONDS_FORMAT);
    const dateAndTime = stringRepresentation.split(/\s(at .*)/);

    if (dateAndTime.length < 2) {
      return stringRepresentation;
    }

    const [datePart, timePart] = dateAndTime;
    return (
      <>
        <span>{datePart}&nbsp;</span>
        <span css="word-break: keep-all;">{timePart}</span>
      </>
    );
  }, [momentObj]);

  return <time dateTime={momentObj.toISOString()}>{content}</time>;
};

const CustomTypeTag = ({ children }: { children: string }) => {
  const [width, setWidth] = useState<number>();
  const refCallback = useResizeObserver((entry) => {
    setWidth(entry.contentRect.width);
  });

  return (
    <div
      ref={refCallback}
      css={`
        width: 100%;
        min-width: 0;
      `}
    >
      <Tag maxWidth={width}>{children}</Tag>
    </div>
  );
};

export const useChannelListTableProps = <T extends ChannelType>({
  channelType,
  onChannelClick,
  selectedChannels,
  onSelectedChannelsChange,
  dataSource,
  isLoading,
}: Options<T>): TableProps<ChannelTyped<T>> => {
  const intl = useIntl();
  const appId = useAppId();
  const canEditOpenChannels = useCanEditOpenChannels();
  const canEditGroupChannels = useCanEditGroupChannels();
  const isGroupChannel = channelType === 'group_channels';
  const canEditChannels = isGroupChannel ? canEditGroupChannels : canEditOpenChannels;
  const { maxTotalParticipants } = useCurrentDynamicPartitioningOption();

  const checkEnterChannelAvailability = useCheckEnterChannelAvailability(channelType);

  const { editChannel, editChannelMetadata, sendAdminMessage, deleteChannels } = useChannelListActions();

  const batchActions: TableBatchAction[] = useMemo(() => {
    const editChannelAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.editChannel' }),
      icon: 'edit',
      onClick: () => editChannel(selectedChannels[0]),
    };

    const editMetadataAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.editChannelMetadata' }),
      icon: 'metadata',
      onClick: () => editChannelMetadata(selectedChannels[0]),
    };

    const sendAdminMessageAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.sendAdminMessage' }),
      icon: 'admin-message',
      onClick: () => sendAdminMessage(selectedChannels),
    };

    const deleteChannelsAction: TableBatchAction = {
      label: intl.formatMessage({ id: 'chat.channelList.list.bulkAction.deleteChannels' }),
      icon: 'delete',
      onClick: () => deleteChannels(selectedChannels),
    };

    if (selectedChannels.length > 1) {
      return [sendAdminMessageAction, deleteChannelsAction];
    }
    return [editChannelAction, editMetadataAction, sendAdminMessageAction, deleteChannelsAction];
  }, [deleteChannels, editChannel, editChannelMetadata, intl, selectedChannels, sendAdminMessage]);

  const getGroupChannelMaxMemberCount = useGroupChannelMaxMemberCount();

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'name',
        title: intl.formatMessage({ id: 'chat.channelList.list.column.name' }),
        render: (channel) => {
          // FIXME: channel typing
          const { cover_url, channel_url, name, freeze, custom_type } = channel;
          return (
            <ChannelNameLink
              href={`/${appId}/${channelType}/${channel_url}`}
              onClick={(event) => {
                event.preventDefault();
                checkEnterChannelAvailability({
                  onSuccess: () => onChannelClick({ url: channel_url, customType: custom_type }),
                });
              }}
            >
              <ChannelNameGrid>
                <Avatar
                  type={AvatarType.Channel}
                  imageUrl={cover_url}
                  profileID={channel_url}
                  size={32}
                  css="grid-area: avatar;"
                />
                <ChannelName>
                  <span>{name || intl.formatMessage({ id: 'chat.channelList.emptyChannelNamePlaceholder' })}</span>{' '}
                  {freeze && (
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
                </ChannelName>
                <ChannelUrl>{channel_url}</ChannelUrl>
              </ChannelNameGrid>
            </ChannelNameLink>
          );
        },
        styles: css`
          margin-left: 4px;
        `,
      },
      isGroupChannel
        ? {
            dataIndex: 'member_count',
            title: intl.formatMessage({ id: 'chat.channelList.list.column.memberCount' }),
            titleTooltip: { content: <GroupChannelTypeTooltipContent /> },
            render: (channel: GroupChannel) => {
              const { member_count, is_super } = channel;
              const color = is_super ? SUPERGROUP_COLOR : cssVariables('neutral-10');
              const maxMemberCount = getGroupChannelMaxMemberCount(channel);
              return (
                <UserCount $color={color}>
                  <UserCountIcon isSupergroup={is_super} size={16} />
                  <span>
                    <b>{intl.formatNumber(member_count)}</b>{' '}
                    {maxMemberCount && <>/ {intl.formatNumber(maxMemberCount)}</>}
                  </span>
                </UserCount>
              );
            },
            styles: css`
              width: 8.38%;
              min-width: 122px;
              flex: none;
            `,
          }
        : {
            dataIndex: 'participant_count',
            title: intl.formatMessage({ id: 'chat.channelList.list.column.participantCount' }),
            render: ({ participant_count }: OpenChannel) => {
              return (
                <UserCount>
                  <UserCountIcon size={16} color={cssVariables('neutral-6')} />
                  <span>
                    <b>{intl.formatNumber(participant_count)}</b>{' '}
                    {maxTotalParticipants && <>/ {intl.formatNumber(maxTotalParticipants)}</>}
                  </span>
                </UserCount>
              );
            },
            width: '10.67%',
          },
      (() => {
        const width = isGroupChannel ? '13.41%' : '15.24%';
        return {
          dataIndex: 'custom_type',
          title: intl.formatMessage({ id: 'chat.channelList.list.column.customType' }),
          render: (channel) =>
            channel.custom_type ? <CustomTypeTag>{channel.custom_type}</CustomTypeTag> : EMPTY_TEXT,
          width,
        };
      })(),
      isGroupChannel && {
        key: 'last_message_at',
        title: intl.formatMessage({ id: 'chat.channelList.list.column.lastMessageAt' }),
        render: (record: GroupChannel) => {
          const lastMessageAt = record.last_message?.created_at;
          if (!lastMessageAt) {
            return EMPTY_TEXT;
          }
          return <DateTImeCellContent timestampInMilliseconds={lastMessageAt} />;
        },
        width: '12.2%',
      },
      {
        dataIndex: 'created_at',
        title: intl.formatMessage({ id: 'chat.channelList.list.column.createdAt' }),
        render: ({ created_at }) => <DateTImeCellContent timestampInMilliseconds={created_at * 1000} />,
        styles: css`
          padding-right: 48px;
        `,
        width: isGroupChannel ? 'calc(12.2% + 48px)' : '21.95%',
      },
    ].filter((value) => !!value) as LoadMoreTableColumn<ChannelTyped<T>>[]; // FIXME: replace type assertion
  }, [
    appId,
    channelType,
    checkEnterChannelAvailability,
    getGroupChannelMaxMemberCount,
    intl,
    isGroupChannel,
    maxTotalParticipants,
    onChannelClick,
  ]);

  const handleSelectionChange = (_, selectedRows: ChannelTyped<T>[]) => {
    onSelectedChannelsChange(selectedRows);
  };

  const emptyView = useEmptyView();

  return {
    rowKey: 'channel_url',
    showScrollbars: true,
    rowSelection: canEditChannels
      ? {
          selectedRowKeys: selectedChannels.map((channel) => channel.channel_url),
          onChange: handleSelectionChange,
          getCheckboxProps: () => ({
            onClick: (e) => e.stopPropagation(),
          }),
        }
      : undefined,
    columns,
    dataSource,
    loading: isLoading,
    rowActions: canEditChannels
      ? (record) => [
          <OverflowMenu
            key="menu"
            items={[
              {
                label: intl.formatMessage({ id: 'chat.channelList.list.rowAction.editChannel' }),
                onClick: () => editChannel(record),
              },
              {
                label: intl.formatMessage({ id: 'chat.channelList.list.rowAction.editChannelMetadata' }),
                onClick: () => editChannelMetadata(record),
              },
              {
                label: intl.formatMessage({ id: 'chat.channelList.list.rowAction.sendAdminMessage' }),
                onClick: () => sendAdminMessage([record]),
              },
              {
                label: intl.formatMessage({ id: 'chat.channelList.list.rowAction.deleteChannel' }),
                onClick: () => deleteChannels([record]),
              },
            ]}
            stopClickEventPropagation={true}
            popperProps={{
              positionFixed: true,
              modifiers: {
                flip: { boundariesElement: 'window' },
                preventOverflow: { boundariesElement: 'window' },
              },
            }}
          />,
        ]
      : undefined,

    emptyView,
    batchActions,
  };
};
