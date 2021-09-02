import { useState, useCallback } from 'react';

import { useTypedSelector } from '@hooks';

/**
 * Load a channel object from Sendbird SDK
 *
 * @param channelUrl The URL of the channel to load from SDK
 * @param channelType `open_channels` or `group_channels`
 * @returns SDK channel loading status and SDK channel object if available
 */
const useSdkChannel = <
  T extends ChannelType,
  TypedSDKChannel = T extends 'open_channels' ? SendBird.OpenChannel : SendBird.GroupChannel
>({
  channelUrl,
  channelType,
}: {
  channelUrl: string;
  channelType: T;
}) => {
  const isConnected = useTypedSelector((state) => state.sendbird.isConnected);
  const [{ status, channel, error }, setState] = useState<{
    status: 'init' | 'loading' | 'success' | 'fail';
    channel?: SendBird.GroupChannel | SendBird.OpenChannel;
    error?: any;
  }>({
    status: 'init',
  });

  const loadSdkChannel = useCallback(async () => {
    if (isConnected) {
      try {
        setState({ status: 'loading' });

        const channel = await (channelType === 'open_channels'
          ? window.dashboardSB.OpenChannel.getChannel(channelUrl)
          : window.dashboardSB.GroupChannel.getChannel(channelUrl));

        setState({ channel, status: 'success' });
      } catch (error) {
        setState({ channel: undefined, status: 'fail', error });
      }
    }
  }, [channelType, channelUrl, isConnected]);

  const updateSdkChannel = useCallback((updatedChannel: SendBird.GroupChannel | SendBird.OpenChannel) => {
    setState({ channel: updatedChannel, status: 'success' });
  }, []);

  return { loadSdkChannel, updateSdkChannel, status, channel: channel as TypedSDKChannel | undefined, error };
};

export default useSdkChannel;
