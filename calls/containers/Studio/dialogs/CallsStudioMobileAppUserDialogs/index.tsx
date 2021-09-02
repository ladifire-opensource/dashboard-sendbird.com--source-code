import { useIntl } from 'react-intl';

import { Dialog } from '@ui/components';

import { FindExistingUserForm } from './FindExistingUserForm';
import { UserForm } from './UserForm';

export const CallsStudioMobileCreateUserDialog = ({
  onClose,
  dialogProps,
}: DefaultDialogProps<CallsStudioMobileCreateUserDialogProps>) => {
  const intl = useIntl();
  const { onSuccess } = dialogProps;
  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.create_title' })}
      body={<UserForm onSuccess={onSuccess} onClose={onClose} />}
    />
  );
};

export const CallsStudioMobileAddUsersDialog = ({
  onClose,
  dialogProps,
}: DefaultDialogProps<CallsStudioMobileAddUsersDialogProps>) => {
  const intl = useIntl();
  const { onSuccess } = dialogProps;

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.addExistingUser_title' })}
      body={<FindExistingUserForm onSuccess={onSuccess} onClose={onClose} />}
    />
  );
};

export const CallsStudioMobileEditUserDialog = ({
  onClose,
  dialogProps,
}: DefaultDialogProps<CallsStudioMobileEditUserDialogProps>) => {
  const intl = useIntl();

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.edit_title' })}
      body={<UserForm user={dialogProps.user} onSuccess={dialogProps.onSuccess} onClose={onClose} />}
    />
  );
};
