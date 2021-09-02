import { useFeatureFlags } from './useFeatureFlags';
import { useTypedSelector } from './useTypedSelector';

export const useIsNCSoft = () => {
  const { flags } = useFeatureFlags();
  const uid = useTypedSelector((state) => state.organizations.current.uid);
  return uid === 'ee9b3f533bfe608437efe3cb023124f7af5d57e1' || flags.ncsoft;
};
