import { useRef, useState, useEffect, forwardRef, ReactNode, useImperativeHandle } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Toggle, cssVariables } from 'feather';
import isEqual from 'lodash/isEqual';
import moment, { Moment } from 'moment-timezone';

import TimePicker from '@ui/components/timePicker';

type Value = { ceaseAt: Moment | null; resumeAt: Moment | null };

type Props = {
  className?: string;
  timezone?: string;
  onChange?: (value: Value) => void;
  defaultValue?: Value;
  error?: ReactNode;
};

const Container = styled.div`
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  grid-auto-flow: row;
  grid-gap: 4px 16px;
  align-items: center;
`;

const TimePickerLabel = styled.label`
  display: flex;
  flex-direction: row;
  align-items: center;

  span {
    flex: none;
    font-size: 12px;
    font-weight: 500;
    line-height: 1;
  }
`;

const FullWidthTimePicker = styled(TimePicker).attrs({ blockPast: false, minuteInterval: 1 })`
  width: 100%;
`;

const ErrorMessage = styled.div`
  grid-column: 2 / -1;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('red-5')};
`;

export const DoNotDisturbTimePicker = forwardRef<{ focus: () => void }, Props>(
  ({ className, onChange, error, timezone = moment.tz.guess(), defaultValue }, ref) => {
    const currentValue = useRef<Value>({ ceaseAt: null, resumeAt: null });
    const [ceaseAt, setCeaseAt] = useState<Moment | null>(defaultValue?.ceaseAt ?? null);
    const [resumeAt, setResumeAt] = useState<Moment | null>(defaultValue?.resumeAt ?? null);

    // If defaultValue is defined, set the initial state of the toggle on.
    const [isEnabled, setIsEnabled] = useState(!!(defaultValue?.ceaseAt && defaultValue?.resumeAt));

    const onChangeRef = useRef<typeof onChange>();
    const containerRef = useRef<HTMLDivElement>(null);
    const intl = useIntl();

    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
      const newValue = isEnabled ? { ceaseAt, resumeAt } : { ceaseAt: null, resumeAt: null };

      if (!isEqual(currentValue.current, newValue)) {
        currentValue.current = newValue;
        onChangeRef.current?.(newValue);
      }
    }, [isEnabled, resumeAt, ceaseAt]);

    useImperativeHandle(ref, () => ({
      focus: () => {
        const { current: containerElement } = containerRef;
        if (containerElement) {
          const focusableElement = containerElement.querySelector('input') as HTMLElement;
          focusableElement?.focus();
        }
      },
    }));

    return (
      <Container className={className} ref={containerRef}>
        <Toggle
          checked={isEnabled}
          onChange={(value) => {
            setIsEnabled(!!value);
          }}
        />
        <TimePickerLabel>
          <span css="margin-right: 24px;">
            {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.ceaseAt' })}
          </span>
          <FullWidthTimePicker
            // when isEnabled changes, we have to force re-render time pickers.
            key={isEnabled ? 'enabled' : 'disabled'}
            name="cease_at"
            disabled={!isEnabled}
            time={isEnabled ? ceaseAt?.tz(timezone) : null}
            onChange={setCeaseAt}
          />
        </TimePickerLabel>
        <TimePickerLabel>
          <span css="margin-right: 16px;">
            {intl.formatMessage({ id: 'chat.announcements.createAnnouncement.fields_lbl.resumeAt' })}
          </span>
          <FullWidthTimePicker
            key={isEnabled ? 'enabled' : 'disabled'}
            name="resume_at"
            disabled={!isEnabled}
            time={isEnabled ? resumeAt?.tz(timezone) : null}
            onChange={setResumeAt}
          />
        </TimePickerLabel>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Container>
    );
  },
);
