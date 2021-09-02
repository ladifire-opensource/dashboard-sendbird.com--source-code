import { useState, useEffect, useCallback, useMemo } from 'react';

import { toast } from 'feather';
import moment from 'moment-timezone';

import { deskApi } from '@api';
import { ISO_DATE_FORMAT } from '@constants';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

export type AgentDetail = {
  agentId: Agent['id'] | null;
  agent: Agent | null;
  data: {
    numberOfAssignments: number;
    averageResponseTime: number;
    recentTickets: readonly Ticket[];
    onlineDuration: number;
    awayDuration: number;
    connectionLogs: readonly AgentConnectionLog[];
  } | null;
};

export const defaultAgentDetail = {
  agentId: null,
  agent: null,
  data: null,
};

export const useAgentDetail = () => {
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const [isFetching, setIsFetching] = useState(false);
  const [agentDetail, setAgentDetail] = useState<AgentDetail>(defaultAgentDetail);

  const setSelectedAgent = useCallback((agentId: Agent['id']) => {
    setAgentDetail((prevAgentDetail) => ({
      ...prevAgentDetail,
      agentId,
    }));
  }, []);

  const updateAgentData = useCallback((agent: Agent) => {
    setAgentDetail((prevAgentDetail) => ({
      ...prevAgentDetail,
      agent,
    }));
  }, []);

  const resetAgentDetail = useCallback(() => {
    setAgentDetail(defaultAgentDetail);
  }, []);

  const { agentId } = agentDetail;

  const fetchAgentDetailRequest = useCallback(async () => {
    const today = moment().format(ISO_DATE_FORMAT);
    const dateRangeParams = { start_date: today, end_date: today };

    if (agentId) {
      setIsFetching(true);
      Promise.all([
        deskApi.fetchAgent(pid, region, { agentId }),
        deskApi.fetchAgentTicketsAPI(pid, region, {
          agentId,
          params: {
            offset: 0,
            limit: 3,
            order: '-last_message_at',
          },
        }),
        deskApi.fetchAgentStat(pid, region, {
          id: agentId,
          ...dateRangeParams,
        }),

        deskApi.fetchAgentStatConnectionLogsTime(pid, region, {
          id: agentId,
          ...dateRangeParams,
        }),

        deskApi.fetchAgentStatConnectionLogs(pid, region, {
          id: agentId,
          date: today,
        }),
      ])
        .then(
          ([
            agentResponse,
            agentTicketsResponse,
            agentStatResponse,
            agentStatConnectionLogsTimeResponse,
            agentStatConnectionLogsResponse,
          ]) => {
            const { data: agent } = agentResponse;
            const {
              data: { results: recentTickets },
            } = agentTicketsResponse;
            const {
              data: { averageResponseTime, numberOfAssignments },
            } = agentStatResponse;
            const {
              data: { ONLINE: onlineDuration, AWAY: awayDuration },
            } = agentStatConnectionLogsTimeResponse;
            const {
              data: { connectionLogs, previousConnectionLog },
            } = agentStatConnectionLogsResponse;
            setAgentDetail((prevAgentDetail) => ({
              ...prevAgentDetail,
              agent,
              data: {
                numberOfAssignments,
                recentTickets,
                averageResponseTime,
                onlineDuration,
                awayDuration,
                connectionLogs: [previousConnectionLog, ...connectionLogs],
              },
            }));
            setIsFetching(false);
          },
        )
        .catch((error) => {
          toast.error({ message: getErrorMessage(error) });
          setIsFetching(false);
        });
    }
  }, [agentId, getErrorMessage, pid, region]);

  useEffect(() => {
    fetchAgentDetailRequest();

    return resetAgentDetail;
  }, [fetchAgentDetailRequest, resetAgentDetail]);

  return useMemo(
    () => ({ agentDetailData: agentDetail, isFetching, updateAgentData, setSelectedAgent, resetAgentDetail }),
    [agentDetail, isFetching, setSelectedAgent, resetAgentDetail, updateAgentData],
  );
};
