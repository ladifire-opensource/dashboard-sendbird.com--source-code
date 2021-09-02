import { SPOTV } from '@constants/uids';

import { useFeatureFlags } from './useFeatureFlags';
import { useTypedSelector } from './useTypedSelector';

export const useIsSpotv = () => {
  const organizationUid = useTypedSelector((state) => state.organizations.current.uid);
  const {
    flags: { spotv },
  } = useFeatureFlags();
  return organizationUid === SPOTV || !!spotv;
};
