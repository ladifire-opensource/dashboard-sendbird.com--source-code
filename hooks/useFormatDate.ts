import { useCallback } from 'react';
import { FormatDateOptions, useIntl } from 'react-intl';

type PredefinedOption =
  | 'shortDate'
  | 'shortYearMonth'
  | 'shortDateTime'
  | 'longDateShortTime'
  | '23htime'
  | 'shortDateWithoutYear';

const predefinedOptions: Record<PredefinedOption, FormatDateOptions> = {
  shortDate: { month: 'short', day: 'numeric', year: 'numeric' },
  shortDateWithoutYear: { month: 'short', day: 'numeric' },
  shortYearMonth: { month: 'short', year: 'numeric' },
  shortDateTime: { dateStyle: 'medium', timeStyle: 'short' },
  longDateShortTime: { dateStyle: 'long', timeStyle: 'short' },
  '23htime': { hour: 'numeric', minute: 'numeric', hourCycle: 'h23' },
};

/**
 * Either Date object, ISO String, or UNIX timestamp of a moment.
 */
type FormatDateValue = string | number | Date | undefined;

interface FormatDate {
  (value: FormatDateValue, options?: FormatDateOptions): string;
  (value: FormatDateValue, predefinedOption: PredefinedOption): string;
  (value: FormatDateValue, predefinedOption: PredefinedOption, additionalOptions?: FormatDateOptions): string;
}

/** Date object or UNIX timestamp */
type FormatDateTimeRangeMoment = number | Date;

interface FormatDateTimeRange {
  (from: FormatDateTimeRangeMoment, to: FormatDateTimeRangeMoment, opts?: FormatDateOptions): string;
  (from: FormatDateTimeRangeMoment, to: FormatDateTimeRangeMoment, predefinedOption: PredefinedOption): string;
  (
    from: FormatDateTimeRangeMoment,
    to: FormatDateTimeRangeMoment,
    predefinedOption: PredefinedOption,
    additionalOptions?: FormatDateOptions,
  ): string;
}

export const useFormatDate = () => {
  const intl = useIntl();

  const formatDate: FormatDate = useCallback(
    (...args) => {
      const [value, options, additionalOptions] = args;

      if (typeof options === 'object' || typeof options === 'undefined') {
        return intl.formatDate(value, options);
      }

      return intl.formatDate(value, { ...additionalOptions, ...predefinedOptions[options] });
    },
    [intl],
  );

  return formatDate;
};

export const useFormatDateTimeRange = () => {
  const intl = useIntl();

  const formatDateTimeRange: FormatDateTimeRange = useCallback(
    (...args) => {
      const [from, to, options, additionalOptions] = args;

      if (typeof options === 'object' || typeof options === 'undefined') {
        return intl.formatDateTimeRange(from, to, options);
      }

      return intl.formatDateTimeRange(from, to, { ...additionalOptions, ...predefinedOptions[options] });
    },
    [intl],
  );

  return formatDateTimeRange;
};
