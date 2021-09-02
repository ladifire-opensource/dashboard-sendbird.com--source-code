import { FC, useRef, ComponentProps, useState } from 'react';

import { SimpleInterpolation } from 'styled-components';

import { Icon } from 'feather';
import { Moment } from 'moment-timezone';

import { DATE_TYPES } from '@constants';

import { Popover } from '../popover';
import { Calendar } from './calendar';
import { MonthTargetStart, MonthTarget, MonthIcon, MonthWrapper } from './components';

type Props = {
  value: Moment;
  onChange: (value: Moment) => void;
  placement?: ComponentProps<typeof Popover>['placement'];
  offset?: ComponentProps<typeof Popover>['offset'];
  defaultIsOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  usePortal?: boolean;
  className?: string;
  targetStyles?: SimpleInterpolation;
  isDateSelectable?: (date: Moment) => boolean;
};

export const MonthSinglePicker: FC<Props> = ({
  placement = 'bottom-start',
  offset,
  defaultIsOpen = false,
  onOpen,
  onClose,
  onChange,
  value,
  usePortal = true,
  className,
  targetStyles,
  isDateSelectable,
}) => {
  const [isOpen, setIsOpen] = useState(defaultIsOpen);
  const [selectedDate, setSelectedDate] = useState(value);

  const popoverRef = useRef<Popover>(null);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleDateChange: ComponentProps<typeof Calendar>['handleDateChange'] = (date, clickedItem) => {
    setSelectedDate(date);

    if (clickedItem.type !== 'year') {
      // If the update is due to year change, we have to wait for a month/week to be selected.
      onChange(date);
      handleClose();
    }
  };

  return (
    <div className={className}>
      <Popover
        ref={popoverRef}
        placement={placement}
        offset={offset}
        isOpen={isOpen}
        onOpen={handleOpen}
        onClose={handleClose}
        target={
          <MonthTarget isActive={isOpen} styles={targetStyles} data-test-id="MonthSinglePickerTarget">
            <MonthTargetStart>{value ? value.format('MMM, YYYY') : null}</MonthTargetStart>
            <MonthIcon>
              <Icon icon="calendar" size={20} />
            </MonthIcon>
          </MonthTarget>
        }
        content={
          <MonthWrapper>
            <Calendar
              dateTypes={DATE_TYPES.MONTH}
              types="start"
              handleDateChange={handleDateChange}
              isDateSelectable={isDateSelectable}
              range={{ start: selectedDate, end: selectedDate }}
            />
          </MonthWrapper>
        }
        interactionHover={false}
        canOutsideClickClose={true}
        usePortal={usePortal}
      />
    </div>
  );
};
