import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useForm, useField } from 'feather';

import { deskActions } from '@actions';
import { SettingsRadioGridDeprecated } from '@common/containers/layout/settingsGrid/SettingsRadioGridDeprecated';
import { Unsaved } from '@hooks';

type Props = {
  markAsReadType: Project['markAsReadType'];
  isUpdating: DeskStoreState['isUpdating'];

  setUnsaved: Unsaved['setUnsaved'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
};

export enum MarkAsReadTypeEnum {
  AFTER_SEND_MESSAGE = 'AFTER_SEND_MESSAGE',
  AFTER_READ_MESSAGE = 'AFTER_READ_MESSAGE',
}

export const MarkAsReadtype: React.FC<Props> = React.memo(
  ({ markAsReadType, isUpdating, setUnsaved, updateProjectRequest }) => {
    const intl = useIntl();
    const form = useForm({
      onSubmit: ({ markAsReadType }) => {
        updateProjectRequest({ markAsReadType, onSuccess: form.onSuccess });
      },
    });
    const field = useField('markAsReadType', form, { defaultValue: markAsReadType, isControlled: true });

    useEffect(() => {
      setUnsaved(field.updatable);
    }, [field.updatable]);

    return (
      <SettingsRadioGridDeprecated
        title={intl.formatMessage({ id: 'desk.settings.markAsReadType.title' })}
        description={intl.formatMessage(
          { id: 'desk.settings.markAsReadType.desc' },
          { b: (text) => <b css="font-weight: 600;">{text}</b> },
        )}
        radioItems={[
          {
            label: intl.formatMessage({ id: 'desk.settings.markAsReadType.lbl.send' }),
            value: MarkAsReadTypeEnum.AFTER_SEND_MESSAGE,
          },
          {
            label: intl.formatMessage({ id: 'desk.settings.markAsReadType.lbl.read' }),
            value: MarkAsReadTypeEnum.AFTER_READ_MESSAGE,
          },
        ]}
        form={form}
        field={field}
        isFetching={isUpdating}
      />
    );
  },
);
