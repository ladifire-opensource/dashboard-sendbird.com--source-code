import { FC, useMemo } from 'react';

import moment from 'moment-timezone';

import { EMPTY_TEXT, DEFAULT_DATE_TIME_FORMAT } from '@constants';

import { useAnnouncementTimezone } from './AnnouncementTimezoneContextProvider';

type Props = { value: number };

export const TimestampCellContent: FC<Props> = ({ value: timestamp }) => {
  const timezone = useAnnouncementTimezone();

  return useMemo(() => {
    if (!timestamp) {
      return <>{EMPTY_TEXT}</>;
    }

    const momentObj = moment(timestamp).tz(timezone);
    return <>{momentObj.format(DEFAULT_DATE_TIME_FORMAT)}</>;
  }, [timestamp, timezone]);
};
