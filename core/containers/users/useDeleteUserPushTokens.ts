import { useState } from 'react';
import { useIntl } from 'react-intl';

import { toast } from 'feather';
import isEqual from 'lodash/isEqual';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { deleteUserPushToken } from '@core/api';
import { getErrorMessage } from '@epics';
import { useShowDialog } from '@hooks';

type DeletePushTokenParams = {
  tokenType: UserPushTokenType;
  token: string;
};

export const useDeleteUserPushTokens = ({
  appId,
  userId,
  onTokenDeleted,
}: {
  appId: string;
  userId: string;
  onTokenDeleted: (deletedToken: DeletePushTokenParams) => void;
}) => {
  const [pendingPushTokens, setPendingPushTokens] = useState<DeletePushTokenParams[]>([]);

  const intl = useIntl();
  const showDialog = useShowDialog();

  const handleDeleteButtonClick = (params: DeletePushTokenParams) => {
    const onDelete = async () => {
      try {
        setPendingPushTokens((tokens) => [...tokens, params]);
        await deleteUserPushToken({ appId, userId, ...params });
        onTokenDeleted(params);
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      } finally {
        setPendingPushTokens((tokens) => tokens.filter((item) => !isEqual(item, params)));
      }
    };
    showDialog({
      dialogTypes: DialogType.Delete,
      dialogProps: {
        title: intl.formatMessage({ id: 'core.user_detail.deleteUserDeviceTokenDialog_title' }),
        description: intl.formatMessage(
          { id: 'core.user_detail.deleteUserDeviceTokenDialog_lbl.description' },
          { fcmOrApns: params.tokenType.includes('apns') ? 'APNs' : 'FCM' },
        ),
        onDelete,
      },
    });
  };

  return { handleDeleteButtonClick, pendingPushTokens };
};
