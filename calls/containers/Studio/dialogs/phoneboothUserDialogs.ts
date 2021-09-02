import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { snakeCaseKeys } from '@utils';

import { PhoneboothUser } from './usePhoneboothUser';

export const useUpdateSDKUserDialog = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const openUpdateSDKUserDialog = (user: PhoneboothUser) => {
    const sdkUser = snakeCaseKeys<typeof user, SDKUser>(user);
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.UpdateSDKUser,
        dialogProps: {
          dialogTitle: intl.formatMessage({ id: 'calls.studio.editUserDialog_title' }),
          dialogDescription: '',
          sdkUser,
        },
      }),
    );
  };

  return openUpdateSDKUserDialog;
};

export const useReactivateUserDialog = () => {
  const dispatch = useDispatch();

  const openReactivateUserDialog = ({ user, onSuccess }: { user: User; onSuccess: () => void }) => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.ReactivateUser,
        dialogProps: {
          selectedUsers: [user],
          onSuccess,
        },
      }),
    );
  };

  return openReactivateUserDialog;
};

export const useCreateUserDialog = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const openCreateUserDialog = () => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.CreateSDKUser,
        dialogProps: {
          title: intl.formatMessage({ id: 'calls.studio.createUserDialog_title' }),
          withUserIdField: true,
        },
      }),
    );
  };

  return openCreateUserDialog;
};

export const useUnregisterUserDialog = () => {
  const dispatch = useDispatch();

  const openUnregisterUserDialog = (userId: string) => {
    dispatch(
      commonActions.showDialogsRequest({
        dialogTypes: DialogType.PhoneboothUserUnregister,
        dialogProps: { userId },
      }),
    );
  };

  return openUnregisterUserDialog;
};
