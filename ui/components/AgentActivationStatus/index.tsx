import { memo, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Icon, cssVariables, transitions } from 'feather';

import { AgentActivationStatusValue, AgentType } from '@constants';
import { getAgentStatusLabelKey } from '@utils';

import { AgentActivationContextualHelp } from './AgentActivationContextualHelp';
import { getAgentActivationIconProps } from './getAgentActivationIcon';

type Props = {
  className?: string;
  hasContextualHelp?: boolean;
  agentType?: AgentType;
  status: AgentActivationStatusValue;
  disabled?: boolean;
};

const AgentActivationStatusLabel = styled.label`
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  transition: ${transitions({ duration: 0.3, properties: ['color'] })};
`;

const AgentActivationStatusContainer = styled.span<{ $disabled: boolean }>`
  display: inline-flex;
  align-items: center;

  ${AgentActivationStatusLabel} {
    color: ${({ $disabled }) => ($disabled ? cssVariables('neutral-5') : cssVariables('neutral-10'))};
  }
`;

export const AgentActivationStatus = memo<Props>(
  ({ className, hasContextualHelp: isContextualHelp, agentType, status, disabled = false }) => {
    const intl = useIntl();
    const agentActivationIconProps = getAgentActivationIconProps({ status });

    const icon = useMemo(() => <Icon {...agentActivationIconProps} />, [agentActivationIconProps]);

    return (
      <AgentActivationStatusContainer className={className} data-test-id="AgentActivationStatus" $disabled={disabled}>
        {isContextualHelp ? (
          <AgentActivationContextualHelp wrapperHeight={16} agentType={agentType}>
            {icon}
          </AgentActivationContextualHelp>
        ) : (
          icon
        )}
        <AgentActivationStatusLabel data-test-id="AgentActivationStatusLabel">
          {intl.formatMessage({ id: getAgentStatusLabelKey(status) })}
        </AgentActivationStatusLabel>
      </AgentActivationStatusContainer>
    );
  },
);
