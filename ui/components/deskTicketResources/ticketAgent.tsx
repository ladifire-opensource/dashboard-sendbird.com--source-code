import { memo, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';

import { EMPTY_TEXT } from '@constants';
import DeskAgentAvatar from '@desk/components/DeskAgentAvatar';
import { AdminContext } from '@desk/contexts/AdminContext';
import { useAppId } from '@hooks/useAppId';
import { useAuthorization } from '@hooks/useAuthorization';

import { ConnectionLabel } from '../connectionLabel';
import { DrawerContext } from '../drawer';

const AgentNameStyle = css`
  font-weight: 500;
  font-size: 14px;
  color: ${cssVariables('neutral-10')};
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ${transitionDefault};

  &:hover {
    cursor: pointer;
    color: ${cssVariables('purple-7')};
    text-decoration: underline;
  }
`;

const AgentStatus = styled(ConnectionLabel)`
  margin-top: 2px;
  margin-right: 8px;
`;

const AgentName = styled.span`
  ${AgentNameStyle}

  ${(props) =>
    props.onClick === undefined &&
    css`
      &:hover {
        cursor: initial;
        text-decoration: none;
        color: inherit;
      }
    `}
`;

const AgentLinkName = styled(Link)`
  ${AgentNameStyle}
`;

const StyledAvatar = styled(DeskAgentAvatar)`
  margin-right: 10px;
`;

const AgentWrapper = styled.div<{ $isShowAgentThumbnail: boolean }>`
  display: flex;
  align-items: center;
  overflow-x: hidden;

  ${AgentName},
  ${AgentLinkName} {
    max-width: calc(100% - ${({ $isShowAgentThumbnail }) => ($isShowAgentThumbnail ? 24 : 16)}px);
  }
`;

export const getAgentStatus = (agent: Pick<Agent, 'connection'>) => {
  switch (agent.connection) {
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
  agent: AgentSummary | undefined | null;
  isLinkedToAgentDetailPage?: boolean;
  isShowAgentThumbnail?: boolean;
};

export const TicketAgent = memo<Props>(({ agent, isLinkedToAgentDetailPage = false, isShowAgentThumbnail = false }) => {
  const appId = useAppId();
  const { isPermitted } = useAuthorization();
  const isAdmin = isPermitted(['desk.admin']);

  const {
    agentDetail: { setSelectedAgent },
  } = useContext(AdminContext);
  const { openDrawer } = useContext(DrawerContext);

  const handleAgentClick = useCallback(() => {
    if (agent) {
      openDrawer('agent');
      setSelectedAgent(agent.id);
    }
  }, [agent, openDrawer, setSelectedAgent]);

  if (!agent) {
    return <>{EMPTY_TEXT}</>;
  }

  return (
    <AgentWrapper $isShowAgentThumbnail={isShowAgentThumbnail}>
      {isShowAgentThumbnail ? (
        <StyledAvatar
          size="small"
          profileID={agent.id}
          imageUrl={agent.photoThumbnailUrl}
          status={getAgentStatus(agent)}
        />
      ) : (
        <AgentStatus connection={agent.connection} />
      )}

      {isLinkedToAgentDetailPage ? (
        <AgentLinkName to={`${appId}/desk/agents/${agent.id}`}>{agent.displayName}</AgentLinkName>
      ) : (
        <AgentName onClick={isAdmin ? handleAgentClick : undefined}>{agent.displayName}</AgentName>
      )}
    </AgentWrapper>
  );
});
