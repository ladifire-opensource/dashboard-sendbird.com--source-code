import { ReactElement, forwardRef, ReactNode, useEffect, useRef, useMemo, useContext } from 'react';
import { useDispatch } from 'react-redux';

import styled from 'styled-components';

import startOfDay from 'date-fns/startOfDay';
import { cssVariables } from 'feather';
import moment from 'moment-timezone';

import { coreActions } from '@actions';
import { useAuthorization, usePrevious, useTypedSelector } from '@hooks';
import { SpinnerFull } from '@ui/components';
import { isEmpty, shouldRenderDateLine } from '@utils';

import { ChatInput } from '../../ChatInput';
import DateLine from '../../components/DateLine';
import ScrollToBottomButton from '../../components/ScrollToBottomButton';
import { BaseMessage, BaseMessageType } from '../../message/baseMessage';
import { ChannelFrozenStatusBar } from '../../openChannels/ChannelFrozenStatusBar';
import MessagesContext from '../MessagesContext';
import useGetMessageMenus from '../hooks/useGetMessageMenus';
import useScrollLock from '../hooks/useScrollLock';
import { useSendMessagesWithCache, useScrollToBottom, useMessageActions } from './utils';

type Props = {
  channel: GroupChannel;
  messageId?: number;
  isLoadingSdkChannel: boolean;
  sdkChannel?: SendBird.GroupChannel;
  onMessageDeleteSuccess?: (messageId: BaseMessageType['messageId']) => void;
  onMessageEditSuccess?: (message: BaseMessageType) => void;
  didScrollToBottomToRecentMessage: boolean;
};

const ScrollElementWrapper = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
`;

const ScrollElement = styled.div`
  height: 100%;
  overflow-y: auto;
`;

const ScrollElementStart = styled.div``;
const ScrollElementEnd = styled.div`
  position: relative;
  margin-bottom: 16px;

  > div {
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: -1;
    height: 100px;
  }
`;

const StyledChatInput = styled(ChatInput)`
  margin: 16px;
  margin-top: 0;
  flex: none;
`;

const PreviousChatTimeLine = forwardRef<HTMLDivElement, { children: ReactNode }>(({ children }, ref) => (
  <div
    ref={ref}
    css={`
      text-align: center;
      background: linear-gradient(${cssVariables('neutral-3')} 1px, transparent 0);
      background-size: 100% 50%;
      background-position: 0 100%;
      background-repeat: repeat-x;
      margin: 16px;
    `}
  >
    <span
      css={`
        background: white;
        padding: 4px 8px;
        line-height: 16px;
        white-space: nowrap;
        color: ${cssVariables('neutral-6')};
        font-size: 12px;
        font-weight: 600;
      `}
    >
      {children}
    </span>
  </div>
));

const GroupChannelMessages = forwardRef<HTMLDivElement, Props>(
  (
    {
      channel,
      messageId: pathParamMessageId,
      isLoadingSdkChannel,
      sdkChannel,
      onMessageDeleteSuccess,
      onMessageEditSuccess,
      didScrollToBottomToRecentMessage,
    },
    ref,
  ) => {
    const { channel_url: channelUrl } = channel;

    const isConnected = useTypedSelector((state) => state.sendbird.isConnected);
    const dispatch = useDispatch();
    const { isPermitted } = useAuthorization();
    const [didScrollUp, setDidScrollUp] = useScrollLock();

    const getMessageMenus = useGetMessageMenus();

    const scrollBarRef = useRef<HTMLDivElement | null>(null);
    const focusedMessageElementRef = useRef<HTMLElement | null>(null);
    const previousChatTimeLineRef = useRef<HTMLDivElement>(null);
    const restoreScrollPositionRef = useRef<() => void>();

    const { scrollToBottom, scrollToBottomWithSetTimeout } = useScrollToBottom(scrollBarRef);

    const {
      state: {
        messages,
        status,
        requestParams,
        previousMessagesRequest,
        nextMessagesRequest,
        nextMessagesRequestParams,
        hasNextMessages,
      },
      actions: { fetchLatestMessages, fetchNextMessages, fetchPreviousMessages },
    } = useContext(MessagesContext);

    useEffect(() => {
      dispatch(coreActions.fetchModeratorInfoADMMRequest());
    }, [dispatch]);

    const scrollToElement = (element: HTMLElement | null) => {
      if (!element || !scrollBarRef.current) {
        return;
      }

      const { offsetTop, offsetHeight } = element;
      const scrollTop = offsetTop - scrollBarRef.current.clientHeight / 2 + offsetHeight / 2;
      scrollBarRef.current.scrollTo(0, scrollTop);
    };

    const canChat = isPermitted(['application.channels.groupChannel.all', 'application.channels.groupChannel.chat']);

    /**
     * The initial scroll position will be inaccurate if the height of the scrollable element changes when the chat input
     * appears. So we need to wait until the visibility of the chat input is determined, then render the scrollable
     * element and set the scroll position.
     */
    const isReadyToRenderScrollElement = !canChat || !isLoadingSdkChannel;

    useEffect(() => {
      if (isReadyToRenderScrollElement && status === 'success' && scrollBarRef.current) {
        if (requestParams?.timestamp) {
          scrollToElement(previousChatTimeLineRef.current);
        } else if (requestParams?.messageId) {
          scrollToElement(focusedMessageElementRef.current);
        } else if (scrollBarRef.current) {
          scrollToBottomWithSetTimeout();
        }
      }
    }, [
      isReadyToRenderScrollElement,
      requestParams?.messageId,
      requestParams?.timestamp,
      status,
      scrollToBottomWithSetTimeout,
      setDidScrollUp,
    ]);

    useEffect(() => {
      if (previousMessagesRequest.status === 'success' && restoreScrollPositionRef.current) {
        restoreScrollPositionRef.current();
        restoreScrollPositionRef.current = undefined;
      }
    }, [previousMessagesRequest.status]);

    const previousMessageLength = usePrevious(messages.length) ?? 0;
    const isMessagesAdded = messages.length > previousMessageLength;

    const shouldScrollToBottomWhenMessagesAdded = !didScrollUp && (nextMessagesRequestParams?.isAutoScrolling ?? false);

    useEffect(() => {
      if (isMessagesAdded && shouldScrollToBottomWhenMessagesAdded) {
        scrollToBottom();
      }
    }, [isMessagesAdded, nextMessagesRequest.status, scrollToBottom, shouldScrollToBottomWhenMessagesAdded]);

    const { editMessage, deleteMessage, showDataInformation, copyUrl } = useMessageActions({
      channelUrl,
      onMessageDeleteSuccess,
      onMessageEditSuccess,
    });

    const {
      sentMessages,
      actions: { sendUserMessage, sendAdminMessage, sendFileMessage },
    } = useSendMessagesWithCache({
      messages,
      onSendSuccess: () => {
        fetchNextMessages({ isAutoScrolling: true });
        setDidScrollUp(false);
      },
    });

    const renderedMessages = useMemo(() => {
      const previousChatTime = requestParams?.timestamp;

      let previousMessage;
      const nodeArray: ReactNode[] = [];
      [...messages, ...sentMessages]
        .filter((message) => !isEmpty(message))
        .forEach((message, index) => {
          const { createdAt: currentMessageCreatedAt, messageId: currentMessageId } = message;
          const dateline =
            !previousMessage ||
            shouldRenderDateLine({
              previousDate: previousMessage.createdAt,
              nextDate: currentMessageCreatedAt,
            })
              ? {
                  timestamp: startOfDay(currentMessageCreatedAt),
                  element: <DateLine key={`dateline_${index}`} timestamp={currentMessageCreatedAt} />,
                }
              : null;

          const previousChatTimeline =
            typeof previousChatTime === 'number' &&
            (previousMessage?.created_at ?? 0) < previousChatTime &&
            previousChatTime <= currentMessageCreatedAt
              ? {
                  timestamp: previousChatTime,
                  element: (
                    <PreviousChatTimeLine ref={previousChatTimeLineRef} key={`previousChatTimeLine_${index}`}>
                      {moment(previousChatTime).format('lll')}
                    </PreviousChatTimeLine>
                  ),
                }
              : null;

          nodeArray.push(
            ...[dateline, previousChatTimeline]
              .filter((v): v is { element: ReactElement; timestamp: number } => !!v)
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((item) => item.element),
          );

          nodeArray.push(
            <BaseMessage
              key={`group_channel_message_${currentMessageId}`}
              isEditable={isPermitted(['application.channels.groupChannel.all'])}
              message={message}
              isFocused={pathParamMessageId === currentMessageId}
              deleteMessage={deleteMessage}
              editMessage={editMessage}
              copyUrl={copyUrl}
              showDataInformation={showDataInformation}
              onRefAttached={(node) => {
                if (pathParamMessageId === currentMessageId) {
                  focusedMessageElementRef.current = node;
                }
              }}
              messageMenus={getMessageMenus(message)}
            />,
          );

          previousMessage = message;
        });

      return nodeArray;
    }, [
      requestParams?.timestamp,
      messages,
      sentMessages,
      isPermitted,
      pathParamMessageId,
      deleteMessage,
      editMessage,
      copyUrl,
      showDataInformation,
      getMessageMenus,
    ]);

    const intersectionObserverRefs = useRef<{
      scrollLocker?: IntersectionObserver;
      scrollUnlocker?: IntersectionObserver;
      previousMessageFetcher?: IntersectionObserver;
      scrollElementStart?: HTMLElement;
      scrollElementEnd?: HTMLElement;
    }>({});

    // Track intersection ratios to determine the scroll direction.
    const previousIntersectionRatioRefs = useRef<{ previousMessageFetcher?: number; scrollLocker?: number }>({});

    const updateIntersectionObservers = (root: HTMLDivElement | null) => {
      if (!root) {
        return;
      }

      /**
       * `scrollLocker` and `scrollUnlocker` observes the same element `ScrollElementEnd`, but their thresholds are
       * different.
       *
       * When `ScrollElementEnd` is completely hidden, that is, when the top edge of `ScrollElementEnd` hits the bottom
       * edge of the scrollable element, scrollLock will be set true.
       *
       * When the scrollable element is scrolled to the end and the bottom edge of `ScrollElementEnd` hits the bottom
       * edge of the scrollable element, scrollLock will be set false.
       */
      const scrollLocker = new IntersectionObserver(
        ([entry]) => {
          if (
            previousIntersectionRatioRefs.current.scrollLocker === 0 &&
            entry.intersectionRatio > 0 &&
            entry.intersectionRatio < 1 // to avoid triggering after the page has been loaded
          ) {
            fetchNextMessages({ isAutoScrolling: !hasNextMessages });
          }

          if (previousIntersectionRatioRefs.current.scrollLocker === 1 && entry.intersectionRatio === 0) {
            setDidScrollUp(true);
          }
          previousIntersectionRatioRefs.current.scrollLocker = entry.intersectionRatio;
        },
        { root, threshold: 0 },
      );

      const scrollUnlocker = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setDidScrollUp(false);
          }
        },
        { root, threshold: 1 },
      );

      const previousMessageFetcher = new IntersectionObserver(
        ([entry]) => {
          if (previousIntersectionRatioRefs.current.previousMessageFetcher === 0 && entry.intersectionRatio === 1) {
            const currentScrollHeight = root.scrollHeight;

            restoreScrollPositionRef.current = () => {
              root.scrollTo({ top: root.scrollHeight - currentScrollHeight });
            };

            const { firstMessageId } = (entry.target as HTMLElement).dataset;
            if (firstMessageId) {
              fetchPreviousMessages(Number(firstMessageId));
            }
          }
          previousIntersectionRatioRefs.current.previousMessageFetcher = entry.intersectionRatio;
        },
        { root, rootMargin: '100px', threshold: [0, 1] },
      );

      intersectionObserverRefs.current.scrollLocker?.disconnect();
      intersectionObserverRefs.current.scrollUnlocker?.disconnect();
      intersectionObserverRefs.current.previousMessageFetcher?.disconnect();

      if (intersectionObserverRefs.current.scrollElementStart) {
        previousMessageFetcher.observe(intersectionObserverRefs.current.scrollElementStart);
      }

      if (intersectionObserverRefs.current.scrollElementEnd) {
        scrollLocker.observe(intersectionObserverRefs.current.scrollElementEnd);
        scrollUnlocker.observe(intersectionObserverRefs.current.scrollElementEnd);
      }

      intersectionObserverRefs.current = {
        ...intersectionObserverRefs.current,
        scrollLocker,
        scrollUnlocker,
        previousMessageFetcher,
      };
    };

    if (!isReadyToRenderScrollElement) {
      return (
        <ScrollElementWrapper>
          <SpinnerFull /> {/* may be better with a skeleton */}
        </ScrollElementWrapper>
      );
    }

    return (
      <>
        <ScrollElementWrapper>
          {channel.freeze && <ChannelFrozenStatusBar />}
          <ScrollElement
            ref={(node) => {
              // forward ref
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }

              if (node !== scrollBarRef.current) {
                // If ref value changes, we need to update the intersection observer.
                scrollBarRef.current = node;
                updateIntersectionObservers(node);
              }
            }}
            data-test-id="GroupChannelMessagesScrollElement"
          >
            {messages.length > 0 && previousMessagesRequest.status !== 'loading' && (
              <ScrollElementStart
                data-test-id="ScrollElementStart"
                data-first-message-id={messages[0].messageId}
                ref={(node) => {
                  if (node) {
                    intersectionObserverRefs.current.scrollElementStart = node;
                    intersectionObserverRefs.current.previousMessageFetcher?.observe(node);
                    previousIntersectionRatioRefs.current.previousMessageFetcher = undefined;
                  }
                }}
              />
            )}
            {renderedMessages}
            {messages.length > 0 && (
              <ScrollElementEnd>
                <div
                  ref={(node) => {
                    if (node) {
                      intersectionObserverRefs.current.scrollElementEnd = node;
                      intersectionObserverRefs.current.scrollLocker?.observe(node);
                      intersectionObserverRefs.current.scrollUnlocker?.observe(node);
                      previousIntersectionRatioRefs.current.scrollLocker = undefined;
                    }
                  }}
                />
              </ScrollElementEnd>
            )}
          </ScrollElement>
          {!didScrollToBottomToRecentMessage && <ScrollToBottomButton onClick={fetchLatestMessages} />}
        </ScrollElementWrapper>
        {canChat && (
          <StyledChatInput
            channelType="group_channels"
            isUserMessageDisabled={sdkChannel?.myMemberState !== 'joined'}
            isDisabled={!isConnected}
            onSubmit={({ inputOption, message, sendPush = false }) => {
              switch (inputOption) {
                case 'user':
                  if (sdkChannel) {
                    sendUserMessage({ message, channel: sdkChannel });
                  }
                  return;
                case 'admin':
                  sendAdminMessage({ message, channelUrl, sendPush });
                  return;
                default:
                  return;
              }
            }}
            sendFileMessage={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (sdkChannel && file) {
                sendFileMessage({ file, channel: sdkChannel });
              }
            }}
          />
        )}
      </>
    );
  },
);

export default GroupChannelMessages;
