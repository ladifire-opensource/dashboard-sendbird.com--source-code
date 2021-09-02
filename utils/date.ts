import { DateRangePickerValue } from 'feather';
import moment, { MomentInput } from 'moment-timezone';

export const getDateRangePickerValue = (start: MomentInput, end: MomentInput): DateRangePickerValue => {
  const diff = moment(end).diff(start, 'days') + 1;
  return (
    {
      7: DateRangePickerValue.Last7Days,
      14: DateRangePickerValue.Last14Days,
      30: DateRangePickerValue.Last30Days,
      90: DateRangePickerValue.Last90Days,
    }[diff] ?? DateRangePickerValue.Custom
  );
};
