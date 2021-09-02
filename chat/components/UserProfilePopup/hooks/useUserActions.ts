import { useContext } from 'react';
import { useDispatch } from 'react-redux';

import { commonActions, chatActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';

import { UserProfilePopupContext } from '../UserProfilePopupContextProvider';

const useUserActions = () => {
  const { channelType, channelUrl } = useContext(UserProfilePopupContext);

  const dispatch = useDispatch();
  const banUser = (user: BanMuteUserDialogProps['user'], onSuccess: () => void) => {
    if (channelUrl) {
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.BanMuteUser,
          dialogProps: { action: 'ban', channelType, user, channelUrl, onSuccess },
        }),
      );
    }
  };

  const unbanUser = ({ userId }: { userId: string }, onSuccess: () => void) => {
    dispatch(
      chatActions.unbanUserRequest({
        origin: channelType,
        userId,
        channelUrl,
        onSuccess,
      }),
    );
  };

  const muteUser = (user: BanMuteUserDialogProps['user'], onSuccess: () => void) => {
    if (channelUrl) {
      dispatch(
        commonActions.showDialogsRequest({
          dialogTypes: DialogType.BanMuteUser,
          dialogProps: { action: 'mute', channelType, user, channelUrl, onSuccess },
        }),
      );
    }
  };

  const unmuteUser = ({ userId }: { userId: string }, onSuccess: () => void) => {
    dispatch(
      chatActions.unmuteUserRequest({
        origin: channelType,
        userId,
        channelUrl,
        onSuccess,
      }),
    );
  };

  const deactivateUser = (user: DeactivateUserDialogProps['selectedUsers'][number], onSuccess: () => void) => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.DeactivateUser,
        dialogProps: {
          selectedUsers: [user],
          onSuccess,
        },
      }),
    );
  };
  return { banUser, unbanUser, muteUser, unmuteUser, deactivateUser };
};

export default useUserActions;
