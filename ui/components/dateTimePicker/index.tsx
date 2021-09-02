import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';

import styled, { css } from 'styled-components';

import { SingleDatePicker, cssVariables } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { PropOf } from '@utils';

import TimePicker from '../timePicker';

export type DateTimePickerRef = { focus: () => void; scrollIntoView: HTMLButtonElement['scrollIntoView'] };

type Props = {
  onChange?: (date: Moment) => void;
  dateTime: Moment;
  blockPastTime?: boolean;
  minuteInterval?: number;
  className?: string;
  disabled?: boolean;
  timezone?: string;
  hasError?: boolean;
  formatDate?: PropOf<typeof SingleDatePicker, 'formatDate'>;
};

const StyledDateTimePicker = styled.div<{ hasError?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 8px;

  ${({ hasError }) =>
    hasError &&
    css`
      & > button {
        border-color: ${cssVariables('red-5')};
      }
    `}
`;

const DateTimePicker = forwardRef<DateTimePickerRef, Props>(
  (
    {
      onChange,
      dateTime,
      disabled,
      timezone = moment.tz.guess(),
      blockPastTime,
      minuteInterval = 1,
      className,
      hasError,
      formatDate,
    },
    ref,
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const timezoneAppliedMoment = useMemo(() => dateTime.clone().tz(timezone), [dateTime, timezone]);

    useImperativeHandle(ref, () => {
      const findFocusableElement = () => {
        return containerRef.current?.querySelector('button');
      };
      return {
        focus: () => findFocusableElement()?.focus(),
        scrollIntoView: (...args) => findFocusableElement()?.scrollIntoView(...args),
      };
    });

    const handleDateChange = (newDate: Moment) => {
      const hour = timezoneAppliedMoment.hour();
      const minute = timezoneAppliedMoment.minute();

      const nextDateTime = timezoneAppliedMoment
        .clone()
        .year(newDate.year())
        .month(newDate.month())
        .date(newDate.date())
        .hour(hour)
        .minute(minute);
      onChange?.(nextDateTime);
    };

    const handleTimeChange = (newTime: Moment) => {
      const newDateTime = timezoneAppliedMoment.clone().hour(newTime.hour()).minute(newTime.minute());
      onChange?.(newDateTime);
    };

    return (
      <StyledDateTimePicker ref={containerRef} className={className} hasError={hasError}>
        <SingleDatePicker
          date={timezoneAppliedMoment}
          onChange={handleDateChange}
          formatDate={formatDate}
          placement="bottom-start"
          popperProps={{
            modifiers: { flip: { boundariesElement: 'scrollParent' } },
          }}
        />
        <TimePicker
          time={timezoneAppliedMoment}
          onChange={handleTimeChange}
          placement="bottomLeft"
          blockPast={blockPastTime}
          minuteInterval={minuteInterval}
          allowEmpty={false}
          disabled={disabled}
          hasError={hasError}
        />
      </StyledDateTimePicker>
    );
  },
);

export default DateTimePicker;
