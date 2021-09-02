import { useCallback, FC } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Dropdown, DropdownProps } from 'feather';

import { TicketPriority } from '@constants/desk';
import { PriorityBadge } from '@ui/components';
import { onDropdownChangeIgnoreNull, getTicketPriorityLabelKey } from '@utils';

type PriorityOption = Priority | 'ALL';

type Props = {
  selectedItem?: Priority;
  onChange: (item: Priority | undefined) => void;
} & Pick<DropdownProps<PriorityOption>, 'disabled' | 'width'>;

const priorityOptions: PriorityOption[] = ['ALL', ...Object.values(TicketPriority)];

const PriorityFilterToggleContent = styled.div`
  margin-left: 16px;
  line-height: 20px;
  font-size: 14px;
  font-weight: 500;
`;

export const TicketPriorityFilter: FC<Props> = ({ selectedItem, onChange, ...dropdownProps }) => {
  const intl = useIntl();

  const renderItem = useCallback(
    (item: PriorityOption) =>
      item === 'ALL' ? (
        intl.formatMessage({ id: 'desk.tickets.filter.priority.allPriorities' })
      ) : (
        <PriorityBadge priority={item} showLabel={true} />
      ),
    [intl],
  );

  return (
    <Dropdown<PriorityOption>
      size="small"
      items={priorityOptions}
      selectedItem={selectedItem || 'ALL'}
      itemToElement={renderItem}
      onChange={onDropdownChangeIgnoreNull((item) => onChange(item === 'ALL' ? undefined : item))}
      itemToString={(item) =>
        intl.formatMessage({
          id: item === 'ALL' ? 'desk.tickets.filter.priority.allPriorities' : getTicketPriorityLabelKey(item),
        })
      }
      toggleRenderer={({ selectedItem }) =>
        selectedItem && <PriorityFilterToggleContent>{renderItem(selectedItem)}</PriorityFilterToggleContent>
      }
      {...dropdownProps}
    />
  );
};
