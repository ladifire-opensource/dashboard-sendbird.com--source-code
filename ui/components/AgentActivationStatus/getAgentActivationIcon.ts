import { cssVariables } from 'feather';

import { AgentActivationStatusValue } from '../../../constants/desk';

type GetAgentActivationIconProps = (params: {
  status: AgentActivationStatusValue;
  size?: number;
}) => {
  icon: 'success-filled' | 'success' | 'error-filled' | 'pause-filled' | 'remove-filled';
  color: string;
  size: number;
};

export const getAgentActivationIconProps: GetAgentActivationIconProps = ({ status, size = 16 }) => {
  switch (status) {
    case AgentActivationStatusValue.ACTIVE:
      return {
        icon: 'success-filled' as const,
        color: cssVariables('green-6'),
        size,
      };
    case AgentActivationStatusValue.PENDING:
      return {
        icon: 'error-filled' as const,
        color: cssVariables('yellow-5'),
        size,
      };
    case AgentActivationStatusValue.INACTIVE:
      return {
        icon: 'success-filled' as const,
        color: cssVariables('neutral-5'),
        size,
      };
    case AgentActivationStatusValue.PAUSED:
      return {
        icon: 'pause-filled' as const,
        color: cssVariables('neutral-5'),
        size,
      };
    case AgentActivationStatusValue.DELETED:
      return {
        icon: 'remove-filled' as const,
        color: cssVariables('neutral-6'),
        size,
      };
    default:
      return {
        icon: 'success-filled' as const,
        color: cssVariables('neutral-5'),
        size,
      };
  }
};
