import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { InputText } from 'feather';

import { commonActions, chatActions } from '@actions';
import {
  Dialog,
  ImageUpload,
  DialogFormSet,
  DialogFormLabel,
  DialogFormBody,
  DialogFormAction,
  CancelButton,
  ConfirmButton,
} from '@ui/components';

import { DataFieldLabelTooltipIcon } from '../DataFieldLabelTooltipIcon';
import { CodeTextarea } from '../dialogs/CodeTextarea';

const mapDispatchToProps = {
  addNotificationsRequest: commonActions.addNotificationsRequest,
  createOpenChannelRequest: chatActions.createOpenChannelRequest,
};

type Props = DefaultDialogProps<null> & typeof mapDispatchToProps;

type FormValues = {
  name: string;
  channelUrl: string;
  coverImage: File | null;
  customType: string;
  data: string;
};

const CreateOpenChannelDialogConnectable: React.FC<Props> = ({ isFetching, onClose, createOpenChannelRequest }) => {
  const intl = useIntl();
  const { register, control, handleSubmit, errors } = useForm<FormValues>();

  const onSubmit = ({ name, channelUrl, coverImage, customType, data: dataFieldValue }: FormValues) => {
    const data = {
      channel_url: channelUrl,
      name,
      custom_type: customType,
      cover_file: coverImage,
      cover_url: '',
      data: dataFieldValue,
    };
    createOpenChannelRequest({
      data,
    });
  };

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.title' })}
      body={
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogFormBody>
            <InputText
              name="name"
              type="text"
              ref={register}
              label={intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.field.name' })}
            />
            <InputText
              name="channelUrl"
              type="text"
              ref={register({
                pattern: {
                  value: new RegExp(/^[a-z\d_]+$/i),
                  message: intl.formatMessage({
                    id: 'chat.openChannels.createOpenChannelDialog.field.url.error.invalid',
                  }),
                },
              })}
              label={intl.formatMessage({
                id: 'chat.openChannels.createOpenChannelDialog.field.url',
              })}
              error={{
                hasError: !!errors.channelUrl,
                message: intl.formatMessage({
                  id: 'chat.openChannels.createOpenChannelDialog.field.url.error.invalid',
                }),
              }}
            />
            <DialogFormSet
              css={`
                display: block;
                margin-top: 16px;
                margin-bottom: 16px;
              `}
            >
              <DialogFormLabel
                css={`
                  height: 24px;
                  line-height: 24px;
                  margin-bottom: 0;
                `}
              >
                {intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.field.coverImage' })}
              </DialogFormLabel>
              <Controller
                control={control}
                name="coverImage"
                defaultValue={null}
                render={({ onChange }) => {
                  return (
                    <ImageUpload
                      type="channel"
                      onChange={(event) => {
                        onChange(event.target.files?.[0]);
                      }}
                    />
                  );
                }}
              />
            </DialogFormSet>
            <InputText
              name="customType"
              type="text"
              ref={register}
              label={intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.field.customType' })}
            />
            <CodeTextarea
              ref={register}
              name="data"
              label={
                <>
                  {intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.field.data' })}
                  <DataFieldLabelTooltipIcon />
                </>
              }
            />
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose}>
              {intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.btn.cancel' })}
            </CancelButton>
            <ConfirmButton type="submit" isFetching={isFetching}>
              {intl.formatMessage({ id: 'chat.openChannels.createOpenChannelDialog.btn.submit' })}
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};

export default connect(null, mapDispatchToProps)(CreateOpenChannelDialogConnectable);
