import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { useForm, useField, Dropdown, InputSelectItem } from 'feather';

import { deskActions } from '@actions';
import { SettingsSelectGrid } from '@common/containers/layout';
import { TIMEZONE_OPTIONS } from '@constants';
import { Unsaved } from '@hooks';

type Props = {
  timezone: Project['timezone'];
  isUpdating: DeskStoreState['isUpdating'];
  updateProjectRequest: typeof deskActions.updateProjectRequest;
  setUnsaved: Unsaved['setUnsaved'];
};

const timezoneOptions = TIMEZONE_OPTIONS.map(({ label, value }) => ({ value, label, node: label }));

export const DeskTimezone: React.FC<Props> = ({ timezone, isUpdating, updateProjectRequest, setUnsaved }) => {
  const intl = useIntl();
  const [searchQuery, setSearchQuery] = useState('');

  const defaultTimezoneOption = timezoneOptions.find((option) => option.value === timezone) || timezoneOptions[0];
  const form = useForm({
    onSubmit: ({ deskTimezone }) => {
      updateProjectRequest({ timezone: deskTimezone.value, onSuccess: form.onSuccess });
    },
  });
  const field = useField<InputSelectItem, typeof Dropdown>('deskTimezone', form, {
    defaultValue: defaultTimezoneOption,
    isControlled: true,
  });

  const handleSearchQueryChange = (keyword) => {
    setSearchQuery(keyword);
  };

  useEffect(() => {
    setUnsaved(field.updatable);
  }, [field.updatable]);

  return (
    <SettingsSelectGrid
      title={intl.formatMessage({ id: 'desk.settings.general.timezone.title' })}
      description={intl.formatMessage({ id: 'desk.settings.general.timezone.desc' })}
      form={form}
      field={field}
      useSearch={true}
      onSearchChange={handleSearchQueryChange}
      items={timezoneOptions.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))}
      isFetching={isUpdating}
      itemHeight={32}
    />
  );
};
