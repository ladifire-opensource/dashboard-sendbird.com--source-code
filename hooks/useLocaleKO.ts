import { useSelector } from 'react-redux';

import { SENDBIRD_LION, SENDBIRD_YONGJUN, HIPHOPER, PETDOC, SENDBIRD_ASTIN, MEDIBLOC } from '@constants/uids';

import { useAuthorization } from './useAuthorization';
import { useFeatureFlags } from './useFeatureFlags';
import { useIsWoowahan } from './useIsWoowahan';

const allowedList = [SENDBIRD_YONGJUN, SENDBIRD_LION, SENDBIRD_ASTIN, HIPHOPER, PETDOC, MEDIBLOC];

export const useLocaleKO = () => {
  const { isPermitted } = useAuthorization();
  const isWoowahan = useIsWoowahan();
  const { uid } = useSelector((state: RootState) => state.organizations.current);
  const {
    flags: { deskIntlKo },
  } = useFeatureFlags();
  const isAllowed = isPermitted(['desk.agent', 'desk.admin']) && (allowedList.includes(uid) || isWoowahan);

  return deskIntlKo || isAllowed;
};
