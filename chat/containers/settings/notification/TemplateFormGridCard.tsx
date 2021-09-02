import { FC, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { InputText, Typography, cssVariables } from 'feather';
import { nanoid } from 'nanoid';

import { SettingsGridCard } from '@common/containers/layout/settingsGrid';
import { useFormErrorFromFieldError } from '@desk/containers/settings/TicketTags/useFormErrorFromFieldError';
import { UnsavedPrompt } from '@ui/components';

type TemplateFormFields = {
  textMessageTemplateTitle: string;
  textMessageTemplateBody: string;
  fileMessageTemplateTitle: string;
  fileMessageTemplateBody: string;
  adminMessageTemplateBody: string;
};

type Props = {
  defaultValues: Partial<TemplateFormFields>;
  description: string;
  disabled: boolean;
  formId: string;
  isSubmitting: boolean;
  readOnly: boolean;
  title: string;
  getRequiredErrorMessage: (fieldName: keyof TemplateFormFields) => string;
  onSubmit: (data: TemplateFormFields, onSuccess: () => void) => void;
};

const TextField = styled(InputText)``;

const MessageType = styled.h6`
  ${Typography['label-02']};
  font-weight: 600;
  margin-bottom: 14px;

  [aria-disabled='true'] & {
    color: ${cssVariables('neutral-5')};
  }
`;

const Fieldset = styled.fieldset`
  padding: 0;
  border: 0;

  &:not(:first-child)::before {
    display: block;
    margin: 24px 0;
    background: ${cssVariables('neutral-3')};
    height: 1px;
    content: '';
  }
`;

export const TemplateFormGridCard: FC<Props> = ({
  defaultValues,
  disabled,
  formId,
  getRequiredErrorMessage,
  isSubmitting,
  onSubmit,
  readOnly,
  title,
  description,
}) => {
  const intl = useIntl();
  const { register, handleSubmit, errors, formState, reset } = useForm<TemplateFormFields>({ defaultValues });

  const { current: fieldsetHeaderId } = useRef(nanoid());

  return (
    <SettingsGridCard
      role="group"
      title={title}
      aria-label={title}
      description={description}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      showActions={formState.isDirty}
      isDisabled={disabled}
      actions={[
        {
          key: 'cancel',
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: () => reset(),
        },
        {
          key: 'save',
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          type: 'submit',
          form: formId,
          isLoading: isSubmitting,
          disabled: !formState.isDirty || isSubmitting || readOnly,
        },
      ]}
    >
      <UnsavedPrompt when={formState.isDirty} />
      <form id={formId} onSubmit={handleSubmit((data) => onSubmit(data, () => reset(data)))} aria-disabled={disabled}>
        <Fieldset aria-labelledby={`${fieldsetHeaderId}_MESG`}>
          <MessageType id={`${fieldsetHeaderId}_MESG`}>
            {intl.formatMessage({ id: 'chat.settings.notifications.template.messageType.text' })}
          </MessageType>

          <TextField
            ref={register}
            name="textMessageTemplateTitle"
            label={intl.formatMessage({ id: 'chat.settings.notifications.template.field.title' })}
            placeholder={intl.formatMessage({
              id: 'chat.settings.notifications.template.field.title.placeholder',
            })}
            disabled={disabled}
            readOnly={readOnly}
            error={useFormErrorFromFieldError(errors.textMessageTemplateTitle)}
          />

          <TextField
            ref={register({
              required: true,
              validate: (value: string) => {
                return value.trim().length > 0 || getRequiredErrorMessage('textMessageTemplateBody');
              },
            })}
            name="textMessageTemplateBody"
            label={intl.formatMessage({ id: 'chat.settings.notifications.template.field.body' })}
            placeholder={intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.placeholder',
            })}
            disabled={disabled}
            readOnly={readOnly}
            error={useFormErrorFromFieldError(errors.textMessageTemplateBody)}
          />
        </Fieldset>

        <Fieldset aria-labelledby={`${fieldsetHeaderId}_FILE`}>
          <MessageType id={`${fieldsetHeaderId}_FILE`}>
            {intl.formatMessage({ id: 'chat.settings.notifications.template.messageType.file' })}
          </MessageType>

          <TextField
            ref={register}
            name="fileMessageTemplateTitle"
            label={intl.formatMessage({ id: 'chat.settings.notifications.template.field.title' })}
            placeholder={intl.formatMessage({
              id: 'chat.settings.notifications.template.field.title.placeholder',
            })}
            disabled={disabled}
            readOnly={readOnly}
            error={useFormErrorFromFieldError(errors.fileMessageTemplateTitle)}
          />

          <TextField
            ref={register({
              required: true,
              validate: (value: string) => {
                return value.trim().length > 0 || getRequiredErrorMessage('fileMessageTemplateBody');
              },
            })}
            name="fileMessageTemplateBody"
            label={intl.formatMessage({ id: 'chat.settings.notifications.template.field.body' })}
            placeholder={intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.placeholder',
            })}
            disabled={disabled}
            readOnly={readOnly}
            error={useFormErrorFromFieldError(errors.fileMessageTemplateBody)}
          />
        </Fieldset>

        <Fieldset aria-labelledby={`${fieldsetHeaderId}_ADMM`}>
          <MessageType id={`${fieldsetHeaderId}_ADMM`}>
            {intl.formatMessage({ id: 'chat.settings.notifications.template.messageType.admin' })}
          </MessageType>

          <TextField
            ref={register({
              required: true,
              validate: (value: string) => {
                return value.trim().length > 0 || getRequiredErrorMessage('adminMessageTemplateBody');
              },
            })}
            name="adminMessageTemplateBody"
            label={intl.formatMessage({ id: 'chat.settings.notifications.template.field.body' })}
            placeholder={intl.formatMessage({
              id: 'chat.settings.notifications.template.field.body.placeholder',
            })}
            disabled={disabled}
            readOnly={readOnly}
            error={useFormErrorFromFieldError(errors.adminMessageTemplateBody)}
          />
        </Fieldset>
      </form>
    </SettingsGridCard>
  );
};
