import React, { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { useForm, useField, Checkbox, InputText, toast } from 'feather';

import { createUser } from '@core/api';
import { getErrorMessage } from '@epics';
import {
  Dialog,
  DialogFormSet,
  DialogFormLabel,
  DialogFormBody,
  DialogFormAction,
  CancelButton,
  ConfirmButton,
} from '@ui/components';
import { camelCaseKeys } from '@utils';

type SimpleError = {
  hasError: boolean;
  message: string;
};

type CreateUserFormData = {
  userId: string;
  nickname: string;
  profileUrl: string;
  issueAccessToken: boolean;
};

type Props = DefaultDialogProps<CreateUserDialogProps>;

const CreateUserDialog: React.FC<Props> = ({ dialogProps: { onSuccess }, onClose }) => {
  const intl = useIntl();
  const appId = useSelector<RootState, Application['app_id']>((state) => state.applicationState.data?.app_id ?? '');
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<SimpleError | null>(null);

  const form = useForm({
    onSubmit: (formData: CreateUserFormData) => {
      setIsFetching(true);
      createUser({ appId, ...formData })
        .then(({ data }) => {
          toast.success({ message: `${data.user_id} created!` });
          setIsFetching(false);
          setError({ hasError: false, message: '' });
          onSuccess({ ...camelCaseKeys(data), isActive: true });
          onClose();
        })
        .catch((error) => {
          setIsFetching(false);
          if (error.data?.code === 400202) {
            // The user ID already exists. Show the error message below the input.
            setError({ hasError: true, message: getErrorMessage(error) });
          } else {
            toast.error({ message: getErrorMessage(error) });
          }
        });
    },
  });
  const userIdField = useField<string>('userId', form, { defaultValue: '' });
  const nicknameField = useField<string>('nickname', form, { defaultValue: '' });
  const profileUrlField = useField<string>('profileUrl', form, { defaultValue: '' });
  const issueAccessTokenField = useField<boolean>('issueAccessToken', form, {
    defaultValue: false,
    isControlled: true,
  });

  useEffect(() => {
    if (error?.hasError) {
      userIdField.ref.current?.focus();
    }
  }, [error?.hasError, userIdField.ref]);

  return (
    <Dialog
      size="small"
      onClose={onClose}
      title={intl.formatMessage({ id: 'core.users.create_user_dialog_title' })}
      body={
        <form onSubmit={form.onSubmit}>
          <DialogFormBody>
            <DialogFormSet>
              <DialogFormLabel>
                {intl.formatMessage({ id: 'core.users.create_user_dialog_lbl.user_id' })}
              </DialogFormLabel>
              <InputText ref={userIdField.ref} required={true} error={error || undefined} data-test-id="UserIdInput" />
            </DialogFormSet>
            <DialogFormSet>
              <DialogFormLabel>
                {intl.formatMessage({ id: 'core.users.create_user_dialog_lbl.nickname' })}
              </DialogFormLabel>
              <InputText ref={nicknameField.ref} required={true} data-test-id="NicknameInput" />
            </DialogFormSet>
            <DialogFormSet>
              <DialogFormLabel>
                {intl.formatMessage({ id: 'core.users.create_user_dialog_lbl.profile_url' })}
              </DialogFormLabel>
              <InputText ref={profileUrlField.ref} data-test-id="ProfileUrlInput" />
            </DialogFormSet>
            <DialogFormSet>
              <Checkbox
                ref={issueAccessTokenField.ref}
                onChange={issueAccessTokenField.onChange}
                label={intl.formatMessage({ id: 'core.users.create_user_dialog_lbl.issue_access_token' })}
                data-test-id="IssueAccessTokenCheckbox"
              />
            </DialogFormSet>
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose}>
              {intl.formatMessage({ id: 'core.users.create_user_dialog_cancel' })}
            </CancelButton>
            <ConfirmButton disabled={isFetching} isFetching={isFetching} type="submit">
              {intl.formatMessage({ id: 'core.users.create_user_dialog_submit' })}
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};

export default CreateUserDialog;
