import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect, useSelector } from 'react-redux';

import styled from 'styled-components';

import { cssVariables, InlineNotification } from 'feather';
import trim from 'lodash/trim';

import { commonActions, coreActions } from '@actions';
import {
  BasicInput,
  CancelButton,
  ConfirmButton,
  Dialog,
  DialogFormAction,
  DialogFormBody,
  DialogFormLabel,
  DialogFormSet,
  ImageUpload,
} from '@ui/components';

const LabelDescription = styled.div`
  font-size: 14px;
  color: ${cssVariables('neutral-7')};
  margin-top: 18px;
  line-height: 1;
`;

const mapDispatchToProps = {
  addNotificationsRequest: commonActions.addNotificationsRequest,
  createSDKUserRequest: coreActions.createSDKUserRequest,
};
type Props = DefaultDialogProps<CreateSDKUserDialogProps> & typeof mapDispatchToProps;

export const CreateSDKUserDialogConnectable: React.FC<Props> = ({
  dialogProps,
  onClose,
  addNotificationsRequest,
  createSDKUserRequest,
}) => {
  const intl = useIntl();
  const { error, isPending } = useSelector((state: RootState) => state.moderations.createRequest);
  const userIdInput = useRef<HTMLInputElement>();
  const nicknameInput = useRef<HTMLInputElement>();
  const profileURLInput = useRef<HTMLInputElement>();

  const [profileFile, setProfileFile] = useState<File | null>(null);

  const {
    title = intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.title' }),
    withUserIdField = false,
  } = dialogProps;

  const handleSubmit = (e) => {
    e.preventDefault();

    const userId = trim(userIdInput.current?.value);
    const nickname = trim(nicknameInput.current?.value);
    const profileURL = trim(profileURLInput.current?.value);

    if (withUserIdField && !userId) {
      addNotificationsRequest({
        status: 'warning',
        message: intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.warning.userId' }),
      });
      return false;
    }

    if (nickname === '') {
      addNotificationsRequest({
        status: 'warning',
        message: intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.warning.nickname' }),
      });
      return false;
    }

    const data = {
      sdk_user_id: userId,
      nickname,
      profile_url: profileURL,
      profile_file: profileFile,
      issue_access_token: true,
    };
    createSDKUserRequest({ data });
  };

  const handleImageChange = (e) => {
    setProfileFile(e.target.files[0]);
  };

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={title}
      body={
        <form onSubmit={handleSubmit}>
          <DialogFormBody>
            {withUserIdField && (
              <DialogFormSet>
                <DialogFormLabel htmlFor="user-id">
                  {intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.field.userId' })}
                </DialogFormLabel>
                <BasicInput type="text" ref={userIdInput} id="user-id" />
              </DialogFormSet>
            )}
            <DialogFormSet>
              <DialogFormLabel htmlFor="nickname">
                {intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.field.nickname' })}
              </DialogFormLabel>
              <BasicInput type="text" ref={nicknameInput} required={true} id="nickname" />
            </DialogFormSet>
            <DialogFormSet>
              <DialogFormLabel>
                {intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.field.profileUrl' })}
              </DialogFormLabel>
              <BasicInput type="text" ref={profileURLInput} />
            </DialogFormSet>
            <DialogFormSet>
              <DialogFormLabel>
                {intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.field.profileImage' })}
              </DialogFormLabel>
              <ImageUpload
                type="user"
                onChange={handleImageChange}
                label={intl.formatMessage({
                  id: 'chat.moderation.createModeratorDialog.field.profileImage.lbl.uploadPhoto',
                })}
              />
            </DialogFormSet>
            <LabelDescription>
              {intl.formatMessage({
                id: withUserIdField
                  ? 'chat.moderation.createModeratorDialog.lbl.AccessTokenAutomaticallyIssued'
                  : 'chat.moderation.createModeratorDialog.lbl.userIdAccessTokenAutomaticallyIssued',
              })}
            </LabelDescription>
          </DialogFormBody>
          {error && <InlineNotification type="error" message={error} css="margin-top: 16px;" />}
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose}>
              {intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.btn.cancel' })}
            </CancelButton>
            <ConfirmButton isFetching={isPending} disabled={isPending}>
              {intl.formatMessage({ id: 'chat.moderation.createModeratorDialog.btn.submit' })}
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};

export default connect(null, mapDispatchToProps)(CreateSDKUserDialogConnectable);
