import { useContext } from 'react';

import { UserProfilePopupContext } from '../UserProfilePopupContextProvider';
import usePermissions from './usePermissions';
import useUserActions from './useUserActions';

const useDeactivateAction = (user?: DeactivateUserDialogProps['selectedUsers'][number]) => {
  const { closeProfilePopup, notifyChange, channelType } = useContext(UserProfilePopupContext);
  const { hasAllPermissions } = usePermissions(channelType);
  const { deactivateUser } = useUserActions();

  if (!hasAllPermissions) return undefined;

  return {
    current: false,
    handler: () => {
      if (!user) {
        return;
      }
      deactivateUser(user, () => {
        notifyChange('deactivate', { userId: user.userId });
        closeProfilePopup();
      });
    },
  };
};

export default useDeactivateAction;
