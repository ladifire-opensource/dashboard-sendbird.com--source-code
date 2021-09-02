import { memo } from 'react';
import { useIntl } from 'react-intl';

import { Lozenge, PrimitiveColor } from 'feather';

import { getTicketStatusLabelKey } from '@utils';

const ticketStatusColorMap: Record<ReturnType<typeof getTicketStatusLabelKey>, PrimitiveColor> = {
  'ui.ticketStatus.init': 'purple',
  'ui.ticketStatus.active': 'green',
  'ui.ticketStatus.idle': 'orange',
  'ui.ticketStatus.closed': 'neutral',
  'ui.ticketStatus.wip': 'blue',
  'ui.ticketStatus.pending': 'red',
  'ui.ticketStatus.proactive': 'yellow',
};

type Props = {
  ticketStatus: Ticket['status2'];
  className?: string;
};

export const TicketStatusLozenge = memo<Props>(({ ticketStatus, className }) => {
  const intl = useIntl();
  const statusLabelKey = getTicketStatusLabelKey(ticketStatus);
  const ticketStatusText = String(intl.formatMessage({ id: statusLabelKey })).toLocaleUpperCase();
  const color: PrimitiveColor = ticketStatusColorMap[statusLabelKey];
  return (
    <Lozenge className={className} color={color}>
      {ticketStatusText}
    </Lozenge>
  );
});
