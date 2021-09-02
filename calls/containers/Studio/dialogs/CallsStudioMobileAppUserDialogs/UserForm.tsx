import { useState, FC } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { InputText, InlineNotification } from 'feather';

import { createUser, editUser } from '@core/api';
import { getErrorMessage } from '@epics';
import { useAppId } from '@hooks';
import { ImageUpload, DialogFormAction, CancelButton, ConfirmButton, DialogFormBody } from '@ui/components';

type Props = { onClose: () => void; user?: SDKUser; onSuccess: (user: SDKUser) => void };

type FormValues = { userId: string; nickname: string; profileUrl: string; profileFile: File | null };

const ImageUploadLabel = styled.label`
  align-self: flex-start;
  font-size: 12px;
  font-weight: 500;
  line-height: 24px;
  margin-top: 16px;

  & + * {
    margin-top: 16px;
  }
`;

export const UserForm: FC<Props> = ({ onClose, user, onSuccess }) => {
  const appId = useAppId();
  const { register, control, errors, handleSubmit } = useForm<FormValues>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');
  const intl = useIntl();

  // If the application requires an access token to authenticate but the user does not have an access token, we have to issue one.
  const shouldIssueAccessToken =
    useSelector((state: RootState) => state.applicationState.data?.guest_user_policy === 2) && !user?.access_token;

  const onSubmit = async (data: FormValues) => {
    if (!appId) {
      return;
    }

    const sendRequest = () => {
      if (user) {
        return editUser({
          appId,
          ...data,
          userId: user.user_id,
          issueAccessToken: shouldIssueAccessToken ? true : undefined,
        });
      }
      return createUser({ appId, ...data, issueAccessToken: shouldIssueAccessToken });
    };

    try {
      setIsPending(true);
      setError('');
      const { data: newUser } = await sendRequest();
      onSuccess(newUser);
      onClose();
    } catch (error) {
      setError(
        error.data?.code === 400202
          ? intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.create_error.userIdAlreadyExists' })
          : getErrorMessage(error),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-test-id="UserForm">
      <DialogFormBody
        css={`
          display: flex;
          flex-direction: column;
        `}
      >
        {error && <InlineNotification type="error" message={error} css="margin-bottom: 16px;" />}

        <InputText
          name="userId"
          label={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_lbl.userId' })}
          defaultValue={user?.user_id}
          ref={register({ required: true })}
          readOnly={!!user} // make it read only in Edit user dialog
          error={{
            hasError: !!errors.userId,
            message: intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_error.userIdRequired' }),
          }}
          data-test-id="UserIdField"
        />

        <InputText
          name="nickname"
          label={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_lbl.nickname' })}
          defaultValue={user?.nickname}
          ref={register({ required: true })}
          error={{
            hasError: !!errors.nickname,
            message: intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_error.nicknameRequired' }),
          }}
          data-test-id="NicknameField"
        />

        <InputText
          name="profileUrl"
          label={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_lbl.profileUrl' })}
          defaultValue={user?.profile_url}
          ref={register}
          data-test-id="ProfileURLField"
        />

        <ImageUploadLabel>
          <div>{intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_lbl.profileFile' })}</div>
          <Controller
            control={control}
            name="profileFile"
            defaultValue={user?.profile_url ?? null}
            render={({ onChange }) => {
              return (
                <ImageUpload
                  type="user"
                  defaultImage={user?.profile_url}
                  onChange={(event) => {
                    onChange(event.target.files?.[0]);
                  }}
                />
              );
            }}
          />
        </ImageUploadLabel>

        {user?.access_token && (
          <InputText
            label={intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.form_lbl.accessToken' })}
            defaultValue={user?.access_token}
            readOnly={true}
            data-test-id="AccessTokenField"
          />
        )}
      </DialogFormBody>
      <DialogFormAction>
        <CancelButton type="button" onClick={onClose}>
          {intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog_btn.cancel' })}
        </CancelButton>
        <ConfirmButton type="submit" isFetching={isPending} disabled={isPending} data-test-id="SubmitButton">
          {user
            ? intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.edit_btn.submit' })
            : intl.formatMessage({ id: 'calls.studio.mobileApp.userDialog.create_btn.submit' })}
        </ConfirmButton>
      </DialogFormAction>
    </form>
  );
};
