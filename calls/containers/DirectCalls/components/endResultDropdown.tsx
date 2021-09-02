import { FC } from 'react';
import { useIntl } from 'react-intl';

import { DropdownProps, Dropdown } from 'feather';

import { EndResultLabelIntlKeys } from '../strings';

export type EndResultDropdownItem = 'all' | CallEndResult;

type Props = Omit<
  DropdownProps<EndResultDropdownItem>,
  'items' | 'size' | 'placeholder' | 'itemToString' | 'isMenuScrollable'
>;

const dropdownItems: EndResultDropdownItem[] = [
  'all',
  'completed',
  'canceled',
  'declined',
  'no_answer',
  'timed_out',
  'connection_lost',
  'unknown',
];

const itemToString = (intl: ReturnType<typeof useIntl>) => (item: EndResultDropdownItem) => {
  if (item === 'all') {
    return intl.formatMessage({ id: 'calls.callLogs.endResult_label.all' });
  }
  const key = EndResultLabelIntlKeys[item];
  return key ? intl.formatMessage({ id: key }) : '';
};

export const EndResultDropdown: FC<Props> = (props) => {
  const intl = useIntl();
  return (
    <Dropdown<EndResultDropdownItem>
      items={dropdownItems}
      size="small"
      itemToString={itemToString(intl)}
      isMenuScrollable={false}
      {...props}
    />
  );
};
