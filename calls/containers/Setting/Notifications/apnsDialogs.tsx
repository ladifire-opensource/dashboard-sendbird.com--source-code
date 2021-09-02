import { forwardRef, FC, useEffect, HTMLAttributes, HTMLProps } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import axios from 'axios';
import {
  Button,
  cssVariables,
  InlineNotification,
  InputText,
  Lozenge,
  LozengeVariant,
  Radio,
  Subtitles,
  toast,
  Typography,
} from 'feather';

import { coreApi } from '@api';
import { getErrorMessage } from '@epics';
import { useAppId, useAsync } from '@hooks';
import {
  CancelButton,
  ConfirmButton,
  Dialog,
  DialogFormAction,
  DialogFormBody,
  DialogFormDivider,
  DialogFormLabel,
  DialogFormSet,
  InfoTooltip,
} from '@ui/components';
import { ALERT_SETTINGS_APNS, ALERT_SETTINGS_APNS_CERT_ERROR } from '@utils/text';

type UpdateParams = {
  appId: string;
  id: string;
  pushTypePath: PushTypePath;
  form: PushAPNSRegisterDialogFormValues;
};

type APNsPushTypePath = 'apns_voip' | 'calls_apns_remote';
type RegisterForm = {
  notification: APNsPushTypePath;
  environment: APNs['apns_env_cert_type'];
  pushSound: APNs['push_sound'];
  password: string;
  files?: File[];
};

type EditForm = {
  environment: APNs['apns_env_cert_type'];
  pushSound: APNs['push_sound'];
  password: string;
  files?: File[];
};

const OptionsTitle = styled.div`
  display: flex;
  align-items: center;
  ${Subtitles['subtitle-01']};
  margin-bottom: 12px;
`;

const OptionsText = styled.div`
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  color: ${cssVariables('neutral-7')};
`;

const FileWrapper = styled.div`
  display: flex;
  align-items: center;
  > div {
    flex: 1;
  }
`;

const FileInput = styled(InputText)``;

const FileButton = styled(Button)`
  position: relative;
  margin-left: 4px;

  > input[type='file'] {
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const RadioDescription = styled.p`
  ${Typography['caption-01']}
  color: ${cssVariables('neutral-7')};

  b {
    font-weight: 600;
  }
`;

const PushTypeContainer = styled.div`
  div:first-child {
    width: fit-content;
  }

  ${RadioDescription} {
    margin-top: 8px;
    padding: 0 28px;
  }

  label > span {
    display: inline-flex;
    align-items: center;

    > ${Lozenge} {
      margin-left: 8px;
    }
  }
`;

const RadioWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  > div + div {
    margin-top: 8px;
  }

  > ${PushTypeContainer} + ${PushTypeContainer} {
    margin-top: 24px;
  }
`;

const FileInputDescription = styled.p`
  margin-top: 4px;
  color: ${cssVariables('neutral-7')};
  ${Typography['caption-01']};
`;

const convertToFormData = (form: PushAPNSRegisterDialogFormValues) => {
  const { apnsEnvType, apnsFile, apnsCertPassword, pushSound } = form;
  const payload = new FormData();

  payload.append('apns_cert_env_type', apnsEnvType);

  if (apnsFile) {
    payload.append('apns_cert', apnsFile[0]);
    if (apnsCertPassword) {
      payload.append('apns_cert_password', apnsCertPassword);
    }
  }

  if (pushSound) {
    payload.append('push_sound', pushSound);
  }

  return payload;
};

const processAPNsError = (error: any) => {
  if (!axios.isAxiosError(error)) {
    throw error;
  }
  const { code } = error as any;
  if (code === 400111) throw new Error('Invalid APNS certificate.');
  if (code === 400108) throw new Error('APNS certificate password is not valid.');
  if (error.response?.status === 400) throw new Error(ALERT_SETTINGS_APNS_CERT_ERROR);

  throw error;
};

const registerAPNs = async (params: {
  appId: string;
  pushTypePath: APNsPushTypePath;
  form: PushAPNSRegisterDialogFormValues;
}) => {
  const { appId, pushTypePath, form } = params;
  const payload = convertToFormData(form);

  try {
    const { data } = await coreApi.pushRegisterProvider({ appId, pushTypePath, payload });
    return data.push_configurations[0];
  } catch (error) {
    processAPNsError(error);
  }
};

const updateAPNs = async (params: UpdateParams) => {
  const { appId, id, pushTypePath, form } = params;
  const payload = convertToFormData(form);

  try {
    const { data } = await coreApi.updatePushConfiguration({ appId, pushConfigurationId: id, pushTypePath, payload });
    return data.push_configurations;
  } catch (error) {
    processAPNsError(error);
  }
};

const useRegisterAPNsRequest = () => {
  const appId = useAppId();
  const [{ status, data: response, error }, register] = useAsync(
    (pushTypePath: APNsPushTypePath, form: PushAPNSRegisterDialogFormValues) =>
      registerAPNs({ appId, pushTypePath, form }),
    [appId],
  );
  const loading = status === 'loading';

  return { response, loading, error, register };
};

const useEditAPNsRequest = () => {
  const appId = useAppId();
  const [{ status, data: response, error }, update] = useAsync(
    (params: Omit<UpdateParams, 'appId'>) => updateAPNs({ appId, ...params }),
    [appId],
  );
  const loading = status === 'loading';

  return { response, loading, error, update };
};

const FileField = forwardRef<HTMLInputElement, HTMLProps<HTMLInputElement> & { filename?: string }>(
  ({ filename, ...props }, ref) => {
    const intl = useIntl();

    return (
      <DialogFormSet>
        <DialogFormLabel>
          {intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.label.upload' })}
        </DialogFormLabel>
        <FileWrapper>
          <FileInput readOnly={true} value={filename ?? ''} />
          <FileButton size="medium" buttonType="tertiary">
            {intl.formatMessage({ id: 'label.chooseFile' })}
            <input ref={ref} name="files" type="file" data-test-id="ApnsFile" {...props} />
          </FileButton>
        </FileWrapper>
        <FileInputDescription>
          {intl.formatMessage({
            id: 'core.settings.application.notification.apns.dialog.label.upload.description',
          })}
        </FileInputDescription>
      </DialogFormSet>
    );
  },
);

const PasswordField = forwardRef<HTMLInputElement, HTMLAttributes<HTMLInputElement>>((props, ref) => {
  const intl = useIntl();

  return (
    <DialogFormSet>
      <DialogFormLabel>
        {`${intl.formatMessage({ id: 'label.password' })} (${intl.formatMessage({ id: 'label.optional' })})`}
      </DialogFormLabel>
      <div>
        <InputText type="password" name="password" ref={ref} {...props} />
      </div>
    </DialogFormSet>
  );
});

const EnvironmentField = forwardRef<HTMLInputElement, HTMLAttributes<HTMLInputElement>>((props, ref) => {
  const intl = useIntl();

  return (
    <DialogFormSet>
      <OptionsTitle>
        {intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.label.envType' })}
      </OptionsTitle>
      <RadioWrapper>
        <Radio ref={ref} name="environment" value="development" label="Development" required={true} />
        <Radio ref={ref} name="environment" value="production" label="Production" required={true} />
      </RadioWrapper>
    </DialogFormSet>
  );
});

export const PushAPNSVoIPRegisterDialog: FC<DefaultDialogProps<PushAPNsVoIPRegisterDialogProps>> = ({
  dialogProps,
  onClose,
}) => {
  const intl = useIntl();

  const { onSuccess } = dialogProps;
  const { register, watch, handleSubmit } = useForm<RegisterForm>({
    defaultValues: { notification: 'apns_voip', environment: 'development' },
  });
  const { response, loading, error, register: requestRegister } = useRegisterAPNsRequest();

  const notification = watch('notification');
  const files = watch('files');
  const selectedFile = files?.[0];
  const isPushSoundEnabled = notification === 'calls_apns_remote';

  useEffect(() => {
    if (response) {
      toast.success({ message: ALERT_SETTINGS_APNS });
      onSuccess(response);
      onClose();
    }
  }, [onSuccess, onClose, response]);

  const onSubmit = (form: RegisterForm) => {
    const { notification, environment, files, password, pushSound } = form;

    requestRegister(notification, {
      pushSound,
      apnsEnvType: environment,
      apnsFile: files,
      apnsCertPassword: password,
    });
  };

  const notificationRadios = [
    {
      value: 'apns_voip',
      label: (
        <>
          {intl.formatMessage({
            id: 'core.settings.application.notification.apns.dialog.label.notification.incomingCallRadio',
          })}
          <Lozenge variant={LozengeVariant.Light} color="purple">
            {intl.formatMessage({
              id: 'core.settings.application.notification.apns.dialog.label.notification.incomingCallRadio.recommended',
            })}
          </Lozenge>
        </>
      ),
      descriptionKey: 'core.settings.application.notification.apns.dialog.label.notification.incomingCallDescription',
    },
    {
      value: 'calls_apns_remote',
      label: intl.formatMessage({
        id: 'core.settings.application.notification.apns.dialog.label.notification.alertsRadio',
      }),
      descriptionKey: 'core.settings.application.notification.apns.dialog.label.notification.alertsDescription',
    },
  ] as const;

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'calls.settings.notifications.apns.dialog.add.title' })}
      body={
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && <InlineNotification type="error" message={getErrorMessage(error)} css="margin-bottom: 24px;" />}
          <DialogFormBody>
            <DialogFormSet data-test-id="NotificationTypes">
              <OptionsTitle>
                {intl.formatMessage({ id: 'calls.settings.notifications.apns.dialog.label.notification' })}
              </OptionsTitle>
              <RadioWrapper>
                {notificationRadios.map(({ value, label, descriptionKey }) => (
                  <PushTypeContainer key={value}>
                    <Radio
                      ref={register}
                      data-test-id={`notificationRadio_${value}`}
                      name="notification"
                      required={true}
                      value={value}
                      label={label}
                    />
                    <RadioDescription>
                      {intl.formatMessage({ id: descriptionKey }, { b: (text) => <b>{text}</b> })}
                    </RadioDescription>
                  </PushTypeContainer>
                ))}
              </RadioWrapper>
            </DialogFormSet>
            <FileField ref={register} filename={selectedFile?.name} />
            {selectedFile && <PasswordField ref={register} />}
            <DialogFormDivider />
            <EnvironmentField ref={register} />
            {isPushSoundEnabled && (
              <>
                <DialogFormDivider />
                <DialogFormSet>
                  <OptionsTitle as="label" id="soundFieldLabel">
                    {intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.label.sound' })}
                    <InfoTooltip
                      content={intl.formatMessage({
                        id: 'core.settings.application.notification.apns.dialog.label.sound.tooltip',
                      })}
                      placement="bottom-start"
                    />
                  </OptionsTitle>
                  <InputText
                    ref={register}
                    name="pushSound"
                    placeholder={intl.formatMessage({
                      id: 'core.settings.application.notification.apns.dialog.label.sound.input',
                    })}
                    aria-labelledby="soundFieldLabel"
                  />
                </DialogFormSet>
              </>
            )}
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose}>
              {intl.formatMessage({ id: 'core.settings.application.notification.dialog.label.cancel' })}
            </CancelButton>
            <ConfirmButton type="submit" isFetching={loading} disabled={loading || !selectedFile}>
              {intl.formatMessage({ id: 'core.settings.application.notification.dialog.label.add' })}
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};

export const PushAPNSVoIPEditDialog: FC<DefaultDialogProps<PushAPNsVoIPEditDialogProps>> = ({
  dialogProps,
  onClose,
}) => {
  const intl = useIntl();

  const { configuration, onSuccess } = dialogProps;
  const { register, watch, handleSubmit } = useForm<EditForm>({
    defaultValues: { environment: configuration.apns_env_cert_type },
  });
  const form = watch();
  const selectedFile = form.files?.[0];
  const { response, loading, error, update: requestUpdate } = useEditAPNsRequest();

  useEffect(() => {
    if (response) {
      toast.success({ message: ALERT_SETTINGS_APNS });

      /* Currently, a response from update APNs API includes only id, not the updated APNs. So we process APNs manually here. */
      const { pushSound, environment } = form;
      onSuccess({
        ...configuration,
        push_sound: pushSound,
        apns_type: environment.toUpperCase() as APNs['apns_type'],
        apns_env_cert_type: environment,
      });
      onClose();
    }
  }, [configuration, onSuccess, onClose, response, form]);

  const onSubmit = (form: EditForm) => {
    const { environment, files, password, pushSound } = form;

    const pushTypePath = configuration.push_type.toLowerCase() as PushTypePath;

    requestUpdate({
      pushTypePath,
      id: configuration.id,
      form: {
        pushSound,
        apnsFile: files,
        apnsCertPassword: password,
        apnsEnvType: environment,
      },
    });
  };

  return (
    <Dialog
      onClose={onClose}
      size="small"
      title={intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.title.edit' })}
      body={
        <form onSubmit={handleSubmit(onSubmit)}>
          {error && <InlineNotification type="error" message={getErrorMessage(error)} css="margin-bottom: 24px;" />}
          <DialogFormBody>
            <DialogFormSet>
              <OptionsTitle>
                {intl.formatMessage({ id: 'core.settings.application.notification.apns.dialog.label.appId' })}
              </OptionsTitle>
              <OptionsText>{configuration.apns_name}</OptionsText>
            </DialogFormSet>
            <DialogFormDivider />
            <FileField ref={register} filename={selectedFile?.name} readOnly={true} />
            {selectedFile && <PasswordField ref={register} />}
            <DialogFormDivider />
            <EnvironmentField ref={register} />
          </DialogFormBody>
          <DialogFormAction>
            <CancelButton type="button" onClick={onClose} disabled={loading}>
              {intl.formatMessage({ id: 'core.settings.application.notification.dialog.label.cancel' })}
            </CancelButton>
            <ConfirmButton type="submit" isFetching={loading} disabled={loading}>
              {intl.formatMessage({ id: 'core.settings.application.notification.dialog.label.edit' })}
            </ConfirmButton>
          </DialogFormAction>
        </form>
      }
    />
  );
};
