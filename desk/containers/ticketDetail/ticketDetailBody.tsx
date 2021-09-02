import React, { useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import styled, { css } from 'styled-components';

import { ScrollBarRef, InlineNotification, toast } from 'feather';

import { deskActions } from '@actions';
import { DeskMessagesMode, TicketStatus } from '@constants';
import { fetchTicket } from '@desk/api';
import { ChatBubbleMenuPopperBoundariesElementContext } from '@desk/components/chatBubble/chatBubbleRenderer';
import { ChatBubblesScrollBarRefContext } from '@desk/components/chatBubble/mediaRenderers';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useInterval, useScrollPositionRestoration } from '@hooks';
import { useDeskEncryptedFileAccessPermission } from '@hooks/useDeskEncryptedFileAccessPermission';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { sortedTicketDetailMessages } from '@selectors';
import { ReconnectNotification } from '@ui/components/reconnectionNotification';

import { DeskChatLayoutContext } from '../DeskChatLayout';
import { SendBirdMessages, SocialMessages, SocialMessagesRef, SendBirdMessagesRef } from '../conversation/messages';
import { TicketInfoPanel } from '../ticketInfoPanel';
import { TicketsContext } from '../tickets/ticketsContext';

const NotificationWrapper = styled.div`
  width: 100%;
  position: absolute;
  bottom: 48px;
  padding: 0 16px;
`;

const MessagesWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

type Props = {
  ticket: Ticket;
  isShownExportNotification: boolean;
  setIsShownExportNotification: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TicketDetailBody = React.memo<Props>(
  ({ ticket, isShownExportNotification, setIsShownExportNotification }) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const { pid, region } = useProjectIdAndRegion();
    const initialOrNextFetchedTimestamp = useSelector(
      (state: RootState) => state.ticketDetail.initialOrNextFetchedTimestamp,
    );
    const ticketMessages = useSelector((state: RootState) => sortedTicketDetailMessages(state));
    const isFetchingMessages = useSelector((state: RootState) => state.ticketDetail.isFetchingMessages);
    const { getErrorMessage } = useDeskErrorHandler();

    const { ChatThreadGridItem, InformationSidebarGridItem } = useContext(DeskChatLayoutContext);
    const { updateTicketInList } = useContext(TicketsContext);

    const isEncryptedFileAccessPermitted = useDeskEncryptedFileAccessPermission({ ticket });

    const { id: ticketId, channelType, channelUrl } = ticket;

    const scrollRef = useRef<ScrollBarRef>();
    const messagesRef = useRef<SendBirdMessagesRef | SocialMessagesRef | null>(null);
    const latestMessagesRef = useRef({ ticketMessages, isFetchingMessages });
    const messagesWrapperRef = useRef<HTMLDivElement>(null);

    const updateScrollRef = useCallback((ref: ScrollBarRef) => {
      scrollRef.current = ref;
    }, []);

    const setFirstMessageNode = useScrollPositionRestoration({
      messageCount: ticketMessages.length,
      scrollTo: useCallback((y) => {
        if (messagesRef.current) {
          messagesRef.current.scrollTo(y);
        }
      }, []),
    });

    useEffect(() => {
      latestMessagesRef.current = { ticketMessages, isFetchingMessages };
    }, [isFetchingMessages, ticketMessages]);

    const { apiMessages = [], socialTicketMessages = [] } = useMemo(() => {
      const isSendBirdTicket =
        ticket.channelType === 'SENDBIRD' ||
        ticket.channelType === 'SENDBIRD_JAVASCRIPT' ||
        ticket.channelType === 'SENDBIRD_IOS' ||
        ticket.channelType === 'SENDBIRD_ANDROID';
      if (isSendBirdTicket) {
        return { apiMessages: ticketMessages as SendBirdAPIMessage[] };
      }
      return { socialTicketMessages: ticketMessages as Exclude<PlatformAPITicketMessage, SendBirdAPIMessage>[] };
    }, [ticket.channelType, ticketMessages]);

    const getFetchSocialTicketTimestamp = useCallback(
      ({ socialTicketMessages, isPrev }) => {
        const timestampIndex = isPrev ? 0 : socialTicketMessages.length - 1;
        const isExistsSocialTicketMessages = socialTicketMessages.length > 0;
        switch (ticket.channelType) {
          case 'INSTAGRAM_COMMENT':
            return isExistsSocialTicketMessages
              ? (socialTicketMessages[timestampIndex] as InstagramCommentTicket).instagramComment.timestamp
              : 0;

          default:
            return isExistsSocialTicketMessages ? socialTicketMessages[timestampIndex].timestamp : 0;
        }
      },
      [ticket.channelType],
    );

    const fetchTicketDetailMessagesPrev = useCallback(() => {
      /**
       * This function will be called by scroll event, and directly accessing to the props in this function will get
       * stale values that was captured when this function was defined. That's why we use `latestMessages.current` to
       * get the latest prop values at the moment of this function gets called.
       */
      const { isFetchingMessages, ticketMessages: latestTicketMessages } = latestMessagesRef.current;

      if (isFetchingMessages) {
        // prevent duplicated requests
        return;
      }

      // Save the first message node now to restore the scroll position after the messages are added.
      setFirstMessageNode(messagesRef.current && messagesRef.current.findFirstMessageNode());

      switch (ticket.channelType) {
        case 'SENDBIRD_JAVASCRIPT':
        case 'SENDBIRD_IOS':
        case 'SENDBIRD_ANDROID':
        case 'SENDBIRD': {
          const apiMessages = latestTicketMessages as SendBirdAPIMessage[];
          dispatch(
            deskActions.fetchTicketDetailMessagesRequest({
              ticketId: ticket.id,
              channelType: ticket.channelType,
              types: 'prev',
              channelUrl: ticket.channelUrl,
              messageTs: apiMessages.length > 0 ? apiMessages[0].created_at : 0,
              prevLimit: 50,
              nextLimit: 0,
              presignedFileUrl: isEncryptedFileAccessPermitted,
            }),
          );
          return;
        }

        case 'FACEBOOK_CONVERSATION':
        case 'FACEBOOK_FEED':
        case 'TWITTER_DIRECT_MESSAGE_EVENT':
        case 'TWITTER_STATUS':
        case 'INSTAGRAM_COMMENT':
        case 'WHATSAPP_MESSAGE': {
          const socialTicketMessages = latestTicketMessages as Exclude<PlatformAPITicketMessage, SendBirdAPIMessage>[];
          dispatch(
            deskActions.fetchTicketDetailMessagesRequest({
              channelType: ticket.channelType,
              types: 'prev',
              ticketId: ticket.id,
              messageTs: getFetchSocialTicketTimestamp({ socialTicketMessages, isPrev: true }),
              prevLimit: 50,
              nextLimit: 0,
              presignedFileUrl: isEncryptedFileAccessPermitted,
            }),
          );
          return;
        }

        default:
          throw new Error(`Undefined TicketChannelType: ${ticket.channelType}`);
      }
    }, [
      dispatch,
      getFetchSocialTicketTimestamp,
      isEncryptedFileAccessPermitted,
      setFirstMessageNode,
      ticket.channelType,
      ticket.channelUrl,
      ticket.id,
    ]);

    const pollMessages = useCallback(() => {
      switch (ticket.channelType) {
        case 'SENDBIRD_JAVASCRIPT':
        case 'SENDBIRD_IOS':
        case 'SENDBIRD_ANDROID':
        case 'SENDBIRD':
          dispatch(
            deskActions.fetchTicketDetailMessagesRequest({
              ticketId: ticket.id,
              channelType: ticket.channelType,
              types: 'next',
              channelUrl: ticket.channelUrl,
              messageTs: apiMessages.length > 0 ? apiMessages[apiMessages.length - 1].created_at : 0,
              prevLimit: 0,
              nextLimit: 50,
              presignedFileUrl: isEncryptedFileAccessPermitted,
            }),
          );
          break;

        case 'FACEBOOK_CONVERSATION':
        case 'FACEBOOK_FEED':
        case 'TWITTER_DIRECT_MESSAGE_EVENT':
        case 'TWITTER_STATUS':
        case 'INSTAGRAM_COMMENT':
        case 'WHATSAPP_MESSAGE':
          dispatch(
            deskActions.fetchTicketDetailMessagesRequest({
              channelType: ticket.channelType,
              types: 'next',
              ticketId: ticket.id,
              messageTs: getFetchSocialTicketTimestamp({ socialTicketMessages, isPrev: false }),
              prevLimit: 0,
              nextLimit: 50,
              presignedFileUrl: isEncryptedFileAccessPermitted,
            }),
          );
          break;
        default:
          throw new Error(`Undefined TicketChannelType: ${ticket.channelType}`);
      }
      dispatch(deskActions.fetchTicketDetailHeaderRequest(ticket.id));
    }, [
      ticket.channelType,
      ticket.id,
      ticket.channelUrl,
      dispatch,
      apiMessages,
      isEncryptedFileAccessPermitted,
      getFetchSocialTicketTimestamp,
      socialTicketMessages,
    ]);

    const handleDeleteSendbirdAPIMessage = useCallback(
      async (messageId: number) => {
        const currentMessage = apiMessages.find((message) => message.message_id === messageId);

        if (currentMessage) {
          const newMessage = { ...currentMessage, is_removed: true };
          dispatch(deskActions.updateTicketDetailSendbirdAPIMessage(newMessage));

          // FIXME: if lastMessageId property added, update ticket lastMessage without API fetching
          try {
            const { data } = await fetchTicket(pid, region, { ticketId: ticket.id });
            updateTicketInList(data);
          } catch (error) {
            toast.error({ message: getErrorMessage(error) });
          }
        }
      },
      [apiMessages, dispatch, getErrorMessage, pid, region, ticket.id, updateTicketInList],
    );

    useInterval(ticket.status2 === TicketStatus.CLOSED ? undefined : pollMessages, 5000);

    useEffect(() => {
      switch (channelType) {
        case 'SENDBIRD_JAVASCRIPT':
        case 'SENDBIRD_IOS':
        case 'SENDBIRD_ANDROID':
        case 'SENDBIRD':
          dispatch(
            deskActions.fetchTicketDetailMessagesRequest({
              ticketId,
              channelType,
              types: 'initial',
              channelUrl,
              messageTs: new Date().valueOf(),
              prevLimit: 50,
              nextLimit: 0,
              presignedFileUrl: isEncryptedFileAccessPermitted,
            }),
          );
          return;
        case 'FACEBOOK_CONVERSATION':
        case 'FACEBOOK_FEED':
        case 'TWITTER_DIRECT_MESSAGE_EVENT':
        case 'TWITTER_STATUS':
        case 'INSTAGRAM_COMMENT':
        case 'WHATSAPP_MESSAGE':
          dispatch(
            deskActions.fetchTicketDetailMessagesRequest({
              ticketId,
              channelType,
              types: 'initial',
              messageTs: new Date().valueOf(),
              prevLimit: 50,
              nextLimit: 0,
              presignedFileUrl: isEncryptedFileAccessPermitted,
            }),
          );
          return;
        default:
          throw new Error(`Undefined TicketChannelType: ${channelType}`);
      }
    }, [ticketId, channelType, channelUrl, dispatch, isEncryptedFileAccessPermitted]);

    const messages = useMemo(() => {
      switch (ticket.channelType) {
        case 'SENDBIRD_JAVASCRIPT':
        case 'SENDBIRD_IOS':
        case 'SENDBIRD_ANDROID':
        case 'SENDBIRD':
          return (
            <SendBirdMessages
              ref={messagesRef as React.Ref<SendBirdMessagesRef>}
              ticket={ticket}
              messagesMode={DeskMessagesMode.PLATFORM_API}
              messages={apiMessages}
              initialOrNextFetchedTimestamp={initialOrNextFetchedTimestamp}
              fetchMessagesPrev={fetchTicketDetailMessagesPrev}
              onDeleteMessage={handleDeleteSendbirdAPIMessage}
            />
          );
        case 'FACEBOOK_CONVERSATION':
        case 'FACEBOOK_FEED':
        case 'TWITTER_DIRECT_MESSAGE_EVENT':
        case 'TWITTER_STATUS':
        case 'INSTAGRAM_COMMENT':
        case 'WHATSAPP_MESSAGE':
          return (
            <SocialMessages
              ref={messagesRef as any}
              origin="detail"
              ticket={ticket as SocialTicket}
              messages={socialTicketMessages}
              fetchMessagesPrev={fetchTicketDetailMessagesPrev}
              initialOrNextFetchedTimestamp={initialOrNextFetchedTimestamp}
            />
          );
        default:
          throw new Error(`Undefined TicketChannelType: ${ticket.channelType}`);
      }
    }, [
      apiMessages,
      fetchTicketDetailMessagesPrev,
      handleDeleteSendbirdAPIMessage,
      initialOrNextFetchedTimestamp,
      socialTicketMessages,
      ticket,
    ]);

    const handleCloseNotification = useCallback(() => {
      setIsShownExportNotification(false);
    }, [setIsShownExportNotification]);

    return (
      <ChatBubbleMenuPopperBoundariesElementContext.Provider value={messagesWrapperRef.current || undefined}>
        <ChatBubblesScrollBarRefContext.Provider value={{ ref: scrollRef, updateRef: updateScrollRef }}>
          <ChatThreadGridItem
            styles={css`
              display: flex;
              flex-direction: column;
              position: relative;
              z-index: 0;
              overflow: hidden;
            `}
          >
            <ReconnectNotification />
            <MessagesWrapper ref={messagesWrapperRef}>{messages}</MessagesWrapper>
            {isShownExportNotification && (
              <NotificationWrapper>
                <InlineNotification
                  type="info"
                  message={intl.formatMessage(
                    { id: 'desk.dataExport.notification.dataExport.start' },
                    {
                      link: <Link to="../data_exports">{intl.formatMessage({ id: 'desk.dataExport.title' })}</Link>,
                    },
                  )}
                  onClose={handleCloseNotification}
                />
              </NotificationWrapper>
            )}
          </ChatThreadGridItem>
          <InformationSidebarGridItem>
            <TicketInfoPanel hasLinkToDetail={true} ticket={ticket} />
          </InformationSidebarGridItem>
        </ChatBubblesScrollBarRefContext.Provider>
      </ChatBubbleMenuPopperBoundariesElementContext.Provider>
    );
  },
);
