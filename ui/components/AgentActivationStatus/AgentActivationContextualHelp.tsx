import React from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, ContextualHelp, Icon, TooltipProps } from 'feather';

import { AgentActivationStatusValue, AgentType } from '@constants';

import { getAgentActivationIconProps } from './getAgentActivationIcon';

const ContextualHelpTooltip = styled(ContextualHelp)<{ wrapperHeight?: number }>`
  display: inline-block;
  height: ${({ wrapperHeight }) => (wrapperHeight && wrapperHeight > -1 ? `${wrapperHeight}px` : 'auto')};
`;

const AgentActivationGuideContainer = styled.ul`
  padding: 16px 0 8px;
`;

const AgentActivationGuideList = styled.li`
  display: flex;

  & + & {
    margin-top: 16px;
  }
`;

const AgentActivationStatusIcon = styled(Icon)`
  margin-top: 2px;
`;

const AgentActivationGuideText = styled.span`
  display: inline-block;
  flex: 1;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${cssVariables('neutral-7')};

  b {
    font-weight: 600;
  }

  ${AgentActivationStatusIcon} + & {
    margin-left: 8px;
  }
`;

type AgentActivationGuideItemProps = {
  status: AgentActivationStatusValue;
  guideContent: React.ReactNode;
};

type Props = {
  children?: React.ReactChild;
  placement?: TooltipProps['placement'];
  agentType?: AgentType;
  wrapperHeight?: number;
  popperProps?: TooltipProps['popperProps'];
};

type AgentActivationGuide = {
  status: AgentActivationStatusValue;
  intlKey: Record<AgentType, string>;
};

export const agentActivationGuides: AgentActivationGuide[] = [
  {
    status: AgentActivationStatusValue.ACTIVE,
    intlKey: {
      [AgentType.USER]: 'desk.agent.status.guide.userAgent.active',
      [AgentType.BOT]: 'desk.agent.status.guide.botAgent.active',
    },
  },
  {
    status: AgentActivationStatusValue.INACTIVE,
    intlKey: {
      [AgentType.USER]: 'desk.agent.status.guide.userAgent.inactive',
      [AgentType.BOT]: 'desk.agent.status.guide.botAgent.inactive',
    },
  },
  {
    status: AgentActivationStatusValue.PENDING,
    intlKey: {
      [AgentType.USER]: 'desk.agent.status.guide.userAgent.pending',
      [AgentType.BOT]: 'desk.agent.status.guide.botAgent.pending',
    },
  },
  {
    status: AgentActivationStatusValue.PAUSED,
    intlKey: {
      [AgentType.USER]: 'desk.agent.status.guide.userAgent.pause',
      [AgentType.BOT]: 'desk.agent.status.guide.botAgent.pause',
    },
  },
];

const ContentContainer = styled.div`
  text-align: left;
`;

const AgentActivationGuideItem = React.memo<AgentActivationGuideItemProps>(({ status, guideContent }) => {
  const agentActivationIconProps = getAgentActivationIconProps({ status });

  return (
    <AgentActivationGuideList>
      <AgentActivationStatusIcon {...agentActivationIconProps} />
      <AgentActivationGuideText>{guideContent}</AgentActivationGuideText>
    </AgentActivationGuideList>
  );
});

export const AgentActivationContextualHelp = React.memo<Props>(
  ({ children, placement = 'bottom-end', agentType = AgentType.USER, wrapperHeight, popperProps }) => {
    const intl = useIntl();

    return (
      <ContextualHelpTooltip
        placement={placement}
        wrapperHeight={wrapperHeight}
        content={
          <ContentContainer>
            <AgentActivationGuideText>
              <b>{intl.formatMessage({ id: 'desk.agent.status.guide.title' })}</b>
            </AgentActivationGuideText>
            <AgentActivationGuideContainer>
              {agentActivationGuides.map(({ status, intlKey }) => {
                const guideContent = intlKey ? (
                  <>{intl.formatMessage({ id: intlKey[agentType] }, { b: (text) => <b>{text}</b> })}</>
                ) : (
                  status
                );
                return <AgentActivationGuideItem key={status} status={status} guideContent={guideContent} />;
              })}
            </AgentActivationGuideContainer>
          </ContentContainer>
        }
        popperProps={{
          modifiers: {
            offset: {
              offset: '20, 4',
            },
          },
          ...popperProps,
        }}
        tooltipContentStyle={css`
          width: 360px;
          word-break: break-word;
        `}
      >
        {children}
      </ContextualHelpTooltip>
    );
  },
);
