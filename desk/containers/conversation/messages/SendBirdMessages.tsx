import React, { useImperativeHandle, useState, useMemo, forwardRef, memo, useCallback, useRef, useEffect } from 'react';
import { useIntl } from 'react-intl';

import styled from 'styled-components';

import { cssVariables, ScrollBar, ScrollBarRef } from 'feather';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment-timezone';
import * as SendBird from 'sendbird';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { DeskMessageRenderMode, DeskMessagesMode, TicketStatus } from '@constants';
import { ChatBubbleAction } from '@desk/components/chatBubble/ChatBubble';
import { ChatBubblesScrollBarRefContext } from '@desk/components/chatBubble/mediaRenderers';
import { useAuthorization, usePrevious, useShowDialog } from '@hooks';
import { StyledProps } from '@ui';
import { transformToCamelCase, shouldRenderDateLine, PropOf } from '@utils';

import { DeskChatLayoutContext } from '../../DeskChatLayout';
import { SendBirdMessage } from '../message';

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
  justify-content: center; /* 1:1 ui */
`;

const DateLineText = styled.span<StyledProps>`
  font-size: 13px;
  font-weight: 600;
  color: ${cssVariables('neutral-8')};
  padding: 0 4px 2px 4px;
  letter-spacing: -0.3px;
  background: ${(props) => (props.messageRenderMode === 'compact' ? cssVariables('neutral-1') : 'white')};
  border-radius: 4px;
`;

type Props = {
  ticket: Ticket;
  lastSeenByCustomerAt?: number;
  messages: ((SendBird.AdminMessage | SendBird.UserMessage | SendBird.FileMessage) | SendBirdAPIMessage)[];
  messagesMode: DeskMessagesMode;
  messageRenderMode?: DeskMessageRenderMode;
  initialOrNextFetchedTimestamp?: number;

  fetchMessagesPrev: () => any;
  onDeleteMessage?: (messageId: number) => void;
};

export type SendBirdMessagesRef = {
  scrollToBottom: () => void;
  scrollTo: (y: number) => void;
  findFirstMessageNode: () => HTMLDivElement | null;
};

export const SendBirdMessages = memo(
  forwardRef<SendBirdMessagesRef, Props>(
    (
      {
        ticket,
        lastSeenByCustomerAt = 0,
        messages,
        messagesMode,
        messageRenderMode,
        initialOrNextFetchedTimestamp,
        fetchMessagesPrev,
        onDeleteMessage,
      },
      messagesRef,
    ) => {
      const intl = useIntl();
      const showDialog = useShowDialog();
      const { isPermitted } = useAuthorization();
      const isAdmin = isPermitted(['desk.admin']);

      const csbComponent = useRef<ScrollBarRef | null>(null);
      const firstMessageNode = useRef<HTMLDivElement | null>(null);

      const [scrollHeight, setScrollHeight] = useState(0);
      const [shouldCallScrollToBottom, setShouldCallScrollToBottom] = useState(true);

      const prevScrollHeight = usePrevious(scrollHeight);

      const scrollToBottom = () => {
        csbComponent?.current?.scrollToBottom();
      };

      const scrollTo = (y: number) => {
        csbComponent?.current?.scrollTo(0, y);
      };

      const findFirstMessageNode = () => {
        return firstMessageNode.current;
      };

      useImperativeHandle(messagesRef, () => ({
        scrollToBottom,
        scrollTo,
        findFirstMessageNode,
      }));

      useEffect(() => {
        /**
         * The existence of @var props.initialOrNextFetchedTimestamp means it is fetching latest messages or next message from current message timestamp.
         * Therefore @var shouldCallScrollToBottom should be true
         */
        if (initialOrNextFetchedTimestamp) {
          setShouldCallScrollToBottom(true);
          scrollToBottom();
        }
      }, [initialOrNextFetchedTimestamp]);

      useEffect(() => {
        if (scrollHeight !== prevScrollHeight && shouldCallScrollToBottom) {
          scrollToBottom();
          setShouldCallScrollToBottom(false);
        }
      }, [initialOrNextFetchedTimestamp, prevScrollHeight, scrollHeight, shouldCallScrollToBottom]);

      const handleScroll: PropOf<typeof ScrollBar, 'onScroll'> = useCallback(
        (event) => {
          if (event.target?.['scrollTop'] === 0) {
            fetchMessagesPrev();
          }
        },
        [fetchMessagesPrev],
      );

      const renderedMessages = useMemo(() => {
        const getParsedMessage = (msg) => {
          if (msg && msg.message_id) {
            // is from api
            const parsedData = transformToCamelCase(msg);
            parsedData.sender = parsedData.user ? transformToCamelCase(parsedData.user) : null;
            delete parsedData.user;
            switch (msg.type) {
              case 'MESG':
                parsedData.messageType = 'user';
                break;
              case 'FILE':
                parsedData.messageType = 'file';
                parsedData.url = msg.file.url;
                parsedData.type = msg.file.type;
                parsedData.name = msg.file.name;
                parsedData.type = msg.file.type;
                break;
              case 'BRDM':
              case 'ADMM':
                parsedData.messageType = 'admin';
                break;
              default:
                break;
            }
            return parsedData;
          }
          return msg;
        };

        let previousMessage: ParsedSendBirdMessage;
        const messagesArray: React.ReactElement<{}>[] = [];
        messages &&
          messages.forEach((msg, index) => {
            const message = getParsedMessage(msg);
            const nextMessage = index < messages.length - 1 ? getParsedMessage(messages[index + 1]) : null;

            const dateline = (
              <DateLine key={`dateline_${message.createdAt}`}>
                <DateLineTextWrapper>
                  <DateLineText messageRenderMode={messageRenderMode}>
                    {moment(message.createdAt).format('ll')}
                  </DateLineText>
                </DateLineTextWrapper>
              </DateLine>
            );

            const customerSendbirdId = ticket.customer.sendbirdId;
            const isCustomerMessage = message.sender && customerSendbirdId === message.sender.userId;
            const canDeleteMessage =
              isAdmin && isCustomerMessage && ticket.status2 === TicketStatus.CLOSED && !message.isRemoved;
            const deleteMessageAction: ChatBubbleAction | undefined = (() => {
              if (!canDeleteMessage || !onDeleteMessage) {
                return undefined;
              }
              return {
                label: intl.formatMessage({ id: 'desk.conversation.sendbird.message.action.delete' }),
                onClick: () => {
                  showDialog({
                    dialogTypes: DialogType.DeleteDeskSendbirdMessage,
                    dialogProps: {
                      ticketId: ticket.id,
                      messageId: message.messageId,
                      onSuccess: onDeleteMessage,
                    },
                  });
                },
              };
            })();

            if (previousMessage && previousMessage.createdAt && message.createdAt) {
              if (
                shouldRenderDateLine({
                  previousDate: previousMessage.createdAt,
                  nextDate: message.createdAt,
                })
              ) {
                messagesArray.push(dateline);
              }
            } else if (!previousMessage && index === 0 && message.createdAt) {
              // first message
              messagesArray.push(dateline);
            }
            if (!isEmpty(message)) {
              messagesArray.push(
                <SendBirdMessage
                  {...(index === 0 ? { ref: firstMessageNode } : null)}
                  key={message.messageId}
                  previousMessage={index > 0 ? previousMessage : undefined}
                  nextMessage={nextMessage}
                  message={message}
                  customerSendbirdId={customerSendbirdId}
                  lastSeenAt={lastSeenByCustomerAt}
                  messagesMode={messagesMode || DeskMessagesMode.SENDBIRD}
                  messageRenderMode={messageRenderMode || 'default'}
                  deleteMessageAction={canDeleteMessage ? deleteMessageAction : undefined}
                />,
              );
            }
            previousMessage = message;
          });
        return messagesArray;
      }, [
        messages,
        messageRenderMode,
        isAdmin,
        ticket.status2,
        ticket.id,
        ticket.customer.sendbirdId,
        onDeleteMessage,
        intl,
        showDialog,
        lastSeenByCustomerAt,
        messagesMode,
      ]);

      return (
        <DeskChatLayoutContext.Consumer>
          {({ ChatThreadMessagesContainer }) => (
            <ChatBubblesScrollBarRefContext.Consumer>
              {({ updateRef }) => {
                const scrollBarRefCallback = (ref: ScrollBarRef | null) => {
                  updateRef(ref);
                  csbComponent.current = ref;
                  setScrollHeight(ref?.scrollHeight || 0);
                };
                return (
                  <ScrollBar ref={scrollBarRefCallback} onScroll={handleScroll} options={{ suppressScrollX: true }}>
                    <ChatThreadMessagesContainer>{renderedMessages}</ChatThreadMessagesContainer>
                  </ScrollBar>
                );
              }}
            </ChatBubblesScrollBarRefContext.Consumer>
          )}
        </DeskChatLayoutContext.Consumer>
      );
    },
  ),
);
