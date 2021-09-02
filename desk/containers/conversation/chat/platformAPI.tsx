import React, { useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { deskActions } from '@actions';
import { DeskMessagesMode } from '@constants';
import { ChatBubbleMenuPopperBoundariesElementContext } from '@desk/components/chatBubble/chatBubbleRenderer';
import { useDeskEncryptedFileAccessPermission } from '@hooks/useDeskEncryptedFileAccessPermission';
import { getConversationPlatformAPIMessages } from '@selectors';

import { SendBirdMessages } from '../messages';

const MessagesWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

type Props = { ticket: Ticket };

export const ChatPlatformAPI: React.FC<Props> = ({ ticket }) => {
  const dispatch = useDispatch();
  const { messages, initialOrNextFetchedTimestamp } = useSelector((state: RootState) => ({
    messages: getConversationPlatformAPIMessages(state),
    initialOrNextFetchedTimestamp: state.conversation.initialOrNextFetchedTimestamp,
  }));
  const { id: ticketId, channelUrl: ticketChannelUrl } = ticket;

  const isEncryptedFileAccessPermitted = useDeskEncryptedFileAccessPermission({ ticket });

  const pollMessagesInterval = useRef<number | null>(null);
  const pollMessagesRef = useRef<() => void>(() => {});
  const messagesWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pollMessagesRef.current = () => {
      dispatch(
        deskActions.fetchConversationMessagesRequest({
          types: 'next',
          channelUrl: ticketChannelUrl,
          messageTs: messages.length > 0 ? messages[messages.length - 1].created_at : 0,
          prevLimit: 0,
          nextLimit: 50,
          presignedFileUrl: isEncryptedFileAccessPermitted,
        }),
      );
    };
  }, [ticketChannelUrl, messages, isEncryptedFileAccessPermitted, dispatch]);

  useEffect(() => {
    // fetch ticket messages
    dispatch(
      deskActions.fetchConversationMessagesRequest({
        types: 'initial',
        channelUrl: ticketChannelUrl,
        messageTs: new Date().valueOf(),
        prevLimit: 50,
        nextLimit: 0,
        presignedFileUrl: isEncryptedFileAccessPermitted,
      }),
    );

    clearInterval(pollMessagesInterval.current || undefined);
    pollMessagesInterval.current = window.setInterval(() => pollMessagesRef.current(), 5000); // 5 seconds

    return () => {
      if (pollMessagesInterval.current != null) {
        clearInterval(pollMessagesInterval.current);
        pollMessagesInterval.current = null;
      }
    };
  }, [ticketId, ticketChannelUrl, isEncryptedFileAccessPermitted, dispatch]);

  const fetchConversationMessagesPrev = useCallback(() => {
    if (ticketChannelUrl) {
      dispatch(
        deskActions.fetchConversationMessagesRequest({
          types: 'prev',
          channelUrl: ticketChannelUrl,
          messageTs: messages.length > 0 ? messages[0].created_at : 0,
          prevLimit: 50,
          nextLimit: 0,
          presignedFileUrl: isEncryptedFileAccessPermitted,
        }),
      );
    }
  }, [dispatch, isEncryptedFileAccessPermitted, messages, ticketChannelUrl]);

  const handleDeleteMessage = useCallback(
    (messageId: number) => {
      dispatch(deskActions.updateConversationTicketMessage({ messageId, updated: { is_removed: true } }));
    },
    [dispatch],
  );

  return (
    <ChatBubbleMenuPopperBoundariesElementContext.Provider value={messagesWrapperRef.current || undefined}>
      <MessagesWrapper ref={messagesWrapperRef}>
        <SendBirdMessages
          key="wip_messages"
          ticket={ticket}
          messagesMode={DeskMessagesMode.PLATFORM_API}
          messages={messages}
          initialOrNextFetchedTimestamp={initialOrNextFetchedTimestamp}
          fetchMessagesPrev={fetchConversationMessagesPrev}
          onDeleteMessage={handleDeleteMessage}
        />
      </MessagesWrapper>
    </ChatBubbleMenuPopperBoundariesElementContext.Provider>
  );
};
