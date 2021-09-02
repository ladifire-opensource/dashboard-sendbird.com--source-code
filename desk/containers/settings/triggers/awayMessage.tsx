import { memo, useEffect, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { useForm, useField, HTMLToggleElement } from 'feather';

import { deskActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { SettingsTextareaGrid } from '@common/containers/layout';
import { Unsaved, useShowDialog } from '@hooks';

type Props = {
  awayMessage: Project['awayMessage'];
  isUpdating: DeskStoreState['isUpdating'];
  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export const AwayMessage = memo<Props>(({ awayMessage, isUpdating, setUnsaved, updateProjectRequest }) => {
  const showDialog = useShowDialog();
  const intl = useIntl();
  const project = useSelector((state: RootState) => state.desk.project);
  const form = useForm({
    onSubmit: ({ awayMessage }) => {
      updateProjectRequest({ awayMessage, onSuccess: form.onSuccess });
    },
  });
  const field = useField<string, HTMLTextAreaElement>('awayMessage', form, {
    defaultValue: awayMessage,
    validate: (value) => {
      if (!value.trim()) {
        return intl.formatMessage({ id: 'desk.settings.triggers.awayMessage.error.required' });
      }
      return '';
    },
  });

  const toggleField = useField<boolean, HTMLToggleElement>('enabled', form, {
    defaultValue: project.awayMessageEnabled,
    isControlled: true,
  });

  useEffect(() => {
    setUnsaved(field.updatable);
  }, [field.updatable, setUnsaved]);

  const handleToggleChange = useCallback(
    (value: boolean) => {
      showDialog({
        dialogTypes: DialogType.Confirm,
        dialogProps: {
          title: intl.formatMessage({
            id: value
              ? 'desk.settings.triggers.awayMessage.confirmDialog.off2on.title'
              : 'desk.settings.triggers.awayMessage.confirmDialog.on2off.title',
          }),
          description: intl.formatMessage({
            id: value
              ? 'desk.settings.triggers.awayMessage.confirmDialog.off2on.desc'
              : 'desk.settings.triggers.awayMessage.confirmDialog.on2off.desc',
          }),
          confirmText: intl.formatMessage({
            id: value
              ? 'desk.settings.triggers.awayMessage.confirmDialog.off2on.button.confirm'
              : 'desk.settings.triggers.awayMessage.confirmDialog.on2off.button.confirm',
          }),
          cancelText: intl.formatMessage({
            id: value
              ? 'desk.settings.triggers.awayMessage.confirmDialog.off2on.button.cancel'
              : 'desk.settings.triggers.awayMessage.confirmDialog.on2off.button.cancel',
          }),
          onConfirm: () => {
            updateProjectRequest({ awayMessageEnabled: value });
            toggleField.updateValue(value);
          },
        },
      });
    },
    [intl, showDialog, toggleField, updateProjectRequest],
  );

  return (
    <SettingsTextareaGrid
      title={intl.formatMessage({ id: 'desk.settings.triggers.awayMessage.title' })}
      description={intl.formatMessage({ id: 'desk.settings.triggers.awayMessage.desc' })}
      form={form}
      field={field}
      gridItemConfig={{
        subject: {
          alignSelf: 'start',
        },
      }}
      isFetching={isUpdating}
      toggleField={toggleField}
      onToggleChange={handleToggleChange}
      saveText={intl.formatMessage({ id: 'desk.settings.triggers.actions.save' })}
      cancelText={intl.formatMessage({ id: 'desk.settings.triggers.actions.cancel' })}
    />
  );
});
