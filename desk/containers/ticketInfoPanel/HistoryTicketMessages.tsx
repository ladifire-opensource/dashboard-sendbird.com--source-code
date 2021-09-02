import { useEffect, useRef, useCallback, FC, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import { toast, Spinner } from 'feather';

import { deskActions } from '@actions';
import { DeskMessagesMode } from '@constants';
import { fetchFacebookPage, fetchInstagramUser, getNexmoAccountDetail, fetchTwitterUserDetail } from '@desk/api';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { useScrollPositionRestoration, useShallowEqualSelector } from '@hooks';
import { useDeskEncryptedFileAccessPermission } from '@hooks/useDeskEncryptedFileAccessPermission';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { sortedTicketHistoryMessages } from '@selectors';
import { getTicketSocialType } from '@utils/desk';
import { logException } from '@utils/logException';

import { SendBirdMessages, SocialMessages, SocialMessagesRef, SendBirdMessagesRef } from '../conversation/messages';

const TicketMessages = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type Props = {
  ticket: Ticket;
};

export const HistoryTicketMessages: FC<Props> = ({ ticket }) => {
  const dispatch = useDispatch();
  const { ticketMessages, isFetchingInitialMessages } = useShallowEqualSelector((state) => ({
    ticketMessages: sortedTicketHistoryMessages(state),
    isFetchingInitialMessages: state.ticketHistory.isFetchingInitialMessages,
  }));
  const isEncryptedFileAccessPermitted = useDeskEncryptedFileAccessPermission({ ticket });
  const messagesComponent = useRef<SendBirdMessagesRef | SocialMessagesRef>(null);
  const { pid, region } = useProjectIdAndRegion();
  const { getErrorMessage } = useDeskErrorHandler();
  const [socialInfo, setSocialInfo] = useState<FacebookPage | TwitterUser | InstagramUser | NexmoAccount | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const [initialFetchTimestamp, setInitialFetchTimestamp] = useState<number | undefined>(undefined);

  const setFirstMessageNode = useScrollPositionRestoration({
    messageCount: ticketMessages.length,
    scrollTo: useCallback((y) => {
      if (messagesComponent.current) {
        messagesComponent.current.scrollTo(y);
      }
    }, []),
  });

  useEffect(() => {
    if (!isFetchingInitialMessages) {
      setInitialFetchTimestamp(Date.now());
    }
  }, [isFetchingInitialMessages]);

  useEffect(() => {
    dispatch(
      deskActions.fetchTicketHistoryMessagesRequest({
        channelType: ticket.channelType,
        types: 'initial',
        channelUrl: ticket.channelUrl,
        ticketId: ticket.id,
        messageTs: new Date().valueOf(),
        prevLimit: 50,
        nextLimit: 0,
        presignedFileUrl: isEncryptedFileAccessPermitted,
      }),
    );
  }, [dispatch, isEncryptedFileAccessPermitted, ticket.channelType, ticket.channelUrl, ticket.id]);

  const fetchMessagesPrev = useCallback(() => {
    if (!ticket) return;
    setFirstMessageNode(messagesComponent.current && messagesComponent.current.findFirstMessageNode());

    switch (ticket.channelType) {
      case 'SENDBIRD_JAVASCRIPT':
      case 'SENDBIRD_IOS':
      case 'SENDBIRD_ANDROID':
      case 'SENDBIRD':
        dispatch(
          deskActions.fetchTicketHistoryMessagesRequest({
            channelType: ticket.channelType,
            types: 'prev',
            ticketId: ticket.id,
            channelUrl: ticket.channelUrl,
            messageTs: ticketMessages.length > 0 ? (ticketMessages as SendBirdAPIMessage[])[0].created_at : 0,
            prevLimit: 50,
            nextLimit: 0,
            presignedFileUrl: isEncryptedFileAccessPermitted,
          }),
        );
        break;
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
      case 'WHATSAPP_MESSAGE':
        dispatch(
          deskActions.fetchTicketHistoryMessagesRequest({
            channelType: ticket.channelType,
            types: 'prev',
            ticketId: ticket.id,
            messageTs:
              ticketMessages.length > 0
                ? (ticketMessages as Exclude<TicketMessage, SendBirdSDKTicketMessage | InstagramCommentTicket>[])[0]
                    .timestamp
                : 0,
            prevLimit: 50,
            nextLimit: 0,
            presignedFileUrl: isEncryptedFileAccessPermitted,
          }),
        );
        break;
      case 'INSTAGRAM_COMMENT':
        dispatch(
          deskActions.fetchTicketHistoryMessagesRequest({
            channelType: ticket.channelType,
            types: 'prev',
            ticketId: ticket.id,
            messageTs:
              ticketMessages.length > 0
                ? (ticketMessages as InstagramCommentTicket[])[0].instagramComment.timestamp
                : 0,
            prevLimit: 50,
            nextLimit: 0,
            presignedFileUrl: isEncryptedFileAccessPermitted,
          }),
        );
        break;
      default:
        return;
    }
  }, [dispatch, isEncryptedFileAccessPermitted, setFirstMessageNode, ticket, ticketMessages]);

  const messages = useMemo(() => {
    switch (ticket.channelType) {
      case 'SENDBIRD_JAVASCRIPT':
      case 'SENDBIRD_IOS':
      case 'SENDBIRD_ANDROID':
      case 'SENDBIRD':
        return (
          <SendBirdMessages
            ref={messagesComponent}
            ticket={ticket}
            messagesMode={DeskMessagesMode.PLATFORM_API}
            messageRenderMode="compact"
            messages={ticketMessages as SendBirdAPIMessage[]}
            initialOrNextFetchedTimestamp={initialFetchTimestamp}
            fetchMessagesPrev={fetchMessagesPrev}
          />
        );
      case 'FACEBOOK_CONVERSATION':
      case 'FACEBOOK_FEED':
      case 'TWITTER_DIRECT_MESSAGE_EVENT':
      case 'TWITTER_STATUS':
      case 'INSTAGRAM_COMMENT':
      case 'WHATSAPP_MESSAGE': {
        if (socialInfo) {
          return (
            <SocialMessages
              ref={messagesComponent}
              ticket={{ ...ticket, ...socialInfo } as SocialTicket}
              messageRenderMode="compact"
              messages={ticketMessages as Exclude<PlatformAPITicketMessage, SendBirdAPIMessage>[]}
              initialOrNextFetchedTimestamp={initialFetchTimestamp}
              fetchMessagesPrev={fetchMessagesPrev}
            />
          );
        }
        return null;
      }
      default:
        return null;
    }
  }, [fetchMessagesPrev, initialFetchTimestamp, socialInfo, ticket, ticketMessages]);

  const fetchSocialInfo = useCallback(async () => {
    let socialInfo;
    setIsFetching(true);
    // FIXME: Type of facebookPage, twitterUser, instagramUser and nexmoAccount properties might be 'number'.
    try {
      switch (ticket.channelType) {
        case 'FACEBOOK_CONVERSATION':
        case 'FACEBOOK_FEED': {
          const { data } = await fetchFacebookPage(pid, region, {
            id: (ticket.facebookPage as unknown) as number,
          });
          socialInfo = { facebookPage: data };
          break;
        }
        case 'TWITTER_DIRECT_MESSAGE_EVENT':
        case 'TWITTER_STATUS': {
          const { data } = await fetchTwitterUserDetail(pid, region, {
            id: (ticket.twitterUser as unknown) as number,
          });
          socialInfo = { twitterUser: data };
          break;
        }
        case 'INSTAGRAM_COMMENT': {
          const { data } = await fetchInstagramUser(pid, region, {
            id: (ticket.instagramUser as unknown) as number,
          });
          socialInfo = { instagramUser: data };
          break;
        }
        case 'WHATSAPP_MESSAGE': {
          const { data } = await getNexmoAccountDetail(pid, region, {
            id: (ticket.nexmoAccount as unknown) as number,
          });
          socialInfo = { nexmoAccount: data };
          break;
        }
        default:
          break;
      }
      setSocialInfo(socialInfo);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logException({ error: errorMessage, context: { error } });
      toast.error({ message: errorMessage });
    } finally {
      setIsFetching(false);
    }
  }, [
    getErrorMessage,
    pid,
    region,
    ticket.channelType,
    ticket.facebookPage,
    ticket.instagramUser,
    ticket.nexmoAccount,
    ticket.twitterUser,
  ]);

  useEffect(() => {
    if (getTicketSocialType(ticket.channelType) !== 'sendbird') {
      fetchSocialInfo();
    }
  }, [fetchSocialInfo, ticket.channelType]);

  if (isFetching) {
    return (
      <SpinnerWrapper>
        <Spinner />
      </SpinnerWrapper>
    );
  }
  return <TicketMessages>{messages}</TicketMessages>;
};
