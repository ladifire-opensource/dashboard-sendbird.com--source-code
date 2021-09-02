import { FC, useMemo, useEffect, useState, useRef } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { Tag, Body, cssVariables } from 'feather';
import moment, { Moment } from 'moment-timezone';
import { interval, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

import { TIME_DATE_FORMAT } from '@constants';
import useFormatTimeAgo from '@hooks/useFormatTimeAgo';

type Props = { timestamp: string | number | Moment | null; className?: string; isTimeAgoHidden?: boolean };

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  text-align: right;
  white-space: nowrap;
  color: ${cssVariables('neutral-7')};
  ${Body['body-short-01']};
`;

export const LastUpdatedAt: FC<Props> = ({ timestamp, className, isTimeAgoHidden = false }) => {
  const intl = useIntl();
  const [formattedTimestamp, setFormattedTimestamp] = useState('');
  const [timeAgoString, setTimeAgoString] = useState('');
  const updateTimeAgoString = useRef<Subscription>();
  const formatTimeAgo = useFormatTimeAgo();

  const momentObj = useMemo(() => {
    if (!timestamp) {
      return null;
    }
    return moment.isMoment(timestamp) ? timestamp.tz('UTC') : moment(timestamp).tz('UTC');
  }, [timestamp]);

  useEffect(() => {
    if (momentObj == null) {
      setFormattedTimestamp('');
      setTimeAgoString('');
      return;
    }

    setFormattedTimestamp(momentObj.format(TIME_DATE_FORMAT));
    setTimeAgoString(formatTimeAgo(momentObj.valueOf()));

    const timeAgoStringUpdater = interval(1000)
      .pipe(
        tap(() => {
          setTimeAgoString(formatTimeAgo(momentObj.valueOf()));
        }),
      )
      .subscribe();

    updateTimeAgoString.current = timeAgoStringUpdater;

    return () => {
      timeAgoStringUpdater.unsubscribe();
    };
  }, [formatTimeAgo, momentObj]);

  return useMemo(() => {
    return formattedTimestamp ? (
      <Container className={className}>
        {intl.formatMessage({ id: 'common.formats.lastUpdatedAt' }, { time: formattedTimestamp, timezone: 'UTC' })}
        {!isTimeAgoHidden && (
          <Tag
            css={`
              margin-left: 8px;
            `}
          >
            {timeAgoString}
          </Tag>
        )}
      </Container>
    ) : null;
  }, [className, formattedTimestamp, intl, isTimeAgoHidden, timeAgoString]);
};
