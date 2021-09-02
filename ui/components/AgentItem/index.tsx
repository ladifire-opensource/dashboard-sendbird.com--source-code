import React, { useMemo } from 'react';

import styled, { css } from 'styled-components';

import { AvatarProps, cssVariables, AvatarType, Avatar } from 'feather';
import escapeRegExp from 'lodash/escapeRegExp';

import { AgentType } from '@constants';
import { AgentBadge } from '@desk/containers/agents/AgentBadge';
import { useBotTypeLabel } from '@desk/hooks';

import { AgentActivationStatus } from '../AgentActivationStatus';
import { TextWithOverflowTooltip } from '../TextWithOverflowTooltip';

type Props = {
  agent: Agent | AgentDetail | AgentGroupMember;
  query?: string;
  shouldShowActivationStatus?: boolean;
  shouldShowConnection?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

const Item = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  max-width: 100%;
`;

const AgentContext = styled.div`
  flex: 1;
  width: calc(100% - 44px);
  margin-left: 12px;
`;

const AgentIdentity = styled.div`
  display: flex;
  align-items: center;
`;

const AgentProfile = styled.div<{ $shouldShowStatus: boolean }>`
  display: flex;
  align-items: center;
  flex: auto;
  max-width: ${({ $shouldShowStatus }) => ($shouldShowStatus ? 'calc(100% - 104px)' : '100%')};
`;

const AgentName = styled.span`
  display: block;
  max-width: calc(100% - 24px);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  color: ${cssVariables('neutral-10')};
  word-break: break-word;

  & > u {
    color: ${cssVariables('purple-7')};
    text-decoration: none;
    font-weight: 500;
    background-color: ${cssVariables('purple-2')};
  }
`;

const AgentEmailStyle = css`
  display: block;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-6')};
  font-style: normal;
  word-break: break-all;

  & > u {
    color: ${cssVariables('purple-7')};
    text-decoration: none;
    font-weight: 500;
    background-color: ${cssVariables('purple-2')};
  }
`;

const AgentBotType = styled.div`
  ${AgentEmailStyle}
`;

const AgentActivationStatusContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  flex: auto;
`;

const highlightQuery = ({ targetString, query }): React.ReactNode => {
  if (query && query.trim()) {
    const chunks = targetString.split(new RegExp(`(${escapeRegExp(query.trim())})`, 'i'));
    const formatted = chunks.map((chunk, index) => {
      if (chunk.toLowerCase() === query.toLowerCase()) {
        return <u key={`${chunk}${index}`}>{chunk}</u>;
      }
      return chunk;
    });

    return formatted;
  }
  return targetString;
};

const isAgentGroupMember = (agent: Props['agent']): agent is AgentGroupMember => {
  return typeof agent['botType'] === 'string';
};

export const AgentItem: React.FC<Props> = ({
  agent,
  query,
  shouldShowActivationStatus = false,
  shouldShowConnection = false,
  ...htmlDivAttributeProps
}) => {
  const { photoThumbnailUrl, displayName, email, tier, role, status, agentType } = agent;
  const getBotTypeLabel = useBotTypeLabel();

  const botType = useMemo(() => {
    if (isAgentGroupMember(agent)) {
      return agent.botType;
    }

    return agent.bot?.type;
  }, [agent]);

  return (
    <Item {...htmlDivAttributeProps}>
      <Avatar
        size={32}
        imageUrl={photoThumbnailUrl}
        profileID={email}
        status={
          shouldShowConnection && (agent as Agent | AgentDetail).connection
            ? ((agent as Agent | AgentDetail).connection.toLowerCase() as AvatarProps['status'])
            : undefined
        }
        type={agentType === AgentType.BOT ? AvatarType.Bot : AvatarType.Member}
      />
      <AgentContext>
        <AgentIdentity>
          <AgentProfile $shouldShowStatus={shouldShowActivationStatus}>
            <AgentName data-test-id="AgentName">
              <TextWithOverflowTooltip>{highlightQuery({ targetString: displayName, query })}</TextWithOverflowTooltip>
            </AgentName>
            <AgentBadge agentType={agentType} role={role} tier={tier} />
          </AgentProfile>
          {shouldShowActivationStatus && (
            <AgentActivationStatusContainer>
              <AgentActivationStatus status={status} />
            </AgentActivationStatusContainer>
          )}
        </AgentIdentity>
        {email && (
          <TextWithOverflowTooltip testId="AgentEmail" css={AgentEmailStyle}>
            {highlightQuery({ targetString: email, query })}
          </TextWithOverflowTooltip>
        )}
        {botType && <AgentBotType>{getBotTypeLabel(botType)}</AgentBotType>}
      </AgentContext>
    </Item>
  );
};
