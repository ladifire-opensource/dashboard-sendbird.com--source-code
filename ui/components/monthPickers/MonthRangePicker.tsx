import { Component } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, Icon, Button } from 'feather';
import moment from 'moment-timezone';

import { DATE_TYPES } from '@constants';
import { StyledProps } from '@ui';

import { Popover, PopoverProps } from '../popover';
import { Calendar } from './calendar';
import { MonthTarget, MonthWrapper, MonthTargetStart, MonthIcon } from './components';

const Target = styled(MonthTarget)`
  min-width: 210px;
`;

const MonthTargetEnd = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const MonthTargetDivider = styled.div`
  width: 10px;
  text-align: center;
`;

const Wrapper = styled(MonthWrapper)`
  min-width: 400px;
`;

const MonthCalendars = styled.div`
  display: flex;
`;

const MonthStart = styled.div`
  flex: 1;
`;

const MonthEnd = styled.div`
  flex: 1;
  border-left: 1px solid ${cssVariables('neutral-3')};
`;

const MonthFooter = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid ${cssVariables('neutral-3')};
`;

const MonthFooterButtons = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
  button + button {
    margin-left: 8px;
  }
`;

const StyledMonthRangePicker = styled.div<StyledProps>`
  ${(props) => props.styles};
`;

interface MonthRangePickerProps {
  placement?: PopoverProps['placement'];
  offset?: string;
  isOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  onChange?: (dates) => void;
  onApply?: (dates) => void;

  start?: moment.Moment;
  end?: moment.Moment;

  wrapperStyles?: any;
  targetStyles?: any;

  usePortal?: boolean;
}

export class MonthRangePicker extends Component<MonthRangePickerProps> {
  static defaultProps = {
    targetStyles: css``,
    usePortal: true,
  };

  private popoverComponent;
  private refHandlers = {
    popover: (ref) => {
      this.popoverComponent = ref;
    },
  };

  public state = {
    isOpen: this.props.isOpen || false,
    start: this.props.start || moment(),
    end: this.props.end || moment(),
  };

  private handleOpen = () => {
    this.setState(
      {
        isOpen: true,
      },
      () => {
        if (this.props.onOpen) {
          this.props.onOpen();
        }
      },
    );
  };

  private handleClose = () => {
    this.setState({
      isOpen: false,
    });
  };

  private handleApply = () => {
    this.popoverComponent.close();
    if (this.props.onApply) {
      this.props.onApply({
        start: this.state.start,
        end: this.state.end,
      });
    }
  };

  private handleDateChange = (types) => (newDate) => {
    if (types === 'start' && newDate.isAfter(this.state.end)) {
      this.setState({ start: this.state.end, end: newDate }, this.callOnChange);
    } else if (types === 'end' && newDate.isBefore(this.state.start)) {
      this.setState({ start: newDate, end: this.state.start }, this.callOnChange);
    } else {
      this.setState({ [types]: newDate }, this.callOnChange);
    }
  };

  private callOnChange = () => {
    if (this.props.onChange) {
      this.props.onChange({
        start: this.state.start,
        end: this.state.end,
      });
    }
  };

  public render() {
    const { start, end } = this.state;
    const { wrapperStyles, targetStyles, usePortal } = this.props;

    return (
      <StyledMonthRangePicker styles={wrapperStyles} data-test-id="MonthRangePicker">
        <Popover
          ref={this.refHandlers.popover}
          placement={this.props.placement || 'bottom-end'}
          offset={this.props.offset || '0, 4'}
          isOpen={this.state.isOpen}
          onOpen={this.handleOpen}
          onClose={this.handleClose}
          target={
            <Target isActive={this.state.isOpen} styles={targetStyles}>
              <MonthTargetStart>{start.format('MMM, YYYY')}</MonthTargetStart>
              <MonthTargetDivider>-</MonthTargetDivider>
              <MonthTargetEnd>{end.format('MMM, YYYY')}</MonthTargetEnd>
              <MonthIcon>
                <Icon icon="calendar" size={20} />
              </MonthIcon>
            </Target>
          }
          content={
            <Wrapper>
              <MonthCalendars>
                <MonthStart>
                  <Calendar
                    dateTypes={DATE_TYPES.MONTH}
                    types="start"
                    handleDateChange={this.handleDateChange('start')}
                    range={{
                      start,
                      end,
                    }}
                  />
                </MonthStart>
                <MonthEnd>
                  <Calendar
                    dateTypes={DATE_TYPES.MONTH}
                    types="end"
                    handleDateChange={this.handleDateChange('end')}
                    range={{
                      start,
                      end,
                    }}
                  />
                </MonthEnd>
              </MonthCalendars>
              <MonthFooter>
                <MonthFooterButtons>
                  <Button buttonType="tertiary" size="small" onClick={this.handleClose}>
                    Cancel
                  </Button>
                  <Button buttonType="primary" size="small" onClick={this.handleApply}>
                    Apply
                  </Button>
                </MonthFooterButtons>
              </MonthFooter>
            </Wrapper>
          }
          interactionHover={false}
          canOutsideClickClose={true}
          usePortal={usePortal}
        />
      </StyledMonthRangePicker>
    );
  }
}
