import { useRef, useState, useEffect, forwardRef, useImperativeHandle, MutableRefObject } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Toggle, InputText, cssVariables } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { DEFAULT_DATE_TIME_FORMAT } from '@constants';
import DateTimePicker from '@ui/components/dateTimePicker';

import { formatTimestampWithTimezone } from './formatters';

type Props = {
  className?: string;
  onChange?: (value: Moment | null) => void;
  defaultValue?: Moment | null;
  currentScheduledAtRef: MutableRefObject<Moment>;
  minuteInterval?: number;
  error?: string;
  timezone: string;
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
`;

const ErrorMessage = styled.div`
  flex-basis: 100%;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('red-5')};
  margin-top: 4px;
  margin-left: 56px;
`;

const HelperText = styled(ErrorMessage)`
  color: ${cssVariables('purple-7')};
`;

const FakeEmptyDateTimePicker = () => (
  <div
    css={`
      flex: 1;
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 8px;
      padding-left: 2px;
      pointer-events: none;

      & > * {
        margin-top: 0 !important;
      }
    `}
  >
    <InputText icons={[{ icon: 'calendar' }]} value="—" disabled={true} />
    <InputText icons={[{ icon: 'time' }]} value="—" disabled={true} />
  </div>
);

const add30Minutes = (momentObj: Moment) => moment(momentObj).add(30, 'minute').second(0).millisecond(0);

export const EndAtDateTimePicker = forwardRef<{ focus: () => void }, Props>(
  (
    {
      className,
      onChange,
      defaultValue,
      currentScheduledAtRef,
      error,
      timezone = moment.tz.guess(),
      minuteInterval = 1,
    },
    ref,
  ) => {
    const intl = useIntl();
    const currentValue = useRef<Moment | null>(null);

    // If defaultValue is defined, set the initial state of the toggle on.
    const [isEnabled, setIsEnabled] = useState(!!defaultValue);

    const [date, setDate] = useState<Moment | null>(defaultValue ?? null);
    const onChangeRef = useRef<typeof onChange>();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      const newValue = isEnabled ? date : null;

      if (currentValue.current !== newValue) {
        currentValue.current = newValue;
        onChangeRef.current?.(newValue);
      }
    }, [isEnabled, date]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const { current: containerElement } = containerRef;
        if (containerElement) {
          const focusableElement = containerElement.querySelector('button[aria-haspopup="listbox"]') as HTMLElement;
          focusableElement?.focus();
        }
      },
    }));

    return (
      <Container className={className} ref={containerRef}>
        <Toggle
          checked={isEnabled}
          onChange={(newIsEnabled) => {
            if (newIsEnabled && date == null) {
              // If date has never been set, fill scheduled_at + 30 minutes as a default value.
              setDate(add30Minutes(currentScheduledAtRef.current));
            }
            setIsEnabled(!!newIsEnabled);
          }}
          css={`
            margin-right: 14px;
          `}
        />
        {isEnabled ? (
          <DateTimePicker
            blockPastTime={false}
            minuteInterval={minuteInterval}
            onChange={setDate}
            dateTime={date ?? add30Minutes(currentScheduledAtRef.current)}
            formatDate={(date) => date.format('MMMM D, YYYY')}
            timezone={timezone}
            disabled={!isEnabled}
            css={`
              flex: 1;
            `}
            hasError={!!error}
          />
        ) : (
          <FakeEmptyDateTimePicker />
        )}
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {!error && date && isEnabled && (
          <HelperText data-test-id="HelperText">
            {intl.formatMessage(
              { id: 'chat.announcements.createAnnouncement.fields_lbl.endAt.helperText' },
              { time: formatTimestampWithTimezone(date.clone(), timezone, DEFAULT_DATE_TIME_FORMAT) },
            )}
          </HelperText>
        )}
      </Container>
    );
  },
);
