import { useCallback, useState } from 'react';

import { freezeChannel } from '@chat/api';
import { useAppId } from '@hooks';

/**
 * @returns async function `setChannelFreeze({ channelType, channelUrl, freeze })`
 * that returns a channel resource if succeeds, or throws an exception
 */
export const useFreezeChannel = <T extends ChannelType>() => {
  const [isUpdating, setIsUpdating] = useState(false);
  const appId = useAppId();
  const setChannelFreeze = useCallback(
    async ({ channelType, channelUrl, freeze }: { channelType: T; channelUrl: string; freeze: boolean }) => {
      setIsUpdating(true);
      try {
        const { data: channel } = await freezeChannel({ appId, freeze, channelUrl, channelType });
        setIsUpdating(false);
        return channel;
      } catch (error) {
        setIsUpdating(false);
        throw error;
      }
    },
    [appId],
  );

  return { isUpdating, setChannelFreeze };
};
