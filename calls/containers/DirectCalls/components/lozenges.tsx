import { FC } from 'react';
import { useIntl } from 'react-intl';

import { Lozenge } from 'feather';

import { PropOf } from '@utils';

import { CallStateLabelIntlKeys, EndResultLabelIntlKeys } from '../strings';

type Color = PropOf<typeof Lozenge, 'color'>;

export const EndResultLozenge: FC<{ endResult: CallEndResult }> = ({ endResult }) => {
  const intl = useIntl();
  const text = intl.formatMessage({ id: EndResultLabelIntlKeys[endResult] });
  const colors: { [key in CallEndResult]: Color } = {
    completed: 'green',
    canceled: 'neutral',
    declined: 'neutral',
    no_answer: 'neutral',
    timed_out: 'red',
    connection_lost: 'red',
    unknown: 'red',
  };

  return <Lozenge color={colors[endResult]}>{text}</Lozenge>;
};

export const StateLozenge: FC<{ state: CallState; className?: string }> = ({ state, className }) => {
  const intl = useIntl();
  const text = intl.formatMessage({ id: CallStateLabelIntlKeys[state] });
  const colors: { [key in CallState]: Color } = {
    current: 'green',
    ended: 'neutral',
  };

  return (
    <Lozenge className={className} color={colors[state]}>
      {text}
    </Lozenge>
  );
};
