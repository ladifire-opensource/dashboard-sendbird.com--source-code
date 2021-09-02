import React, { useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { Radio, Link, cssVariables, transitions } from 'feather';

import { deskActions } from '@actions';
import { SettingsGridCard } from '@common/containers/layout';
import { FileEncryptionOption, getSettingsAction } from '@constants';
import { ContextualInfoIconTooltip } from '@ui/components';

type FileEncryptionRadioGroupProps = {
  value: FileEncryptionOption;
  name: string;
  disabled?: boolean;
  onChange: (value: FileEncryptionOption) => void;
};

type Props = {
  project: Project;
  isFetching: boolean;
};

type FormData = Pick<Project, 'fileEncryptionAdminPermission' | 'fileEncryptionAgentPermission'>;

const RoleText = styled.h3<{ disabled: boolean }>`
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.23;
  color: ${({ disabled }) => (disabled ? cssVariables('neutral-5') : cssVariables('neutral-10'))};
  transition: ${transitions({ properties: ['color'], duration: 0.3 })};
`;

const RoleContainer = styled.div`
  & + & {
    margin-top: 24px;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 8px;

  & > * + * {
    margin-top: 8px;
  }
`;

const RADIO_OPTIONS = [
  { value: FileEncryptionOption.ALL, intlKey: 'desk.settings.security.fileEncryption.radio.option.label.all' },
  {
    value: FileEncryptionOption.MY_TICKETS,
    intlKey: 'desk.settings.security.fileEncryption.radio.option.label.myTickets',
  },
];

export const FileEncryptionRadioGroup = React.memo<FileEncryptionRadioGroupProps>(
  ({ value, name, disabled, onChange }) => {
    const intl = useIntl();

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      if (event.currentTarget.checked) {
        onChange(event.currentTarget.value as FileEncryptionOption);
      }
    };

    return (
      <RadioGroup>
        {RADIO_OPTIONS.map((option) => (
          <Radio
            key={`${name}.option.value`}
            name={name}
            label={intl.formatMessage({ id: option.intlKey })}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={handleChange}
          />
        ))}
      </RadioGroup>
    );
  },
);

export const FileEncryption = React.memo<Props>(({ project, isFetching }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const shouldAuthenticateToAccessFiles = useSelector(
    (state: RootState) => state.applicationState?.data?.attrs.file_authentication ?? false,
  );

  const defaultValues = useMemo(
    () => ({
      fileEncryptionAdminPermission: project.fileEncryptionAdminPermission || FileEncryptionOption.MY_TICKETS,
      fileEncryptionAgentPermission: project.fileEncryptionAgentPermission || FileEncryptionOption.MY_TICKETS,
    }),
    [project.fileEncryptionAdminPermission, project.fileEncryptionAgentPermission],
  );

  const { control, reset, formState, handleSubmit } = useForm<FormData>({
    mode: 'onChange',
    defaultValues,
  });

  const handleFormReset: React.MouseEventHandler<HTMLButtonElement> = useCallback(
    (e) => {
      e?.preventDefault();
      e?.stopPropagation();
      reset();
    },
    [reset],
  );

  const onSubmit = useCallback(
    (data: FormData) => {
      if (!formState.isDirty) {
        return;
      }

      dispatch(
        deskActions.updateProjectRequest({
          ...data,
          onSuccess: () => {
            reset(data);
          },
        }),
      );
    },
    [dispatch, formState.isDirty, reset],
  );

  const disabled = isFetching || !shouldAuthenticateToAccessFiles;

  return (
    <SettingsGridCard
      title={
        <>
          {intl.formatMessage({ id: 'desk.settings.security.fileEncryption.header.title' })}
          <ContextualInfoIconTooltip
            content={intl.formatMessage(
              { id: 'desk.settings.security.fileEncryption.header.tooltip' },
              { a: (text) => <Link href="/settings/contact_us">{text}</Link> },
            )}
          />
        </>
      }
      description={!disabled && intl.formatMessage({ id: 'desk.settings.security.fileEncryption.header.description' })}
      gridItemConfig={{ subject: { alignSelf: 'start' } }}
      showActions={formState.isDirty}
      actions={getSettingsAction({
        key: 'fileEncryption',
        intl,
        isFetching: false,
        onCancel: handleFormReset,
        onSave: handleSubmit(onSubmit),
      })}
    >
      <RoleContainer data-test-id="AdminFileEncryption">
        <RoleText disabled={disabled}>
          {intl.formatMessage({ id: 'desk.settings.security.fileEncryption.radio.title.admin' })}
        </RoleText>
        <Controller
          control={control}
          rules={{ required: true }}
          name="fileEncryptionAdminPermission"
          render={({ onChange, value, name }) => {
            return <FileEncryptionRadioGroup name={name} onChange={onChange} value={value} disabled={disabled} />;
          }}
        />
      </RoleContainer>
      <RoleContainer data-test-id="AgentFileEncryption">
        <RoleText disabled={disabled}>
          {intl.formatMessage({ id: 'desk.settings.security.fileEncryption.radio.title.agent' })}
        </RoleText>
        <Controller
          control={control}
          rules={{ required: true }}
          name="fileEncryptionAgentPermission"
          render={({ onChange, value, name }) => {
            return <FileEncryptionRadioGroup name={name} onChange={onChange} value={value} disabled={disabled} />;
          }}
        />
      </RoleContainer>
    </SettingsGridCard>
  );
});
