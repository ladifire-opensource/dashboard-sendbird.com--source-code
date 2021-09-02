import { memo } from 'react';

import { AvatarProps } from 'feather';

import { AgentType } from '@constants';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import DeskBotAvatar from '@desk/components/DeskBotAvatar';

type AgentAvatarByTypeProps = {
  agent?: Pick<Agent, 'sendbirdId' | 'photoThumbnailUrl' | 'connection' | 'email' | 'agentType'> | null;
  size?: AvatarProps['size'];
  isBotOnly?: boolean;
};

const DeskAgentAvatarByType = memo<AgentAvatarByTypeProps>(({ agent, size = 'medium', isBotOnly }) => {
  const isBot = agent?.agentType === AgentType.BOT;
  if (isBotOnly || isBot) {
    return (
      <DeskBotAvatar
        size={size}
        profileID={agent?.sendbirdId ?? ''}
        imageUrl={agent?.photoThumbnailUrl}
        status={agent?.connection?.toLowerCase() as AvatarProps['status']}
      />
    );
  }
  return (
    <DeskAgentAvatar
      size={size}
      profileID={agent?.email ?? ''}
      imageUrl={agent?.photoThumbnailUrl}
      status={agent?.connection?.toLowerCase() as AvatarProps['status']}
    />
  );
});

export default DeskAgentAvatarByType;
