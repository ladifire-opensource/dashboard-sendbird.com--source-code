import { forwardRef, useMemo, PropsWithChildren } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables } from 'feather';
import moment, { Moment } from 'moment-timezone';

import ChatBubble from '@desk/components/chatBubble/ChatBubble';

const CenteredSystemMessage = styled.div`
  padding: 8px 0;
  text-align: center;
  font-size: 12px;
  line-height: 16px;
  color: ${cssVariables('neutral-10')};
  margin: 8px auto;

  ${ChatBubble} + & {
    margin-top: 16px;
  }

  & + ${ChatBubble} {
    margin-top: 8px;
  }
`;

type Props = { date: Moment | number };

export const SystemMessage = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(({ date, children }, ref) => {
  const intl = useIntl();
  const readableDate = useMemo(() => {
    if (moment.isMoment(date)) {
      return date.format('HH:mm');
    }
    return moment(date).format('HH:mm');
  }, [date]);
  return (
    <CenteredSystemMessage ref={ref} data-test-id="CenteredSystemMessage">
      {children}
      {readableDate && (
        <>&nbsp;&nbsp;{intl.formatMessage({ id: 'desk.conversation.systemMessageAt' }, { date: readableDate })}</>
      )}
    </CenteredSystemMessage>
  );
});

SystemMessage.displayName = 'SystemMessage';
