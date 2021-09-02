import { push, goBack } from 'connected-react-router';

export const HistoryActions = {
  pushHistory: push,
  backHistory: goBack,
};
