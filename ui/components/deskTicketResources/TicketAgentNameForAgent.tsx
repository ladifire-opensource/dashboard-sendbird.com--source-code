import { memo } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { EMPTY_TEXT } from '@constants';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';

const AgentNameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const AvatarWrapper = styled.div`
  flex: none;
`;

const DisplayName = styled.div`
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: ${cssVariables('neutral-10')};
  margin-left: 8px;
  word-break: break-word;
`;

const getAgentStatus = (connection: Agent['connection']) => {
  switch (connection) {
    case 'AWAY':
      return 'away';
    case 'OFFLINE':
      return 'offline';
    case 'ONLINE':
      return 'online';
    default:
      return undefined;
  }
};

type Props = {
  agent: AgentSummary | undefined;
};

export const TicketAgentNameForAgent = memo<Props>(({ agent }) => {
  if (!agent) {
    return <>{EMPTY_TEXT}</>;
  }

  return (
    <AgentNameWrapper>
      <AvatarWrapper>
        <DeskAgentAvatar
          size="small"
          profileID={agent.id}
          status={getAgentStatus(agent.connection)}
          imageUrl={agent.photoThumbnailUrl}
        />
      </AvatarWrapper>
      <DisplayName>{agent.displayName}</DisplayName>
    </AgentNameWrapper>
  );
});
