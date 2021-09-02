import { memo } from 'react';

import moment from 'moment-timezone';

import { TIME_DATE_FORMAT, EMPTY_TEXT } from '@constants';

type Props = {
  timestamp: string | number | null | undefined;
  format?: string;
};

export const TicketFormattedTime = memo<Props>(({ timestamp, format }) => {
  return (
    <span data-test-id="ticket__formattedTime">
      {timestamp ? moment(timestamp).format(format || TIME_DATE_FORMAT) : EMPTY_TEXT}
    </span>
  );
});
