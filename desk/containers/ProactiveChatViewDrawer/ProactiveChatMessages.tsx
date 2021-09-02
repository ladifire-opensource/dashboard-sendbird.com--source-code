import { FC, useMemo } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import isDateEqual from 'date-fns/isEqual';
import { cssVariables } from 'feather';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';

import { DeskAvatarType } from '@constants';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import { shouldRenderDateLine } from '@utils';

import { SENDBIRD_AVATAR_URL } from '../conversation/constants';

const DateLine = styled.div`
  display: block;
  margin: 0 24px;
  position: sticky;
  top: 0;
  z-index: 200;
  margin-bottom: 12px;
  padding: 10px 0;
`;

const DateLineTextWrapper = styled.div`
  display: flex;
  justify-content: center;
`;

const DateLineText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${cssVariables('neutral-8')};
  padding: 0 4px 2px 4px;
  letter-spacing: -0.3px;
  border-radius: 4px;
  background: white;
`;

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

type Props = {
  messages: ProactiveChatMessage[];
};

export const ProactiveChatMessages: FC<Props> = ({ messages }) => {
  const intl = useIntl();

  const renderedMessages = useMemo(() => {
    const messagesArray: any[] = [];
    let prevMessageData: ProactiveChatMessage | null = null;

    messages.forEach((messageData, index) => {
      const { id, message, createdAt, createdBy } = messageData;
      const nextMessageData = index < messages.length - 1 ? messages[index + 1] : null;
      const dateline = (
        <DateLine data-test-id="DateLine" key={`dateline_${createdAt}`}>
          <DateLineTextWrapper>
            <DateLineText>{moment(createdAt).format('ll')}</DateLineText>
          </DateLineTextWrapper>
        </DateLine>
      );

      if (
        prevMessageData != null &&
        shouldRenderDateLine({ previousDate: prevMessageData.createdAt, nextDate: createdAt })
      ) {
        messagesArray.push(dateline);
      } else if (index === 0) {
        messagesArray.push(dateline);
      }

      const hideAvatarAndStatus = (() => {
        if (nextMessageData) {
          return (
            nextMessageData.createdBy.id === messageData.createdBy.id &&
            isDateEqual(
              new Date(nextMessageData.createdAt).setSeconds(0, 0),
              new Date(messageData.createdAt).setSeconds(0, 0),
            )
          );
        }
        return false;
      })();

      if (!isEmpty(messageData)) {
        messagesArray.push(
          <ChatBubble
            data-test-id="ChatBubble"
            key={id}
            message={message}
            date={moment(createdAt)}
            status={intl.formatMessage(
              { id: 'desk.drawer.proactiveChatViewDrawer.message.status.sentBy' },
              { agentName: createdBy.displayName },
            )}
            avatar={{
              type: DeskAvatarType.Customer,
              imageUrl: SENDBIRD_AVATAR_URL,
              profileID: createdBy.id,
            }}
            isOwn={true}
            isAvatarHidden={hideAvatarAndStatus}
            isStatusHidden={hideAvatarAndStatus}
          />,
        );
      }
      prevMessageData = messageData;
    });
    return messagesArray;
  }, [intl, messages]);

  return <MessagesWrapper>{renderedMessages}</MessagesWrapper>;
};
