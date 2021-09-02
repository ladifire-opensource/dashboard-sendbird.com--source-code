import { useAuthorization } from '@hooks';

const usePermissions = (channelType: ChannelType) => {
  const { isPermitted } = useAuthorization();
  const hasAllPermissions = isPermitted([
    channelType === 'group_channels' ? 'application.channels.groupChannel.all' : 'application.channels.openChannel.all',
  ]);
  const canChat = isPermitted([
    channelType === 'group_channels'
      ? 'application.channels.groupChannel.chat'
      : 'application.channels.openChannel.chat',
  ]);
  const canModerate = hasAllPermissions || canChat;

  return { hasAllPermissions, canModerate };
};

export default usePermissions;
