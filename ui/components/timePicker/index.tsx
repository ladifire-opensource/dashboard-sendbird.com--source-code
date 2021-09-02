import { Component } from 'react';

import styled from 'styled-components';

import { cssVariables, Icon, IconButton } from 'feather';
import moment, { Moment } from 'moment-timezone';
import TimePicker from 'rc-time-picker';

import { EMPTY_TEXT } from '@constants';

interface TimePickerProps {
  name?: string;
  time: moment.Moment | null;
  minuteInterval?: number;
  showSecond?: boolean | undefined;
  placement?: string;
  blockPast?: boolean;
  allowEmpty?: boolean;
  size?: 'small' | 'medium';
  onChange: (value: Moment | null) => void;
  className?: string;
  disabled?: boolean;
  hasError?: boolean;
}

const StyledTimePicker = styled.div<Pick<TimePickerProps, 'size' | 'hasError'>>`
  position: relative;
  cursor: pointer;

  .rc-time-picker {
    display: block;
    box-sizing: border-box;
  }

  .rc-time-picker * {
    box-sizing: border-box;
  }

  .rc-time-picker-input {
    width: 100%;
    position: relative;
    display: inline-block;
    padding: 0 16px;
    height: ${({ size }) => (size === 'small' ? 32 : 40)}px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    color: ${cssVariables('neutral-10')};
    background-color: #fff;
    background-image: none;
    border: 1px solid ${cssVariables('neutral-3')};
    border-radius: 4px;
    transition: border 0.2s cubic-bezier(0.645, 0.045, 0.355, 1), background 0.2s cubic-bezier(0.645, 0.045, 0.355, 1),
      box-shadow 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

    ${({ hasError }) => hasError && `border-color: ${cssVariables('red-5')};`}

    &:hover {
      border-color: ${cssVariables('purple-7')};
    }

    &:focus {
      outline: 0;
    }

    &:disabled {
      color: ${cssVariables('neutral-5')};
      border-color: ${cssVariables('neutral-2')};
      background: white;
      cursor: default;

      &::placeholder {
        color: ${cssVariables('neutral-5')};
      }
    }
  }
`;

const IconTimePicker = styled.div<{ disabled: boolean }>`
  position: absolute;
  top: 50%;
  margin-top: -10px;
  right: 14px;

  ${({ disabled }) =>
    disabled &&
    `
    opacity: 0.3;
    cursor: default;
  `}
`;

class TimePick extends Component<TimePickerProps, {}> {
  public static defaultProps: Partial<TimePickerProps> = {
    time: null,
    minuteInterval: 0,
    showSecond: false,
    placement: 'bottomLeft',
    allowEmpty: true,
    size: 'medium',
    disabled: false,
  };

  private generateOptions = (length, disableLimit, offset = 0) => {
    const options: number[] = [];
    for (let value = 0; value < length; value++) {
      const lessThanLimit = value < parseInt(disableLimit) + offset;

      if (lessThanLimit) {
        options.push(value);
      }
    }
    return options;
  };

  private isValid = (dateTime: moment.Moment | null): boolean => {
    if (dateTime == null) {
      return false;
    }
    const now = moment.tz(moment.tz.guess());
    return dateTime.isAfter(now);
  };

  private disableHours = () => {
    let disables: number[] = [];
    if (!this.isValid(this.props.time) && this.props.blockPast) {
      const disableLimitHour = moment.tz(moment.tz.guess()).hours();
      disables = this.generateOptions(24, disableLimitHour);
    }
    return disables;
  };

  private disableMinutes = () => {
    let disables: number[] = [];
    const { blockPast } = this.props;
    const validTime = !this.isValid(this.props.time);
    const disableLimitMinute = moment.tz(moment.tz.guess()).minutes();

    if (validTime && blockPast) {
      disables = this.generateOptions(60, disableLimitMinute, 0);
    }

    return disables;
  };

  private handleChange = (payload: Moment | null) => {
    this.props.onChange(payload);
  };

  public render() {
    const {
      name,
      time,
      showSecond,
      placement,
      allowEmpty,
      minuteInterval,
      size,
      className,
      disabled = false,
      hasError,
    } = this.props;

    return (
      <StyledTimePicker className={className} size={size} hasError={hasError}>
        <TimePicker
          name={name}
          value={time}
          showSecond={showSecond}
          minuteStep={minuteInterval}
          placement={placement}
          popupClassName="sb-timepicker"
          onChange={this.handleChange}
          disabled={disabled}
          disabledHours={this.disableHours}
          disabledMinutes={this.disableMinutes}
          inputReadOnly={true}
          allowEmpty={allowEmpty}
          placeholder={EMPTY_TEXT}
          clearIcon={
            <IconButton
              icon="close"
              buttonType="secondary"
              size="small"
              css={`
                position: absolute;
                top: 50%;
                margin-top: -16px;
                right: 6px;
                background-color: white;
                z-index: 1; // to hide clock icon

                svg {
                  fill: ${cssVariables('neutral-9')};
                }
              `}
            />
          }
        />
        <IconTimePicker disabled={disabled}>
          <Icon icon="time" size={20} color={cssVariables('neutral-9')} />
        </IconTimePicker>
      </StyledTimePicker>
    );
  }
}

export default TimePick;
