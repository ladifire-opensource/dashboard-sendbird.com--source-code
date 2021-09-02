import { FC, useState, useEffect, useMemo } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';
import moment, { Moment } from 'moment-timezone';

import { useInterval } from '@hooks';

type Props = { timestamp: string };

const Highlighted = styled.span`
  color: ${cssVariables('green-5')};
  font-weight: 500;
`;

const getIsHighlighted = (m: Moment) => moment().diff(m, 'minute') <= 1;

export const RecentlyCreatedAt: FC<Props> = ({ timestamp, children }) => {
  const momentObj = useMemo(() => moment(timestamp), [timestamp]);
  const [isHighlighted, setIsHighlighted] = useState(getIsHighlighted(momentObj));

  const { startInterval, stopInterval } = useInterval(() => {
    const newIsHighlighted = getIsHighlighted(momentObj);
    if (newIsHighlighted !== isHighlighted) {
      setIsHighlighted(newIsHighlighted);

      if (!newIsHighlighted) {
        // If it becomes 1 minute past timestamp, we can stop the timer.
        stopInterval();
      }
    }
  }, 1000);

  useEffect(() => {
    startInterval();
  }, [startInterval]);

  // If 1 minute hasn't passed from timestamp, highlight the content.
  return isHighlighted ? <Highlighted>{children}</Highlighted> : <>{children}</>;
};
