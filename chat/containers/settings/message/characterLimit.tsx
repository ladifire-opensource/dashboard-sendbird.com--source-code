import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

import { useForm, useField, Dropdown, InputSelectItem } from 'feather';

import { coreActions } from '@actions';
import { SettingsSelectGrid, getSelectedItem } from '@common/containers/layout/settingsGrid/settingsSelectGrid';
import { Unsaved } from '@hooks';

type Props = {
  application: Application;
  isFetchingMaxLengthMessage: SettingsState['isFetchingMaxLengthMessage'];
  isEditable: boolean;
  setUnsaved: Unsaved['setUnsaved'];
  updateMaxLengthMessageRequest: typeof coreActions.updateMaxLengthMessageRequest;
};

export const CharacterLimit: React.FC<Props> = React.memo(
  ({ application, isFetchingMaxLengthMessage, isEditable, setUnsaved, updateMaxLengthMessageRequest }) => {
    const intl = useIntl();

    const items = [50, 100, 200, 500, 1000, 5000, 10000, 20000].map((value) => {
      const text = intl.formatMessage(
        { id: 'core.settings.application.message.characterLimit.option_length' },
        { length: value },
      );
      return {
        value,
        label: text,
        node: text,
      };
    });

    const form = useForm({
      onSubmit: ({ maxLengthItem }) => {
        updateMaxLengthMessageRequest({ max_length_message: maxLengthItem.value, onSuccess: form.onSuccess });
      },
    });
    const field = useField<InputSelectItem, typeof Dropdown>('maxLengthItem', form, {
      defaultValue: getSelectedItem(items, application.max_length_message),
      isControlled: true,
    });

    useEffect(() => {
      setUnsaved(field.updatable);
    }, [field.updatable, setUnsaved]);

    return (
      <SettingsSelectGrid
        title={intl.formatMessage({ id: 'core.settings.application.message.characterLimit.title' })}
        form={form}
        field={field}
        items={items}
        isFetching={isFetchingMaxLengthMessage}
        readOnly={!isEditable}
      />
    );
  },
);
