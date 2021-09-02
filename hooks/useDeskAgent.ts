import { useShallowEqualSelector } from './useTypedSelector';

export const useDeskAgent: () => AgentDetail = () => useShallowEqualSelector((state) => state.desk.agent);
