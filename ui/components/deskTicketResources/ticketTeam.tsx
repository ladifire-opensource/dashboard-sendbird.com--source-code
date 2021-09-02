import { memo } from 'react';

import { Tag } from 'feather';

import { EMPTY_TEXT } from '@constants';

type Props = {
  teamName: string | null | undefined;
};

export const TicketTeam = memo<Props>(({ teamName }) => (
  <span data-test-id="ticket__team">{teamName ? <Tag maxWidth={120}>{teamName}</Tag> : EMPTY_TEXT}</span>
));
