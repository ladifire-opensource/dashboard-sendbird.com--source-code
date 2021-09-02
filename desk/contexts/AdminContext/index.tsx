import React, { useMemo } from 'react';

import { defaultAgentDetail, useAgentDetail, AgentDetail } from './useAgentDetail';

export type AdminContextValue = {
  agentDetail: {
    data: AgentDetail;
    isFetching: boolean;
    setSelectedAgent: (agentId: Agent['id']) => void;
    resetAgentDetail: () => void;
    updateAgentData: (agent: Agent) => void;
  };
};

export const AdminContext = React.createContext<AdminContextValue>({
  agentDetail: {
    data: defaultAgentDetail,
    isFetching: false,
    setSelectedAgent: () => {},
    resetAgentDetail: () => {},
    updateAgentData: () => {},
  },
});

export const AdminContextProvider: React.FC = ({ children }) => {
  const { agentDetailData, isFetching, updateAgentData, setSelectedAgent, resetAgentDetail } = useAgentDetail();

  return (
    <AdminContext.Provider
      value={useMemo(
        () => ({
          agentDetail: {
            data: agentDetailData,
            isFetching,
            updateAgentData,
            setSelectedAgent,
            resetAgentDetail,
          },
        }),
        [agentDetailData, isFetching, resetAgentDetail, setSelectedAgent, updateAgentData],
      )}
    >
      {children}
    </AdminContext.Provider>
  );
};
