import { FC, useState, useEffect } from 'react';

import styled from 'styled-components';

import { cssVariables } from 'feather';
import moment from 'moment-timezone';

import { DEFAULT_DATE_TIME_FORMAT } from '@constants';
import { useInterval } from '@hooks';

const Timestamp = styled.span`
  color: ${cssVariables('green-5')};
  font-weight: 500;
`;

const getCurrentTimeText = () => moment().format(DEFAULT_DATE_TIME_FORMAT);

export const RealtimeCreatedAt: FC = () => {
  const [content, setContent] = useState(getCurrentTimeText());

  const { startInterval } = useInterval(() => {
    setContent(getCurrentTimeText());
  }, 1000);

  useEffect(() => {
    startInterval();
  }, [startInterval]);

  return <Timestamp>{content}</Timestamp>;
};
