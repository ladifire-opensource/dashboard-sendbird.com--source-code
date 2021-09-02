import { ClientStorage } from '@utils';

const KEY = 'deskAgentOnboardingFinished';

const getFinishedAgentId = () => {
  const data = ClientStorage.get(KEY);
  try {
    if (!data) return {};

    const parsed = JSON.parse(data);

    return typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
};

const isFinished = (agentId: Agent['id']) => !!getFinishedAgentId()[agentId];

const appendFinished = (agentId: Agent['id']) => {
  const prev = getFinishedAgentId();
  ClientStorage.set(KEY, JSON.stringify({ ...prev, [agentId]: true }));
};

export const DeskAgentOnboardingLocalStorageUtils = { isFinished, appendFinished };
