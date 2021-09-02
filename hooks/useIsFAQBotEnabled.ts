import { useSelector } from 'react-redux';

import { BASIC_FAQ_BOT_ALLOWED_LIST } from '@constants/uids';

import { useFeatureFlags } from './useFeatureFlags';

export const useIsFAQBotEnabled = () => {
  const { uid } = useSelector((state: RootState) => state.organizations.current);
  const {
    flags: { deskFAQBot },
  } = useFeatureFlags();
  return BASIC_FAQ_BOT_ALLOWED_LIST.includes(uid) || !!deskFAQBot;
};
