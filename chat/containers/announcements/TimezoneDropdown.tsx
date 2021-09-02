import { FC, useState } from 'react';

import { DropdownProps, Dropdown } from 'feather';

import { TIMEZONE_OPTIONS } from '@constants';

type Props = Omit<
  DropdownProps<typeof TIMEZONE_OPTIONS[number]>,
  'items' | 'selectedItem' | 'initialSelectedItem' | 'onChange' | 'onItemSelected'
> & {
  initialSelectedItem: string;
  onChange?: (value: string) => void;
  onItemSelected?: (value: string) => void;
};

export const TimezoneDropdown: FC<Props> = ({
  initialSelectedItem: initialSelectedValue,
  onChange: onChangeProp,
  onItemSelected: onItemSelectedProp,
  useSearch = true,
  ...props
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const initialSelectedItem =
    TIMEZONE_OPTIONS.find((item) => item.value === initialSelectedValue) ?? TIMEZONE_OPTIONS[0];
  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  return (
    <Dropdown<typeof TIMEZONE_OPTIONS[number]>
      {...props}
      items={TIMEZONE_OPTIONS.filter((item) => item.label.toLowerCase().includes(searchQuery.toLowerCase()))}
      itemToString={(item) => item.label}
      selectedItem={selectedItem}
      initialSelectedItem={initialSelectedItem}
      onChange={(item) => {
        if (item) {
          onChangeProp?.(item.value);
        }
      }}
      onItemSelected={(item) => {
        if (item) {
          setSelectedItem(item);
          onItemSelectedProp?.(item.value);
        }
      }}
      useSearch={useSearch}
      onSearchChange={setSearchQuery}
      itemHeight={32}
      modifiers={{ hide: { enabled: false }, preventOverflow: { enabled: false }, flip: { enabled: false } }}
    />
  );
};
