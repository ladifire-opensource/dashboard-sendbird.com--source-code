import { Component } from 'react';

import styled, { css } from 'styled-components';

import { cssVariables, transitionDefault } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { DATE_TYPES } from '@constants';

const MONTHS_NAMES: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeaderArrow = styled.div<{ direction: 'left' | 'right' }>`
  cursor: pointer;
  display: block;
  width: 0px;
  height: 0px;
  padding: 0px;
  border-style: solid;
  border-image: initial;
  text-align: center;
  ${({ direction }) => {
    if (direction === 'left') {
      return css`
        margin: 0px 0px 0px 1px;
        border-width: 4px 6px 4px 4px;
        border-color: transparent ${cssVariables('neutral-10')} transparent transparent;
      `;
    }
    return css`
      margin: 0px 0px 0px 7px;
      border-width: 4px 4px 4px 6px;
      border-color: transparent transparent transparent ${cssVariables('neutral-10')};
    `;
  }};
`;

const HeaderYear = styled.div`
  margin: 0 12px;
  font-size: 15px;
  letter-spacing: -0.2px;
  padding: 4px;
  color: ${cssVariables('neutral-10')};
  &:hover {
    cursor: pointer;
    background: ${cssVariables('neutral-2')};
  }
`;

const StyledCalendar = styled.div`
  max-width: 270px;
  padding: 12px 0 16px;
`;

const Items = styled.div`
  display: flex;
  flex-wrap: wrap;
  min-height: 40px;
  margin-top: 10px;
  justify-content: center;
  align-items: center;
`;

const YearItems = styled(Items)``;

const MonthItems = styled(Items)``;

const Item = styled.div<{
  isRange?: boolean;
  isActive: boolean;
}>`
  font-size: 12px;
  font-weight: 500;
  width: 90px;
  height: 40px;
  line-height: 38px;
  padding: 0 12px;
  text-align: center;
  border: 1px solid transparent;
  transition: all 0.2s ${transitionDefault};
  &:hover {
    cursor: pointer;
    background: ${cssVariables('neutral-2')};
  }
  ${({ isRange }) =>
    isRange &&
    css`
      color: ${cssVariables('purple-7')};
      background: ${cssVariables('purple-2')};
      &:hover {
        background: ${cssVariables('neutral-2')};
      }
    `};
  ${({ isActive }) =>
    isActive &&
    css`
      color: white;
      background: ${cssVariables('purple-7')};
      &:hover {
        background: ${cssVariables('purple-7')};
      }
    `};
`;

type Range = {
  start: Moment;
  end: Moment;
};

type ClickedDateItem = { type: 'year' | 'month' | 'week'; value: number };

type Props = {
  dateTypes: DATE_TYPES.YEAR | DATE_TYPES.MONTH;
  types?: string; // start, end
  range?: Range;
  handleDateChange: (newDate: Moment, clickedItem: ClickedDateItem) => void;
  isDateSelectable?: (date: Moment) => boolean;
};

const checkRange = (target, range: Range) => {
  return target.isBetween(range.start, range.end) || target.isBetween(range.end, range.start);
};

export class Calendar extends Component<Props> {
  private year = moment().year();
  private month = moment().month();

  static defaultProps = {
    types: 'start',
  };

  public state = {
    years: Array.from({ length: 12 }, (_v, k) => k + this.year),
    startYear: this.year - 6,
    selectedYear: this.year,
    selectedMonth: this.month,
    viewState: this.props.dateTypes,
  };

  componentDidMount() {
    this.refineCurrentState(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.refineCurrentState(nextProps);
  }

  private refineCurrentState = (props) => {
    const newState = {
      ...this.state,
    };

    if (props.dateTypes === DATE_TYPES.MONTH && props.range[props.types].month() !== this.state.selectedMonth) {
      newState.selectedMonth = props.range[props.types].month();
    }
    if (props.range[props.types].year() !== this.state.selectedYear) {
      newState.selectedYear = props.range[props.types].year();
    }

    this.setState(newState);
  };

  private handleHeaderYearClick = () => {
    this.setState({ viewState: DATE_TYPES.YEAR });
  };

  private handleDateChange = (clickedItem: ClickedDateItem) => {
    const newDate = moment().set('year', this.state.selectedYear);
    if (this.props.dateTypes === DATE_TYPES.MONTH) {
      newDate.set('month', this.state.selectedMonth);
    }

    if ((this.props.isDateSelectable?.(newDate) ?? true) === false) {
      return;
    }

    this.props.handleDateChange(newDate, clickedItem);
  };

  private handleYearItemClick = (year) => (e) => {
    e.stopPropagation();
    this.setState(
      {
        selectedYear: year,
        viewState: this.props.dateTypes,
      },
      () => {
        this.handleDateChange({ type: 'year', value: year });
      },
    );
  };

  private handleItemClick = (value) => (e) => {
    e.stopPropagation();

    this.setState({ selectedMonth: value }, () => {
      this.handleDateChange({ type: 'month', value });
    });
  };

  private updateYears = (startYear) => {
    const years = Array.from({ length: 12 }, (_v, k) => k + startYear);
    this.setState({ years, viewState: DATE_TYPES.YEAR });
  };

  private handlePreviousYearClick = () => {
    const startYear = this.state.years[0] - 12;
    this.updateYears(startYear);
  };

  private handleNextYearClick = () => {
    const startYear = this.state.years[11] + 1;
    this.updateYears(startYear);
  };

  private renderYearPicker = () => {
    const { selectedYear, years } = this.state;
    return (
      <YearItems>
        {years.map((year) => {
          return (
            <Item
              key={`calendar_item_${year}`}
              isActive={selectedYear === year}
              onClick={this.handleYearItemClick(year)}
            >
              {year}
            </Item>
          );
        })}
      </YearItems>
    );
  };

  private renderMonthPicker = () => {
    const { selectedYear, selectedMonth } = this.state;
    const { types, range } = this.props;

    const months = Array.from(Array(12), (_, i) => i);
    return (
      <MonthItems>
        {months.map((month) => {
          const currentDate = moment().set('year', selectedYear).set('month', month);
          const checkActiveMonth = (month) => {
            if (range) {
              if (types === 'start' && range.start.year() === selectedYear && range.start.month() === month) {
                return true;
              }
              if (types === 'end' && range.end.year() === selectedYear && range.end.month() === month) {
                return true;
              }
              if (range.start.year() === range.end.year()) {
                return range.start.month() === month || range.end.month() === month;
              }
              return false;
            }
            return selectedMonth === month;
          };
          return (
            <Item
              key={`calendar_item_month_${month}`}
              isActive={checkActiveMonth(month)}
              isRange={range && checkRange(currentDate, range)}
              onClick={this.handleItemClick(month)}
            >
              {MONTHS_NAMES[month]}
            </Item>
          );
        })}
      </MonthItems>
    );
  };

  public render() {
    const { selectedYear, viewState } = this.state;
    const { handlePreviousYearClick, handleHeaderYearClick, handleNextYearClick } = this;

    return (
      <StyledCalendar>
        <HeaderWrapper>
          <HeaderArrow direction="left" onClick={handlePreviousYearClick} />
          <HeaderYear onClick={handleHeaderYearClick}>{selectedYear}</HeaderYear>
          <HeaderArrow direction="right" onClick={handleNextYearClick} />
        </HeaderWrapper>
        {viewState === DATE_TYPES.YEAR && this.renderYearPicker()}
        {viewState === DATE_TYPES.MONTH && this.renderMonthPicker()}
      </StyledCalendar>
    );
  }
}
