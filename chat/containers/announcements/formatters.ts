import moment, { Moment } from 'moment-timezone';
import numbro from 'numbro';

import { EMPTY_TEXT, DEFAULT_DATE_TIME_FORMAT } from '@constants';

export const formatInteger = (value: number) => numbro(value).format({ thousandSeparated: true });

export const formatPercentage = (value: number) => `${numbro(value * 100).format('0,0.00')}%`;

export const formatCeaseAtResumeAt = (value: string | null, timezone: string) =>
  value ? moment.tz(value, 'HHmm', 'UTC').tz(timezone).format('HH:mm') : EMPTY_TEXT;

export const formatTimestampWithTimezone = (
  timestamp: Moment | number,
  timezone: string,
  baseFormat: string = DEFAULT_DATE_TIME_FORMAT,
) => {
  return `${moment(timestamp).tz(timezone).format(`${baseFormat} [(UTC]Z`)}, ${timezone})`;
};
