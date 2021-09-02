import { DEFAULT_GROUP_CHANNEL_MEMBER_LIMIT } from '@chat/constants';
import { useTypedSelector } from '@hooks';

/**
 * @returns the maximum number of joined members of a group channel
 */
export const useGroupChannelJoinedMemberCount = () =>
  useTypedSelector(
    (state) =>
      state.applicationState.data?.attrs.item_limit.group_joined_member_cnt ?? DEFAULT_GROUP_CHANNEL_MEMBER_LIMIT,
  );
