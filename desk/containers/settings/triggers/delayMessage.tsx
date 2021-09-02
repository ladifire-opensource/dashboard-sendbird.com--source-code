import { memo, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { useForm, useField, InputText, InputTextarea, cssVariables, Toggle, HTMLToggleElement } from 'feather';

import { deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsGridCard } from '@common/containers/layout';
import { Unsaved, useShowDialog } from '@hooks';

type Props = {
  delayMessage: Project['awayMessage'];
  delayMessageTime: Project['delayMessageTime'];
  isUpdating: DeskStoreState['isUpdating'];
  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

const ToggleContainer = styled.div`
  margin-bottom: 16px;
`;

const DelayTime = styled.div<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  font-size: 14px;
  line-height: 1.43;
  color: ${({ disabled }) => (disabled ? cssVariables('neutral-5') : cssVariables('neutral-10'))};
  border-bottom: 1px solid ${cssVariables('neutral-3')};
  cursor: ${({ disabled }) => disabled && 'default'};

  > div {
    width: 131px;
  }
`;

const DelayMessageBody = styled.div`
  margin-top: 16px;
`;

export const DelayMessage = memo<Props>(
  ({ delayMessage, delayMessageTime, isUpdating, setUnsaved, updateProjectRequest }) => {
    const showDialog = useShowDialog();
    const intl = useIntl();
    const project = useSelector((state: RootState) => state.desk.project);
    const form = useForm({
      onSubmit: ({ delayMessage, delayMessageTime }) => {
        updateProjectRequest({ delayMessage, delayMessageTime, onSuccess: form.onSuccess });
      },
    });
    const delayTimeField = useField('delayMessageTime', form, {
      defaultValue: delayMessageTime.toString(),
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage({ id: 'desk.settings.triggers.delayMessage.seconds.error.required' });
        }

        if (!/^[0-9]*$/g.test(value.trim())) {
          return intl.formatMessage({ id: 'desk.settings.triggers.delayMessage.seconds.error.onlyNumbers' });
        }
        return '';
      },
    });
    const delayMessageField = useField<string, HTMLTextAreaElement>('delayMessage', form, {
      defaultValue: delayMessage,
      validate: (value) => {
        if (!value.trim()) {
          return intl.formatMessage({ id: 'desk.settings.triggers.delayMessage.message.error.required' });
        }
        return '';
      },
    });

    const toggleField = useField<boolean, HTMLToggleElement>('enabled', form, {
      defaultValue: project.delayMessageEnabled,
      isControlled: true,
    });

    const handleToggleClick = useCallback(
      (checked: boolean) => {
        showDialog({
          dialogTypes: DialogType.Confirm,
          dialogProps: {
            title: intl.formatMessage({
              id: checked
                ? 'desk.settings.triggers.delayMessage.confirmDialog.off2on.title'
                : 'desk.settings.triggers.delayMessage.confirmDialog.on2off.title',
            }),
            description: intl.formatMessage({
              id: checked
                ? 'desk.settings.triggers.delayMessage.confirmDialog.off2on.desc'
                : 'desk.settings.triggers.delayMessage.confirmDialog.on2off.desc',
            }),
            confirmText: intl.formatMessage({
              id: checked
                ? 'desk.settings.triggers.delayMessage.confirmDialog.off2on.button.confirm'
                : 'desk.settings.triggers.delayMessage.confirmDialog.on2off.button.confirm',
            }),
            cancelText: intl.formatMessage({
              id: checked
                ? 'desk.settings.triggers.delayMessage.confirmDialog.off2on.button.cancel'
                : 'desk.settings.triggers.delayMessage.confirmDialog.on2off.button.cancel',
            }),
            onConfirm: () => {
              updateProjectRequest({ delayMessageEnabled: checked });
              toggleField?.updateValue(checked);
            },
          },
        });
      },
      [intl, showDialog, toggleField, updateProjectRequest],
    );

    const handleSaveClick = (e) => {
      form.onSubmit(e);
    };

    const updatables = [delayTimeField.updatable, delayMessageField.updatable];

    useEffect(() => {
      setUnsaved(updatables.some((updatable) => updatable));
    }, [setUnsaved, updatables]);

    return (
      <SettingsGridCard
        title={intl.formatMessage({ id: 'desk.settings.triggers.delayMessage.title' })}
        description={intl.formatMessage({ id: 'desk.settings.triggers.delayMessage.desc' })}
        gridItemConfig={{
          subject: {
            alignSelf: 'start',
          },
        }}
        showActions={updatables.some((updatable) => updatable)}
        actions={[
          {
            key: 'delay-message-cancel',
            label: intl.formatMessage({ id: 'desk.settings.triggers.actions.cancel' }),
            buttonType: 'tertiary',
            onClick: form.reset,
          },
          {
            key: 'delay-message-save',
            label: intl.formatMessage({ id: 'desk.settings.triggers.actions.save' }),
            buttonType: 'primary',
            onClick: handleSaveClick,
            isLoading: isUpdating,
            disabled: isUpdating || delayTimeField.error.hasError || delayMessageField.error.hasError,
          },
        ]}
      >
        <ToggleContainer>
          <Toggle checked={toggleField.value} onChange={handleToggleClick} />
        </ToggleContainer>
        <DelayTime data-test-id="DelayTime" disabled={!toggleField.value}>
          {intl.formatMessage(
            { id: 'desk.settings.triggers.delayMessage.periodInput' },
            {
              input: (
                <InputText
                  data-test-id="InputText"
                  ref={delayTimeField.ref}
                  name={delayTimeField.name}
                  error={delayTimeField.error}
                  onChange={delayTimeField.onChange}
                  disabled={!toggleField.value}
                />
              ),
              space: <span css="width: 8px;"></span>,
            },
          )}
        </DelayTime>
        <DelayMessageBody data-test-id="DelayMessageContainer">
          <InputTextarea
            data-test-id="InputTextarea"
            ref={delayMessageField.ref}
            name={delayMessageField.name}
            error={delayMessageField.error}
            onChange={delayMessageField.onChange}
            disabled={!toggleField.value}
          />
        </DelayMessageBody>
      </SettingsGridCard>
    );
  },
);
