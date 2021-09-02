import { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';

import formatISODuration from 'date-fns/formatISODuration';
import intervalToDuration from 'date-fns/intervalToDuration';

import { useLatestValue } from '@hooks';

const MILLISECONDS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

const units = [
  { amount: 60 * 60 * 24, unit: 'day' },
  { amount: 60 * 60, unit: 'hour' },
  { amount: 60, unit: 'minute' },
  { amount: 1, unit: 'second' },
];

const formatDuration = (milliseconds: number) => {
  let duration = Math.round(milliseconds / 1000);

  const [days, hours, minutes, seconds] = units.map(({ amount }) => {
    const result = Math.floor(duration / amount);
    duration %= amount;
    return result;
  });

  const time = [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
  // example of expected output: 10d 23:59:58
  return days > 0 ? `${days}d ${time}` : time;
};

const Countdown: FC<{ endAt: number; onEnd?: () => void } & HTMLAttributes<HTMLTimeElement>> = ({
  endAt,
  onEnd,
  ...props
}) => {
  const [remainingDuration, setRemainingDuration] = useState(Math.max(0, endAt - Date.now()));
  const isoDuration = formatISODuration(intervalToDuration({ start: 0, end: remainingDuration }));
  const intl = useIntl();
  const setIntervalIdRef = useRef(-1);
  const latestOnEnd = useLatestValue(onEnd);

  useEffect(() => {
    const setIntervalId = window.setInterval(() => {
      setRemainingDuration(Math.max(0, endAt - Date.now()));
    }, 1000);
    setIntervalIdRef.current = setIntervalId;

    return () => {
      clearInterval(setIntervalId);
    };
  }, [endAt]);

  useEffect(() => {
    if (remainingDuration <= 0) {
      // clear interval when it's past endAt
      clearInterval(setIntervalIdRef.current);
      return;
    }
  }, [latestOnEnd, remainingDuration]);

  useEffect(() => {
    if (remainingDuration < 1000) {
      // Note that if the delay value of setTimeout is too big, the callback will be run immediately https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout#maximum_delay_value
      const setTimeoutId = setTimeout(() => {
        latestOnEnd.current?.();
      }, remainingDuration);

      return () => {
        clearTimeout(setTimeoutId);
      };
    }
  }, [remainingDuration, latestOnEnd]);

  return (
    <time dateTime={isoDuration} {...props}>
      {remainingDuration > MILLISECONDS_PER_YEAR
        ? intl.formatMessage(
            { id: 'chat.channelDetail.sidebar.userList.overNYears' },
            { years: Math.floor(remainingDuration / MILLISECONDS_PER_YEAR) },
          )
        : formatDuration(remainingDuration)}
    </time>
  );
};

export default Countdown;
