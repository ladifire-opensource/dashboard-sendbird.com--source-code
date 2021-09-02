import { useState, useEffect } from 'react';

import { timer, Subscription } from 'rxjs';

const FORMAT_STRINGS = ['d', 'h', 'm', 's'];

const getTimes = (seconds: number) => {
  let s = seconds;
  let m = Math.floor(s / 60);
  s = s % 60;

  let h = Math.floor(m / 60);
  m = m % 60;

  const d = Math.floor(h / 24);
  h = h % 24;

  return [d, h, m, s];
};

/**
 *
 * @param timestamp must be 13 digits
 */
function getTimesFromNow(timestamp: number): Array<number> {
  const now = Date.now();
  return getTimes(timestamp >= now ? 0 : Math.floor((now - timestamp) / 1000));
}

function getFormattedTimeDifference(times: Array<number>): string {
  return times.reduce((acc, curr, index) => {
    if (curr === 0 && acc.length === 0 && index < times.length - 1) {
      return acc;
    }
    return `${acc}${curr}${FORMAT_STRINGS[index]}`;
  }, '');
}

export function useTimer(timestamp: number): string {
  const formattedCounter = getFormattedTimeDifference(getTimesFromNow(timestamp));
  const [counter, setCounter] = useState(formattedCounter);

  function tick() {
    setCounter(getFormattedTimeDifference(getTimesFromNow(timestamp)));
  }

  useEffect(() => {
    const subscription: Subscription = timer(0, 1000).subscribe(() => tick());
    return function unsubscribe() {
      subscription && subscription.unsubscribe();
    };
  }, [timestamp]);

  return counter;
}
