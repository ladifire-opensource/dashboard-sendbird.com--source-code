import { useSelector } from 'react-redux';

import { WOOWAHAN } from '@constants/uids';

import { useFeatureFlags } from './useFeatureFlags';

export const useIsWoowahan = () => {
  const { uid } = useSelector((state: RootState) => state.organizations.current);
  const {
    flags: { mockWoowahan },
  } = useFeatureFlags();
  return uid === WOOWAHAN || !!mockWoowahan;
};
