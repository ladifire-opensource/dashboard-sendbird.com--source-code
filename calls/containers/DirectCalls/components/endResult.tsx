import { FC } from 'react';

import { EMPTY_TEXT } from '@constants';

import { EndResultLozenge } from './lozenges';

export const EndResult: FC<{ endResult?: CallEndResult | null }> = ({ endResult }) => (
  <>{endResult ? <EndResultLozenge endResult={endResult} /> : EMPTY_TEXT}</>
);
