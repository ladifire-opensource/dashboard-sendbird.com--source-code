import React, { FC, useState, ComponentProps, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { InputText, transitionDefault, cssVariables } from 'feather';

const TimeText = styled.span<{ disabled?: boolean }>`
  display: inline-block;
  font-size: 14px;
  line-height: 1.43;
  letter-spacing: -0.1px;
  color: ${({ disabled }) => (disabled ? cssVariables('neutral-5') : cssVariables('neutral-10'))};
  margin-left: 8px;
  padding-top: 9px;
  transition: color 0.2s ${transitionDefault};

  &:not(:last-child) {
    margin-right: 24px;
  }
`;

const HourMinuteWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  ${({ disabled }) =>
    disabled &&
    css`
      ${TimeText} {
        color: ${cssVariables('neutral-5')} !important;
      }
    `}
`;

const InputWrapper = styled.div`
  width: 134px;
`;

type InputError = ComponentProps<typeof InputText>['error'];

type Props = {
  minutes: number;
  maxHour?: number;
  disabled?: boolean;
  onChange?: (hour: number, minute: number, error?: boolean) => void;
  error?: boolean;
};

const defaultError = { hasError: false, message: '' };

export const HourMinuteInput: FC<Props> = ({
  minutes = 0,
  maxHour = 167,
  disabled = false,
  onChange,
  error = false,
}) => {
  const intl = useIntl();
  const initialRef = useRef(minutes);
  const [hour, setHour] = useState(Math.floor(minutes / 60));
  const [minute, setMinute] = useState(minutes % 60);
  const [hourError, setHourError] = useState<InputError>(defaultError);
  const [minuteError, setMinuteError] = useState<InputError>(defaultError);

  const handleHourChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const updatedHour = parseInt(e.target.value, 10) || 0;
    setHour(updatedHour);
    const isOverMaxHour = updatedHour > maxHour;
    if (isOverMaxHour) {
      setHourError({
        hasError: true,
        message: intl.formatMessage({ id: 'desk.settings.automation.hourMinuteInput.error.hour' }, { limit: maxHour }),
      });
    } else {
      setHourError(defaultError);
    }
    onChange?.(updatedHour, minute, isOverMaxHour || minuteError?.hasError);
  };

  const handleMinuteChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const updatedMinute = parseInt(e.target.value, 10) || 0;
    setMinute(updatedMinute);
    const isOverMaxMinute = updatedMinute > 59;
    if (isOverMaxMinute) {
      setMinuteError({
        hasError: true,
        message: intl.formatMessage({ id: 'desk.settings.automation.hourMinuteInput.error.minutes' }),
      });
    } else {
      setMinuteError(defaultError);
    }
    onChange?.(hour, updatedMinute, isOverMaxMinute || hourError?.hasError);
  };

  useEffect(() => {
    if (minutes === initialRef.current) {
      setHour(Math.floor(minutes / 60));
      setMinute(minutes % 60);
    }
  }, [minutes]);

  useEffect(() => {
    if (!error) {
      setHourError(defaultError);
      setMinuteError(defaultError);
    }
  }, [error]);
  return (
    <HourMinuteWrapper disabled={disabled}>
      <InputWrapper>
        <InputText
          pattern="[0-9]*"
          value={hour}
          onChange={handleHourChange}
          error={hourError?.hasError ? hourError : defaultError}
          data-test-id="HourInput"
          disabled={disabled}
        />
      </InputWrapper>
      <TimeText>{intl.formatMessage({ id: 'desk.settings.automation.hourMinuteInput.lbl.hour' })}</TimeText>
      <InputWrapper>
        <InputText
          pattern="[0-9]*"
          value={minute}
          onChange={handleMinuteChange}
          error={minuteError?.hasError ? minuteError : defaultError}
          data-test-id="MinuteInput"
          disabled={disabled}
        />
      </InputWrapper>
      <TimeText>{intl.formatMessage({ id: 'desk.settings.automation.hourMinuteInput.lbl.minute' })}</TimeText>
    </HourMinuteWrapper>
  );
};
