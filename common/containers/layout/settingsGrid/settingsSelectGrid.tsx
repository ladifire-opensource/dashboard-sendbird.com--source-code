import React, { useCallback } from 'react';
import { useIntl } from 'react-intl';

import { Field, Form, Dropdown, DropdownProps, InputSelectItem } from 'feather';

import { onDropdownChangeIgnoreNull } from '@utils';

import { SettingsGridCard, SettingsGridCardProps } from './index';

export interface SettingsSelectItem {
  node?: React.ReactNode;
  label: string;
  value: string | number;
}

interface GetSelectedItem {
  (items: InputSelectItem[], value: InputSelectItem['value']): InputSelectItem;
}

interface SettingsCommonGridProps extends SettingsGridCardProps {
  field: Field<InputSelectItem, typeof Dropdown>;
  form: Form;
  isFetching?: boolean;
}

type Props = SettingsCommonGridProps & DropdownProps<SettingsSelectItem>;

export const defaultItemToString = (item: SettingsSelectItem) => item.label;
export const defaultItemToElement = (item: SettingsSelectItem) => (item.node ? item.node : item.label);

export const getSelectedItem: GetSelectedItem = (items, value) => {
  return items.find((item) => item.value === value) || items[0];
};

export const SettingsSelectGrid: React.FC<Props> = ({
  field,
  form,
  title,
  titleColumns,
  description,
  isFetching,
  items,
  itemsType,
  initialSelectedItem,
  size,
  variant,
  placement,
  placeholder,
  useSearch,
  onSearchChange,
  emptyView,
  footer,
  hasError,
  isItemDisabled,
  disabled = false,
  readOnly = false,
  itemHeight,
}) => {
  const intl = useIntl();

  const onSaveButtonClick = useCallback((e) => form.onSubmit(e), [form]);

  return (
    <SettingsGridCard
      title={title}
      description={description}
      titleColumns={titleColumns}
      showActions={field.updatable}
      actions={[
        {
          key: `${field.name}-cancel`,
          label: intl.formatMessage({ id: 'label.cancel' }),
          buttonType: 'tertiary',
          onClick: form.reset,
        },
        {
          key: `${field.name}-save`,
          label: intl.formatMessage({ id: 'label.save' }),
          buttonType: 'primary',
          onClick: onSaveButtonClick,
          isLoading: isFetching,
          disabled: isFetching || disabled,
        },
      ]}
    >
      <Dropdown
        size={size}
        width="100%"
        variant={variant}
        placement={placement}
        placeholder={placeholder}
        useSearch={useSearch}
        emptyView={emptyView}
        footer={footer}
        hasError={hasError}
        selectedItem={field.value}
        initialSelectedItem={initialSelectedItem}
        items={items}
        itemsType={itemsType}
        itemToString={defaultItemToString}
        itemToElement={defaultItemToElement}
        onChange={onDropdownChangeIgnoreNull(field.updateValue)}
        isItemDisabled={isItemDisabled}
        onSearchChange={onSearchChange}
        disabled={disabled}
        readOnly={readOnly}
        itemHeight={itemHeight}
      />
    </SettingsGridCard>
  );
};
