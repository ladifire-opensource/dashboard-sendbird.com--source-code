import React from 'react';

import { cssVariables, transitionDefault } from 'feather';
import { Moment } from 'moment-timezone';

import { getRelativeTimeOfDay, SECONDS_IN_DAY } from './getRelativeTimeOfDay';

type Props = {
  id: React.Key;
  startedAt: Moment;
  connection: Agent['connection'];
  endedAt: Moment;
  barRect: { x: number; y: number; width: number; height: number };
  isHovered?: boolean;
  testId?: string;
};

function getFillColor(connection: Agent['connection'], isHovered: boolean) {
  switch (connection) {
    case 'ONLINE':
      return isHovered ? cssVariables('green-3') : cssVariables('green-5');
    case 'AWAY':
      return isHovered ? cssVariables('orange-3') : cssVariables('orange-5');
    case 'OFFLINE':
      return isHovered ? cssVariables('neutral-1') : cssVariables('neutral-2');
    default:
      return undefined;
  }
}

export const DurationRect = ({ id, startedAt, connection, endedAt, barRect, isHovered = false, testId }: Props) => {
  const durationTime = endedAt.diff(startedAt, 'second');
  return (
    <rect
      key={id}
      data-id={id}
      x={Math.round(getRelativeTimeOfDay(startedAt) * barRect.width)}
      y={barRect.y}
      width={Math.round((durationTime / SECONDS_IN_DAY) * barRect.width)}
      height={barRect.height}
      fill={getFillColor(connection, isHovered)}
      style={{ transition: `0.2s fill ${transitionDefault}` }}
      data-test-id={testId}
    />
  );
};
