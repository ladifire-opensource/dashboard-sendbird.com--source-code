import { FC, useContext, useRef, useState, useCallback, useLayoutEffect, useEffect, ReactNode } from 'react';
import { useIntl } from 'react-intl';

import styled, { css } from 'styled-components';

import { cssVariables, IconButton, Headings, Spinner, ScrollBar, ScrollBarRef, Icon, Subtitles, toast } from 'feather';
import isEmpty from 'lodash/isEmpty';

import { fetchGroupChannelsMessages, fetchGroupChannelsMessagesTotalCount } from '@chat/api';
import APIMessage from '@chat/components/APIMessage';
import DateLine from '@chat/containers/moderationTools/components/DateLine';
import { MessageItem, MessageWrapper } from '@chat/containers/moderationTools/message';
import { useAppId } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { shouldRenderDateLine, platformMessageTypeChecker } from '@utils';

import { RelatedChatContext } from './RelatedChatContext';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: ${cssVariables('neutral-1')};
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px 8px 12px;
  border-bottom: 1px solid ${cssVariables('neutral-3')};
`;

const Subject = styled.h4`
  ${Headings['heading-01']};
  color: ${cssVariables('neutral-10')};
`;

const CloseButton = styled(IconButton).attrs({
  icon: 'close',
  size: 'small',
  buttonType: 'tertiary',
})`
  svg,
  &:hover svg,
  &:active svg,
  &[aria-pressed='true'] svg,
  &:disabled svg {
    fill: ${cssVariables('neutral-9')};
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

const MessagesBody = styled.div`
  ${MessageItem} {
    background: ${cssVariables('neutral-1')};
  }
`;

const StyledDateLine = styled(DateLine)`
  background: ${cssVariables('neutral-1')};
`;

const systemMessageStyle = css`
  ${MessageWrapper} {
    font-size: 12px;
    line-height: 1.33;
    color: ${cssVariables('neutral-7')};
  }
`;

const EmptyViewWrapper = styled.div`
  position: absolute;
  top: 42%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  p {
    padding-top: 12px;
    ${Subtitles['subtitle-02']};
    color: ${cssVariables('neutral-7')};
  }
`;

const getMessageWithDecryptedFile = (message: SendBirdAPIMessage) => {
  if (message.type !== 'FILE' || message.file == null) {
    return message;
  }

  // Tweak for the encrypted files
  const { url, thumbnails } = new (window.dashboardSB.FileMessage as any)({ ...message, url: message.file?.url });
  return { ...message, file: { ...message.file, url }, thumbnails };
};

export const RelatedChat: FC = () => {
  const intl = useIntl();
  const appId = useAppId();
  const { getErrorMessage } = useDeskErrorHandler();
  const { close, current } = useContext(RelatedChatContext);
  const [isFetching, setIsFetching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [messages, setMessages] = useState<SendBirdAPIMessage[]>([]);
  const showSpinner = useRef(true);
  const scrollBarRef = useRef<ScrollBarRef | null>(null);
  const prevFirstMessageItemRef = useRef<HTMLDivElement | null>(null);

  const setPrevFirstMessageItemRef = (ref) => {
    if (prevFirstMessageItemRef.current == null) {
      prevFirstMessageItemRef.current = ref;
    }
  };

  const handleScroll = async ({ currentTarget }) => {
    if (totalCount > messages.length && scrollBarRef.current && currentTarget.scrollTop === 0 && current) {
      try {
        const { data } = await fetchGroupChannelsMessages({
          appId,
          channelUrl: current.channel_url,
          ts: messages[0].created_at,
          prevLimit: 20,
          nextLimit: 0,
          include: false,
        });
        setMessages(data.messages.concat(messages));
      } catch (error) {
        toast.error({ message: getErrorMessage(error) });
      }
    }
  };

  const renderMessages = useCallback((messages: SendBirdAPIMessage[]) => {
    let previousMessage;
    const messagesArray: ReactNode[] = [];

    messages.forEach((messageData, index) => {
      if (!previousMessage) {
        messagesArray.push(<StyledDateLine key={messageData.created_at} timestamp={messageData.created_at} />);
      } else if (previousMessage && previousMessage.created_at && messageData.created_at) {
        const result = shouldRenderDateLine({
          previousDate: previousMessage.created_at,
          nextDate: messageData.created_at,
        });
        if (result) {
          messagesArray.push(<StyledDateLine key={messageData.created_at} timestamp={messageData.created_at} />);
        }
      }
      previousMessage = messageData;

      if (!isEmpty(messageData)) {
        const message = getMessageWithDecryptedFile(messageData);
        messagesArray.push(
          <APIMessage
            {...(index === 0 && { onRefAttached: setPrevFirstMessageItemRef })}
            key={message.message_id}
            message={message}
            messageItemStyles={platformMessageTypeChecker.isAdminMessage(messageData) && systemMessageStyle}
          />,
        );
      }
    });

    return messagesArray;
  }, []);

  useEffect(() => {
    const load = async () => {
      if (current) {
        try {
          setIsFetching(true);
          const {
            data: { total },
          } = await fetchGroupChannelsMessagesTotalCount({ appId, channelUrl: current.channel_url });
          const {
            data: { messages },
          } = await fetchGroupChannelsMessages({
            appId,
            channelUrl: current.channel_url,
            ts: new Date().valueOf(),
            prevLimit: 50,
            nextLimit: 0,
            include: true,
          });
          setTotalCount(total);
          setMessages(messages);
        } catch (error) {
          toast.error({ message: getErrorMessage(error) });
        } finally {
          setIsFetching(false);
        }
      }
    };
    load();
  }, [appId, current, getErrorMessage]);

  useLayoutEffect(() => {
    if (messages.length > 0) {
      if (showSpinner.current) {
        showSpinner.current = false;
        setTimeout(() => scrollBarRef.current?.scrollToBottom());
      } else {
        scrollBarRef.current?.scrollTo(0, (prevFirstMessageItemRef.current?.offsetTop ?? 0) - 100);
      }
    }
  }, [messages]);

  if (current) {
    return (
      <Container>
        <Header>
          <Subject>{current.name}</Subject>
          <CloseButton onClick={close} />
        </Header>
        <Body>
          {isFetching && showSpinner.current ? (
            <SpinnerWrapper data-test-id="SpinnerWrapper">
              <Spinner size={32} />
            </SpinnerWrapper>
          ) : (
            <ScrollBar ref={scrollBarRef} onScroll={handleScroll}>
              <MessagesBody data-test-id="MessageBody">
                {messages.length > 0 ? (
                  renderMessages(messages)
                ) : (
                  <EmptyViewWrapper>
                    <Icon icon="admin-message" size={64} color={cssVariables('neutral-5')} />
                    <p>{intl.formatMessage({ id: 'desk.tickets.ticketInfoPanel.ticketInfo.relatedChat.noMessage' })}</p>
                  </EmptyViewWrapper>
                )}
              </MessagesBody>
            </ScrollBar>
          )}
        </Body>
      </Container>
    );
  }
  return null;
};
