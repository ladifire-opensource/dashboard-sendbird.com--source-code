import React from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';

import { EMPTY_TEXT } from '@constants';
import { getColorByConnection } from '@utils';
import { useTimer } from '@utils/timer';

const Duration = styled.span<DurationProps>`
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: ${(props) => (props.connection ? getColorByConnection(props.connection) : cssVariables('neutral-10'))};
`;

type DurationProps = {
  connection: ConnectionType;
};

type ConnectionType = 'ONLINE' | 'OFFLINE' | 'AWAY';

type Props = {
  timestamp: number;
  connection: ConnectionType;
};

export const AgentItemDuration: React.NamedExoticComponent<Props> = React.memo(({ timestamp, connection }) => {
  // FIXME: violation of rules-of-hooks
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const duration = timestamp ? useTimer(Math.floor(timestamp * 1000)) : EMPTY_TEXT;
  return <Duration connection={connection}>{duration}</Duration>;
});
