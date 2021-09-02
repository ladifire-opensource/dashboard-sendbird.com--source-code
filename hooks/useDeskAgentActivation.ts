import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { toast } from 'feather';

import { deskApi } from '@api';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { AgentActivationStatusValue } from '@constants';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useAsync } from '@hooks';

import { useShowDialog } from './useShowDialog';

type Params = Omit<AgentActivationStatusChangeDialogProps, 'agentId' | 'fromStatus' | 'toStatus'>;

const usePauseAgent = ({ onSuccess }: Pick<Params, 'onSuccess'>) => {
  const intl = useIntl();
  const { pid, region } = useProjectIdAndRegion();
  const [isFetching, setIsFetching] = useState(false);
  const [{ data, error, status }, pauseAgentRequest] = useAsync(
    (agentId: Agent['id']) => {
      setIsFetching(true);
      return deskApi.updateAgentStatus(pid, region, { status: AgentActivationStatusValue.PAUSED, agentId });
    },
    [pid, region],
  );

  useEffect(() => {
    if (isFetching && status === 'success' && data) {
      toast.success({ message: intl.formatMessage({ id: 'desk.agent.status.update.toast.success' }) });
      onSuccess?.(data.data);
      setIsFetching(false);
      return;
    }
  }, [data, error, intl, isFetching, onSuccess, status]);

  useEffect(() => {
    if (isFetching && status === 'error') {
      toast.error({ message: intl.formatMessage({ id: 'desk.agent.status.update.toast.fail' }) });
      setIsFetching(false);
      return;
    }
  }, [data, intl, isFetching, status]);

  return useCallback((agent: Agent) => pauseAgentRequest(agent.id), [pauseAgentRequest]);
};

export const useDeskAgentActivation = (dialogProps: Params) => {
  const showDialog = useShowDialog();
  const { onSuccess, onDialogClose } = dialogProps;
  const activateAgent = useCallback(
    (agent: Agent, dialogProps?: Params) => {
      showDialog({
        dialogTypes: DialogType.AgentActivationStatusChange,
        dialogProps: {
          agentId: agent.id,
          fromStatus: agent.status,
          toStatus: AgentActivationStatusValue.ACTIVE,
          onSuccess,
          onDialogClose,
          ...dialogProps,
        },
      });
    },
    [onDialogClose, onSuccess, showDialog],
  );

  const deactivateAgent = useCallback(
    (agent: Agent, dialogProps?: Params) => {
      showDialog({
        dialogTypes: DialogType.AgentActivationStatusChange,
        dialogProps: {
          agentId: agent.id,
          fromStatus: agent.status,
          toStatus: AgentActivationStatusValue.INACTIVE,
          onSuccess,
          onDialogClose,
          ...dialogProps,
        },
      });
    },
    [onDialogClose, onSuccess, showDialog],
  );

  const pauseAgent = usePauseAgent(useMemo(() => ({ onSuccess }), [onSuccess]));

  return useCallback(
    (agent: Agent, toStatus: AgentActivationStatusValue, callbacks?: Params) => {
      switch (toStatus) {
        case AgentActivationStatusValue.PAUSED:
          return pauseAgent(agent);
        case AgentActivationStatusValue.ACTIVE:
          return activateAgent(agent, callbacks);
        case AgentActivationStatusValue.INACTIVE:
          return deactivateAgent(agent, callbacks);
        default:
          return;
      }
    },
    [activateAgent, deactivateAgent, pauseAgent],
  );
};
