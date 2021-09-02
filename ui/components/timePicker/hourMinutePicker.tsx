import { memo } from 'react';

import styled, { css } from 'styled-components';

import { Dropdown, cssVariables, transitionDefault } from 'feather';

type TimePickerOption = {
  label: string;
  value: number;
};

type Props = {
  minutes: number;
  maxHour?: number;
  isDisabled?: boolean;
  onChange?: (minutes: number) => void;
};

const TimeText = styled.span<{ isDisabled?: boolean }>`
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${({ isDisabled }) => (isDisabled ? cssVariables('neutral-5') : cssVariables('neutral-10'))};
  transition: color 0.2s ${transitionDefault};

  &:not(:last-child) {
    margin-right: 24px;
  }
`;

const TimePickerContainer = styled.div<{ isDisabled: boolean }>`
  display: flex;
  align-items: center;

  ${({ isDisabled }) =>
    isDisabled &&
    css`
      ${TimeText} {
        color: ${cssVariables('neutral-5')} !important;
      }
    `}
`;

export const HourMinutePicker = memo<Props>(({ minutes = 0, maxHour = 1, isDisabled = false, onChange }) => {
  const selectedHour = Math.floor(minutes / 60);
  const selectedMinute = minutes % 60;
  const isMaxHourSelected = selectedHour === maxHour;
  const minuteOptions = Array.from({ length: 60 }, (_, index) => ({ label: index.toString(), value: index }));
  const hourOptions = Array.from({ length: maxHour + 1 }, (_, index) => ({ label: index.toString(), value: index }));

  const handleHourChange = (item: TimePickerOption) => {
    const totalMinute = item.value === maxHour ? item.value * 60 : item.value * 60 + selectedMinute;
    onChange?.(totalMinute);
  };

  const handleMinuteChange = (item: TimePickerOption) => {
    onChange?.(selectedHour * 60 + item.value);
  };

  const isDisableMinuteOption = (item: TimePickerOption) => selectedHour === 0 && item.value === 0;

  const getSelectedMinuteItem = () => {
    if (isMaxHourSelected) {
      return minuteOptions[0];
    }

    if (minutes === 0) {
      return minuteOptions[1];
    }

    return minuteOptions.find(({ value }) => value === selectedMinute);
  };

  return (
    <TimePickerContainer isDisabled={isDisabled}>
      {maxHour > 0 && (
        <>
          <Dropdown<TimePickerOption>
            items={hourOptions}
            width={96}
            selectedItem={hourOptions.find(({ value }) => value === selectedHour)}
            itemToString={(item) => item.label}
            onItemSelected={handleHourChange}
            disabled={isDisabled}
          />
          <TimeText>hours</TimeText>
        </>
      )}
      <Dropdown<TimePickerOption>
        items={minuteOptions}
        itemToString={(item) => item.label}
        width={96}
        selectedItem={getSelectedMinuteItem()}
        isItemDisabled={isDisableMinuteOption}
        onItemSelected={handleMinuteChange}
        disabled={isDisabled || isMaxHourSelected}
      />
      <TimeText isDisabled={isMaxHourSelected}>minutes</TimeText>
    </TimePickerContainer>
  );
});
