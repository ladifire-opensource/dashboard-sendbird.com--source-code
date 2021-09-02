import { useMemo, useReducer, useCallback, Dispatch } from 'react';

import { usePrevious } from '@hooks';

type Action = { [P in keyof AgentViewGlobalState]?: AgentViewGlobalState[P] };

type AgentViewGlobalState = {
  assignmentLogs: AssignmentLog[];
  refresh: Refresh;
};

const initState: AgentViewGlobalState = {
  assignmentLogs: [],
  refresh: {
    isAutomatic: false,
    automaticItem: {
      label: '10 Seconds',
      seconds: 10,
    },
  },
};

export type AgentViewGlobalContext = {
  state: AgentViewGlobalState;
  setState: Dispatch<Action>;
  updateIsAutomatic: (value: Refresh['isAutomatic']) => void;
  updateAutomaticItem: (value: Refresh['automaticItem']) => void;
};

export const initialAgentViewGlobalContextValue: AgentViewGlobalContext = {
  state: initState,
  setState: () => {},
  updateIsAutomatic: () => {},
  updateAutomaticItem: () => {},
};

const reducer: Reducer<AgentViewGlobalState, Action> = (prevState, updatedProperty) => ({
  ...prevState,
  ...updatedProperty,
});

export const useAgentViewGlobalContext = (): AgentViewGlobalContext => {
  const [state, setState] = useReducer(reducer, initState);
  const prevState = usePrevious(state);

  const updateIsAutomatic = useCallback(
    (value: boolean) => {
      if (prevState) {
        setState({ refresh: { ...prevState.refresh, isAutomatic: value } });
      }
    },
    [prevState],
  );

  const updateAutomaticItem = useCallback(
    (value: Refresh['automaticItem']) => {
      if (prevState) {
        setState({ refresh: { ...prevState.refresh, automaticItem: value } });
      }
    },
    [prevState],
  );

  return useMemo(() => ({ state, setState, updateIsAutomatic, updateAutomaticItem }), [
    state,
    setState,
    updateIsAutomatic,
    updateAutomaticItem,
  ]);
};
