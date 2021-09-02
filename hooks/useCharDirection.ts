import { useSelector } from 'react-redux';

import { TAKEAWAY } from '@constants/uids';

import { useFeatureFlags } from './useFeatureFlags';

const rtlAllowUids = [TAKEAWAY];

export const useCharDirection = () => {
  const { uid } = useSelector((state: RootState) => state.organizations.current);
  const {
    flags: { rtl },
  } = useFeatureFlags();
  const isEnabled = rtlAllowUids.includes(uid) || !!rtl;
  return isEnabled ? 'auto' : 'ltr';
};
