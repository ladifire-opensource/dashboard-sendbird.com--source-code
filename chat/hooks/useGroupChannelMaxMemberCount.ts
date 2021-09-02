import { useCallback } from 'react';

import { useTypedSelector } from '@hooks';

import { useGroupChannelJoinedMemberCount } from './useGroupChannelJoinedMemberCount';
import { useSupergroupFeature } from './useSupergroupFeature';

const useBroadcastChannelCapacity = () => {
  const isBroadcastChannelEnabled = useTypedSelector((state) => {
    const attributes = state.applicationState.data?.attrs;
    if (!attributes) {
      return false;
    }
    const { allow_super_group_channel, allow_broadcast_channel } = attributes.acl;
    return allow_super_group_channel && allow_broadcast_channel;
  });

  const maxMemberCount = useTypedSelector((state) => {
    return state.applicationState.data?.attrs.item_limit.broadcast_member_cnt;
  });

  return { isBroadcastChannelEnabled, maxMemberCount };
};

export const useGroupChannelMaxMemberCount = () => {
  const groupChannelJoinedMemberCount = useGroupChannelJoinedMemberCount();
  const { isBroadcastChannelEnabled, maxMemberCount: broadcastChannelMemberLimit } = useBroadcastChannelCapacity();
  const { isSupergroupEnabled, supergroupMemberLimit } = useSupergroupFeature();
  const getMaxMemberCount = useCallback(
    (channel: Pick<GroupChannel, 'is_super' | 'is_exclusive'>) => {
      if (channel.is_exclusive && isBroadcastChannelEnabled && typeof broadcastChannelMemberLimit === 'number') {
        return broadcastChannelMemberLimit;
      }
      if (channel.is_super && isSupergroupEnabled) {
        return supergroupMemberLimit;
      }
      return groupChannelJoinedMemberCount;
    },
    [
      broadcastChannelMemberLimit,
      groupChannelJoinedMemberCount,
      isBroadcastChannelEnabled,
      isSupergroupEnabled,
      supergroupMemberLimit,
    ],
  );

  return getMaxMemberCount;
};
