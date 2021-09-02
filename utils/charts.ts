import moment from 'moment';

import { ISO_DATE_FORMAT } from '@constants';

export const getPreviousDates = (startDate: string, endDate: string, format: string = ISO_DATE_FORMAT) => {
  const durationDiff = moment(startDate, format)
    .startOf('day')
    .diff(moment(endDate, format).clone().add(1, 'day').startOf('day'));

  return {
    start_date: moment(startDate, format).add(durationDiff, 'milliseconds').format(format),
    end_date: moment(endDate, format).add(durationDiff, 'milliseconds').format(format),
  };
};
