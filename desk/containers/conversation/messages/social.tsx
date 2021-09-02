import React, { useRef, useCallback, useState, useMemo, useImperativeHandle, useLayoutEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import { ScrollBar, ScrollBarRef, toast } from 'feather';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DeskAvatarType, DeskMessageRenderMode } from '@constants';
import { getTwitterStatus } from '@desk/api';
import ChatBubblesContainer from '@desk/components/chatBubble/ChatBubblesContainer';
import SocialMediaPostBubble from '@desk/components/chatBubble/SocialMediaPostBubble';
import { VideoFile, ImageFile } from '@desk/components/chatBubble/fileInterfaces';
import { ChatBubblesScrollBarRefContext } from '@desk/components/chatBubble/mediaRenderers';
import twitterAvatar from '@desk/components/chatBubble/twitterAvatar';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { parseTextAndFilesFromTwitterStatus, getTwitterStatusURL } from '@desk/utils/twitterUtils';
import { usePrevious } from '@hooks';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { shouldRenderDateLine, PropOf } from '@utils';

import { DeskChatLayoutContext } from '../../DeskChatLayout';
import { ChatDateLine } from '../ChatDateLine';
import { FacebookMessage, TwitterMessage, FacebookFeed, TwitterStatus } from '../message';
import { WhatsAppMessage } from '../message/WhatsAppMessage';
import { InstagramCommentMessage } from '../message/instagramComment';
import { generateMessageOptions, generateTwitterStatusOptions } from './generateMessageOptions';

type Props = {
  ticket: SocialTicket;
  messages: (
    | FacebookPageMessage
    | FacebookFeedType
    | AttachmentParsedTwitterDirectMessageEvent
    | MergedTwitterStatus
    | InstagramCommentTicket
    | WhatsAppMessageType
  )[];
  initialOrNextFetchedTimestamp?: number;
  style?: React.CSSProperties;
  messageRenderMode?: DeskMessageRenderMode;
  origin?: DeskOrigin;

  fetchMessagesPrev: () => void;
  handleFeedAction?: ({ message, action }) => void;
};

type State = {
  thirdPartyTwitterStatuses: { [id: string]: TwitterAPITwitterStatus };
  fetchingThirdPartyTwitterStatusIds: string[];
  expandedThirdPartyTwitterStatusIndexes: number[];
};

export interface SocialMessagesRef {
  scrollToBottom: () => void;
  scrollTo(y: number): void;
  findFirstMessageNode: () => HTMLDivElement | null;
}

export const SocialMessages = React.forwardRef<SocialMessagesRef, Props>(
  (
    {
      style,
      ticket,
      messages,
      messageRenderMode = 'default',
      origin = 'conversation',
      initialOrNextFetchedTimestamp,
      fetchMessagesPrev,
      handleFeedAction,
    },
    ref,
  ) => {
    const intl = useIntl();
    const { pid, region } = useProjectIdAndRegion();
    const { getErrorMessage } = useDeskErrorHandler();
    const dispatch = useDispatch();
    const { channelType, customer, data, lastSeenAt, facebookPage, twitterUser, instagramUser, nexmoAccount } = ticket;
    const csbComponent = useRef<ScrollBarRef | null>(null);
    const firstMessageNode = useRef<HTMLDivElement | null>(null);
    const [
      { thirdPartyTwitterStatuses, fetchingThirdPartyTwitterStatusIds, expandedThirdPartyTwitterStatusIndexes },
      setState,
    ] = useState<State>({
      thirdPartyTwitterStatuses: {},
      fetchingThirdPartyTwitterStatusIds: [],
      expandedThirdPartyTwitterStatusIndexes: [],
    });

    const [scrollHeight, setScrollHeight] = useState(0);
    const [shouldCallScrollToBottom, setShouldCallScrollToBottom] = useState(true);

    const prevScrollHeight = usePrevious(scrollHeight);

    const scrollToBottom = useCallback(() => {
      if (csbComponent.current) {
        csbComponent.current.scrollToBottom();
      }
    }, []);

    const scrollTo = useCallback((y: number) => {
      if (csbComponent.current) {
        csbComponent.current.scrollTo(0, y);
      }
    }, []);

    const findFirstMessageNode = useCallback(() => {
      return firstMessageNode.current;
    }, []);

    useImperativeHandle(ref, () => ({
      scrollToBottom,
      scrollTo,
      findFirstMessageNode,
    }));

    useLayoutEffect(() => {
      if (initialOrNextFetchedTimestamp) {
        setShouldCallScrollToBottom(true);
        scrollToBottom();
      }
    }, [initialOrNextFetchedTimestamp, scrollToBottom]);

    useLayoutEffect(() => {
      if (prevScrollHeight !== scrollHeight && shouldCallScrollToBottom) {
        scrollToBottom();
        setShouldCallScrollToBottom(false);
      }
    }, [prevScrollHeight, scrollHeight, scrollToBottom, shouldCallScrollToBottom]);

    const handleScroll: PropOf<typeof ScrollBar, 'onScroll'> = (event) => {
      if (event.target?.['scrollTop'] === 0) {
        fetchMessagesPrev();
      }
    };

    const originalTweetStatusId = useMemo(() => {
      if (ticket.channelType !== 'TWITTER_STATUS') {
        return null;
      }
      try {
        const parsedData = JSON.parse(ticket.data);
        // parsedData.social.source contains the Tweet which triggered a new ticket.
        return parsedData.social.source.in_reply_to_status_id as string | null;
      } catch {
        return null;
      }
    }, [ticket.channelType, ticket.data]);

    const toggleExpandTwitterStatus = useCallback(
      (statusId: string, index: number) => async (isExpanded: boolean) => {
        if (!isExpanded) {
          // If isExpanded is false, remove the index from expandedThirdPartyTwitterStatusIndexes state
          return setState((state) => ({
            ...state,
            expandedThirdPartyTwitterStatusIndexes: state.expandedThirdPartyTwitterStatusIndexes.filter(
              (item) => item !== index,
            ),
          }));
        }

        /**
         * If the status is already fetched and stored in the state, just add the  style, messageRenderMode, origin,
         * fetchMessagesPrev, handleFeedAction, showImagePreviewRequest,index to `expandedThirdPartyTwitterStatusIndexes`
         * state.
         */
        if (thirdPartyTwitterStatuses[statusId]) {
          setState((state) => ({
            ...state,
            expandedThirdPartyTwitterStatusIndexes: [...state.expandedThirdPartyTwitterStatusIndexes, index],
          }));
          return;
        }

        /**
         * If the status does not exist in the state, fetch it from Twitter.
         */
        if (!twitterUser) {
          toast.error({ message: intl.formatMessage({ id: 'desk.conversation.twitter.message.fetch.error' }) });
          return;
        }
        try {
          setState((state) => ({
            ...state,
            fetchingThirdPartyTwitterStatusIds: state.fetchingThirdPartyTwitterStatusIds.concat(statusId),
          }));
          const { data } = await getTwitterStatus(pid, region, { id: twitterUser.id, statusId });
          setState((state) => ({
            thirdPartyTwitterStatuses: { ...state.thirdPartyTwitterStatuses, [statusId]: data },
            fetchingThirdPartyTwitterStatusIds: state.fetchingThirdPartyTwitterStatusIds.filter(
              (item) => item !== statusId,
            ),
            expandedThirdPartyTwitterStatusIndexes: [...state.expandedThirdPartyTwitterStatusIndexes, index],
          }));
        } catch (error) {
          toast.error({ message: getErrorMessage(error) });
        }
      },
      [getErrorMessage, intl, pid, region, thirdPartyTwitterStatuses, twitterUser],
    );

    const renderedFacebookPageMessages = useMemo(() => {
      if (channelType !== 'FACEBOOK_CONVERSATION' || !facebookPage) {
        return [];
      }
      const facebookPageMessages = messages as FacebookPageMessage[];
      return facebookPageMessages.reduce<React.ReactElement[]>((components, message, index, items) => {
        const previousMessage = index > 0 ? items[index - 1] : undefined;
        const nextMessage = index < items.length - 1 ? items[index + 1] : undefined;

        const isFirstMessage = index === 0 && message.timestamp;
        if (
          isFirstMessage ||
          (previousMessage &&
            previousMessage.timestamp &&
            message.timestamp &&
            shouldRenderDateLine({
              previousDate: previousMessage.timestamp,
              nextDate: message.timestamp,
            }))
        ) {
          components.push(<ChatDateLine key={`messageDateLine_${index}`} createdAt={message.timestamp} />);
        }

        components.push(
          <FacebookMessage
            ref={isFirstMessage ? firstMessageNode : null}
            key={`facebook_page_message_${message.mid}`}
            origin={origin}
            options={generateMessageOptions({
              previousMessage: previousMessage && { ...previousMessage, timestamp: moment(previousMessage.createdAt) },
              message: { ...message, timestamp: moment(message.createdAt) },
              nextMessage: nextMessage && { ...nextMessage, timestamp: moment(nextMessage.createdAt) },
            })}
            message={message}
            ticketInfo={{ facebookPage, customer, lastSeenAt }}
            messageRenderMode={messageRenderMode}
          />,
        );

        return components;
      }, []);
    }, [channelType, customer, facebookPage, lastSeenAt, messageRenderMode, messages, origin]);

    const renderedFacebookFeedMessages = useMemo(() => {
      if (channelType !== 'FACEBOOK_FEED' || !facebookPage) {
        return [];
      }
      const facebookFeeds = messages as FacebookFeedType[];
      return facebookFeeds.reduce<React.ReactElement[]>((components, message, index, items) => {
        const previousMessage = index > 0 ? items[index - 1] : undefined;
        const nextMessage = index < facebookFeeds.length - 1 ? facebookFeeds[index + 1] : undefined;

        const isFirstMessage = !previousMessage && index === 0 && message.timestamp;
        if (
          isFirstMessage ||
          (previousMessage &&
            previousMessage.timestamp &&
            message.timestamp &&
            shouldRenderDateLine({
              previousDate: previousMessage.timestamp,
              nextDate: message.timestamp,
            }))
        ) {
          components.push(<ChatDateLine key={`messageDateLine_${index}`} createdAt={message.timestamp} />);
        }

        components.push(
          <FacebookFeed
            ref={isFirstMessage ? firstMessageNode : null}
            key={`facebook_page_feed_${message.feedId}`}
            origin={origin}
            options={generateMessageOptions({
              previousMessage: previousMessage && {
                ...previousMessage,
                senderId: previousMessage.fromId,
                timestamp: moment(previousMessage.timestamp),
              },
              message: { ...message, senderId: message.fromId, timestamp: moment(message.timestamp) },
              nextMessage: nextMessage && {
                ...nextMessage,
                senderId: nextMessage.fromId,
                timestamp: moment(nextMessage.timestamp),
              },
            })}
            message={message}
            ticketInfo={{ facebookPage, customer, data }}
            messageRenderMode={messageRenderMode}
            handleFeedAction={handleFeedAction!}
          />,
        );

        return components;
      }, []);
    }, [channelType, customer, data, facebookPage, handleFeedAction, messageRenderMode, messages, origin]);

    const renderedTwitterDirectMessageEventMessages = useMemo(() => {
      if (channelType !== 'TWITTER_DIRECT_MESSAGE_EVENT' || !twitterUser) {
        return [];
      }
      const twitterDirectMessageEvents = messages as AttachmentParsedTwitterDirectMessageEvent[];
      return twitterDirectMessageEvents.reduce<React.ReactElement[]>((components, message, index, items) => {
        const previousMessage = index > 0 ? items[index - 1] : undefined;
        const nextMessage = index < items.length - 1 ? items[index + 1] : undefined;

        const isFirstMessage = !previousMessage && index === 0 && message.timestamp;
        if (
          isFirstMessage ||
          (previousMessage &&
            previousMessage.timestamp &&
            message.timestamp &&
            shouldRenderDateLine({
              previousDate: previousMessage.timestamp,
              nextDate: message.timestamp,
            }))
        ) {
          components.push(<ChatDateLine key={`messageDateLine_${index}`} createdAt={message.timestamp} />);
        }

        const onTwitterMessageDeleteActionClick = () => {
          handleFeedAction && handleFeedAction({ message, action: 'DELETE' });
        };

        components.push(
          <TwitterMessage
            ref={isFirstMessage ? (firstMessageNode as any) : null}
            key={`${channelType.toLowerCase()}_${message.eventId}`}
            origin={origin}
            options={generateMessageOptions({
              previousMessage: previousMessage && { ...previousMessage, timestamp: moment(previousMessage.createdAt) },
              message: { ...message, timestamp: moment(message.createdAt) },
              nextMessage: nextMessage && { ...nextMessage, timestamp: moment(nextMessage.createdAt) },
            })}
            message={message}
            ticketInfo={{ twitterUser, customer, lastSeenAt }}
            messageRenderMode={messageRenderMode}
            onDeleteActionClick={onTwitterMessageDeleteActionClick}
          />,
        );

        return components;
      }, []);
    }, [channelType, customer, handleFeedAction, lastSeenAt, messageRenderMode, messages, origin, twitterUser]);

    const renderedTwitterStatusMessages = useMemo(() => {
      if (channelType !== 'TWITTER_STATUS' || !twitterUser) {
        return [];
      }
      const twitterStatuses = messages as MergedTwitterStatus[];
      return twitterStatuses
        .map(({ inReplyToStatusId, ...rest }, index, array) => {
          /**
           * If inReplyToStatusId is defined, it means that there is a Tweet that the message is in reply to.
           * It is displayed as `SocialMediaPostBubble` except when it is included in the ticket messages, or when
           * the message is the first message of the ticket.
           */
          const isInReplyToStatusVisible =
            !!inReplyToStatusId && array.every((message) => message.statusId !== inReplyToStatusId) && index > 0;
          return { ...rest, inReplyToStatusId, isInReplyToStatusVisible };
        })
        .reduce<React.ReactElement[]>((components, message, index, items) => {
          const prevMessage = index > 0 ? items[index - 1] : undefined;
          const nextMessage = index < items.length - 1 ? items[index + 1] : undefined;

          const isFirstMessage = !prevMessage && index === 0 && message.timestamp;
          if (
            isFirstMessage ||
            (prevMessage &&
              prevMessage.timestamp &&
              message.timestamp &&
              shouldRenderDateLine({ previousDate: prevMessage.timestamp, nextDate: message.timestamp }))
          ) {
            components.push(<ChatDateLine key={`messageDateLine_${index}`} createdAt={message.timestamp} />);
          }

          const { inReplyToStatusId, senderId, statusId, isInReplyToStatusVisible } = message;
          const onTwitterStatusReplyActionClick = () => {
            handleFeedAction && handleFeedAction({ message, action: 'REPLY' });
          };

          /**
           * If the ticket is created by the customer's reply to the integrated Twitter account's Tweet,
           * the Tweet becomes the first message of the ticket. It's called "original Tweet" here, and it is
           * displayed as `SocialMediaPostBubble`.
           */
          const isOriginalTweet =
            statusId === originalTweetStatusId && senderId === (ticket as TwitterTicket).twitterUser.userId;
          const isOriginalThirdPartyTweet =
            statusId === originalTweetStatusId && senderId !== (ticket as TwitterTicket).twitterUser.userId;
          const thirdPartyTwitterStatusId = isOriginalThirdPartyTweet ? statusId : (inReplyToStatusId as string);
          const isExpanded = expandedThirdPartyTwitterStatusIndexes.includes(index);
          const tweetInformationProps: Partial<React.ComponentProps<typeof SocialMediaPostBubble>> = (() => {
            if (isExpanded) {
              const {
                created_at,
                entities,
                extended_entities: extendedEntities,
                full_text: text,
                user: { screen_name: screenName, profile_image_url_https },
                quoted_status_permalink,
              } = thirdPartyTwitterStatuses[thirdPartyTwitterStatusId];
              const { displayedText, files } = parseTextAndFilesFromTwitterStatus({
                text,
                entities,
                extendedEntities,
                showImagePreviewRequest: (payload) => dispatch(commonActions.showImagePreviewRequest(payload)),
                quotedStatusPermalink: quoted_status_permalink ? quoted_status_permalink.expanded : null,
              });
              return {
                authorAvatar: profile_image_url_https,
                authorName: screenName,
                text: displayedText,
                media: files,
                date: moment(created_at),
                linkURL: getTwitterStatusURL({ screenName, statusId: thirdPartyTwitterStatusId }),
              };
            }
            return {};
          })();

          if (isOriginalThirdPartyTweet) {
            components.push(
              <SocialMediaPostBubble
                key={`3rd_party_tweet_original_${statusId}`}
                isOwn={false}
                avatar={twitterAvatar}
                collapsedMessage={intl.formatMessage({
                  id: 'desk.conversation.twitter.message.collapsedMessage.byOtherPeople',
                })}
                isExpanded={expandedThirdPartyTwitterStatusIndexes.includes(index)}
                isFetching={fetchingThirdPartyTwitterStatusIds.includes(statusId)}
                onToggleExpandButtonClick={toggleExpandTwitterStatus(statusId, index)}
                {...tweetInformationProps}
              />,
            );
          } else {
            if (inReplyToStatusId && isInReplyToStatusVisible) {
              components.push(
                <SocialMediaPostBubble
                  key={`3rd_party_tweet_${inReplyToStatusId}_${statusId}`}
                  isOwn={false}
                  avatar={twitterAvatar}
                  collapsedMessage={intl.formatMessage({
                    id: 'desk.conversation.twitter.message.collapsedMessage.byOtherPeople',
                  })}
                  isExpanded={expandedThirdPartyTwitterStatusIndexes.includes(index)}
                  isFetching={fetchingThirdPartyTwitterStatusIds.includes(inReplyToStatusId)}
                  onToggleExpandButtonClick={toggleExpandTwitterStatus(inReplyToStatusId, index)}
                  {...tweetInformationProps}
                />,
              );
            }

            components.push(
              <TwitterStatus
                ref={isFirstMessage ? (firstMessageNode as any) : null}
                key={`twitter_status_${statusId}`}
                origin={origin}
                options={generateTwitterStatusOptions({
                  previousMessage: prevMessage && { ...prevMessage, timestamp: moment(prevMessage.createdAt) },
                  message: { ...message, timestamp: moment(message.createdAt) },
                  nextMessage: nextMessage && { ...nextMessage, timestamp: moment(nextMessage.createdAt) },
                })}
                ticketInfo={{ twitterUser, customer, lastSeenAt }}
                message={message}
                messageRenderMode={messageRenderMode}
                onReplyActionClick={onTwitterStatusReplyActionClick}
                showAsSocialMediaPost={isOriginalTweet}
              />,
            );
          }

          return components;
        }, []);
    }, [
      channelType,
      customer,
      dispatch,
      expandedThirdPartyTwitterStatusIndexes,
      fetchingThirdPartyTwitterStatusIds,
      handleFeedAction,
      intl,
      lastSeenAt,
      messageRenderMode,
      messages,
      origin,
      originalTweetStatusId,
      thirdPartyTwitterStatuses,
      ticket,
      toggleExpandTwitterStatus,
      twitterUser,
    ]);

    const renderedInstagramCommentMessages = useMemo(() => {
      if (channelType !== 'INSTAGRAM_COMMENT' || !instagramUser) {
        return [];
      }
      const instagramComments = messages as InstagramCommentTicket[];
      return instagramComments.reduce<React.ReactElement[]>((components, instagramCommentTicket, index, items) => {
        const { instagramComment, instagramMedia } = instagramCommentTicket;
        const prevMessage = index > 0 ? items[index - 1].instagramComment : undefined;
        const nextMessage = index < items.length - 1 ? items[index + 1].instagramComment : undefined;

        const isFirstMessage = !prevMessage && index === 0 && instagramComment.timestamp;
        const isNextOrPrevDate =
          prevMessage &&
          prevMessage.timestamp &&
          instagramComment.timestamp &&
          shouldRenderDateLine({
            previousDate: prevMessage.timestamp,
            nextDate: instagramComment.timestamp,
          });
        if (isFirstMessage || isNextOrPrevDate) {
          components.push(<ChatDateLine key={`messageDateLine_${index}`} createdAt={instagramComment.timestamp} />);
        }

        if (instagramMedia) {
          const media: (ImageFile | VideoFile)[] = [{ type: 'image', url: instagramMedia.mediaUrl }] as ImageFile[];
          if (instagramMedia.mediaType === 'VIDEO') {
            media[0] = {
              type: 'video',
              url: instagramMedia.mediaUrl,
            } as VideoFile;
          }
          components.push(
            <SocialMediaPostBubble
              key={instagramMedia.igMediaId}
              isOwn={true}
              avatar={{
                type: DeskAvatarType.Agent,
                imageUrl: instagramUser.profilePictureUrl,
                profileID: instagramUser.username,
              }}
              authorAvatar={instagramUser.profilePictureUrl}
              authorName={instagramUser.username}
              date={moment(instagramMedia.createdAt)}
              linkURL={`https://www.instagram.com/p/${instagramMedia.shortcode}/`}
              media={media}
              text={instagramMedia.caption}
              isExpanded={true}
            />,
          );
        }

        components.push(
          <InstagramCommentMessage
            ref={isFirstMessage ? firstMessageNode : null}
            key={`instagram_comment_message${instagramComment.igCommentId}`}
            origin={origin}
            options={generateMessageOptions({
              previousMessage: prevMessage && { ...prevMessage, timestamp: moment(prevMessage.createdAt) },
              message: { ...instagramComment, timestamp: moment(instagramComment.createdAt) },
              nextMessage: nextMessage && { ...nextMessage, timestamp: moment(nextMessage.createdAt) },
            })}
            message={instagramCommentTicket}
            ticketInfo={{ instagramUser, customer, lastSeenAt }}
            messageRenderMode={messageRenderMode}
            handleFeedAction={handleFeedAction!}
          />,
        );

        return components;
      }, []);
    }, [channelType, customer, instagramUser, lastSeenAt, messageRenderMode, messages, origin, handleFeedAction]);

    const renderWhatsAppMessages = useMemo(() => {
      if (channelType !== 'WHATSAPP_MESSAGE' || nexmoAccount == null) {
        return [];
      }
      const WAMessages = messages as WhatsAppMessageType[];

      return WAMessages.reduce<React.ReactElement[]>((components, message, index, items) => {
        const prevMessage = index > 0 ? items[index - 1] : undefined;
        const isFirstMessage = index === 0 && message.timestamp;
        if (
          isFirstMessage ||
          (prevMessage?.timestamp &&
            message.timestamp &&
            shouldRenderDateLine({ previousDate: prevMessage.timestamp, nextDate: message.timestamp }))
        ) {
          components.push(<ChatDateLine key={`messageDateLine_${index}`} createdAt={message.timestamp} />);
        }

        components.push(
          <WhatsAppMessage
            ref={isFirstMessage ? firstMessageNode : null}
            key={message.id}
            message={message}
            ticketInfo={{ nexmoAccount: ticket.nexmoAccount }}
          />,
        );

        return components;
      }, []);
    }, [channelType, messages, nexmoAccount, ticket.nexmoAccount]);

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
                <ScrollBar
                  ref={scrollBarRefCallback}
                  style={style}
                  onScroll={handleScroll}
                  options={{ suppressScrollX: true }}
                >
                  <ChatThreadMessagesContainer>
                    <ChatBubblesContainer data-test-id="ChatBubblesContainer">
                      {renderedTwitterStatusMessages}
                      {renderedFacebookFeedMessages}
                      {renderedFacebookPageMessages}
                      {renderedTwitterDirectMessageEventMessages}
                      {renderedInstagramCommentMessages}
                      {renderWhatsAppMessages}
                    </ChatBubblesContainer>
                  </ChatThreadMessagesContainer>
                </ScrollBar>
              );
            }}
          </ChatBubblesScrollBarRefContext.Consumer>
        )}
      </DeskChatLayoutContext.Consumer>
    );
  },
);
