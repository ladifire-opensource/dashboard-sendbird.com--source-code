import { AvatarProps } from 'feather';

export const convertAgentConnectionToAvatarStatus = (connection: Agent['connection']) => {
  try {
    return connection.toLowerCase() as AvatarProps['status'];
  } catch (error) {
    return undefined;
  }
};
