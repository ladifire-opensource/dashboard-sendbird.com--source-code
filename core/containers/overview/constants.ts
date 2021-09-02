import moment from 'moment-timezone';

import { DEFAULT_DATE_FORMAT } from '@constants';

/* Dec 1, 2021 - Dec 20, 2021 */
export const monthRange = [moment().tz('UTC').startOf('month'), moment().tz('UTC')]
  .map((date) => date.format(DEFAULT_DATE_FORMAT))
  .join(' - ');
