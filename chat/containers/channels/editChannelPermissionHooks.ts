import { useAuthorization } from '@hooks';

export const useCanEditGroupChannels = () => {
  const { isPermitted } = useAuthorization();
  return isPermitted(['application.channels.groupChannel.all']);
};

export const useCanEditOpenChannels = () => {
  const { isPermitted } = useAuthorization();
  return isPermitted(['application.channels.openChannel.all']);
};
