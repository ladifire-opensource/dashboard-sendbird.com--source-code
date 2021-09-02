import { DateRangePickerValue } from 'feather';
import moment, { Moment } from 'moment-timezone';

export const convertDateRangePickerValueToDateRange = (
  value: Exclude<DateRangePickerValue, DateRangePickerValue.Custom>,
): { startDate: Moment; endDate: Moment } | undefined => {
  const endDate = moment();
  switch (value) {
    case DateRangePickerValue.Today:
      return { startDate: endDate, endDate };
    case DateRangePickerValue.Yesterday: {
      const yesterday = moment().subtract(1, 'day');
      return {
        startDate: yesterday,
        endDate: yesterday,
      };
    }
    case DateRangePickerValue.Last7Days:
      return {
        startDate: moment(endDate).subtract(6, 'day'),
        endDate,
      };
    case DateRangePickerValue.Last14Days:
      return {
        startDate: moment(endDate).subtract(13, 'day'),
        endDate,
      };
    case DateRangePickerValue.Last30Days:
      return {
        startDate: moment(endDate).subtract(29, 'day'),
        endDate,
      };
    case DateRangePickerValue.Last90Days:
      return {
        startDate: moment(endDate).subtract(89, 'day'),
        endDate,
      };
    default:
      return undefined;
  }
};
