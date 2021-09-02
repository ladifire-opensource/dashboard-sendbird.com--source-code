import { Moment } from 'moment-timezone';

export const SECONDS_IN_DAY = 24 * 60 * 60;

export const getRelativeTimeOfDay = (time: Moment) => {
  const midnight = time.clone().startOf('day');
  const seconds = time.diff(midnight, 'seconds');
  return seconds / SECONDS_IN_DAY;
};
