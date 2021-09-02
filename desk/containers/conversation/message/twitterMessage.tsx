import { forwardRef, useState, useCallback, useMemo, useContext } from 'react';
import { useIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';

import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DeskMessageRenderMode } from '@constants';
import { fetchTwitterUserMedia } from '@desk/api';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import {
  CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as adjacentComponentWidth,
  CHAT_BUBBLE_HORIZONTAL_SPACING as bubbleHorizontalSpacing,
} from '@desk/components/chatBubble/chatBubbleRenderer';
import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';
import useProjectIdAndRegion from '@desk/hooks/useProjectIdAndRegion';
import { convertURLsAndEmailsToLinks } from '@utils';

import { SystemMessage } from './systemMessage';
import { useTwitterMessageSenderInfo } from './useTwitterMessageSenderInfo';

const mapStateToProps = (state: RootState) => ({
  customerTwitterUser: state.twitter.twitterUser,
});

type Props = {
  origin: DeskOrigin;
  options: {
    hideSender: boolean;
    hideProfile: boolean;
  };
  messageRenderMode?: DeskMessageRenderMode;
  message: AttachmentParsedTwitterDirectMessageEvent;
  ticketInfo: Pick<TwitterTicket, 'customer' | 'twitterUser' | 'lastSeenAt'>;
  onDeleteActionClick: () => void;
} & ReturnType<typeof mapStateToProps>;

export const TwitterMessageConnectable = forwardRef<HTMLDivElement, Props>(
  (
    { options, origin, ticketInfo, message, messageRenderMode = 'default', customerTwitterUser, onDeleteActionClick },
    ref,
  ) => {
    const intl = useIntl();
    const { pid, region } = useProjectIdAndRegion();
    const dispatch = useDispatch();
    const { customer, twitterUser, lastSeenAt: ticketLastSeenAt } = ticketInfo;
    const [attachmentImageFetchRequest, setAttachmentImageFetchRequest] = useState<{
      isFetching: boolean;
      imageURL?: string;
      failed: boolean;
    }>({ isFetching: false, failed: false });

    const fetchAttachment = useCallback(
      async (mediaUrl: string) => {
        if (attachmentImageFetchRequest.isFetching) {
          return;
        }
        setAttachmentImageFetchRequest((state) => ({ ...state, isFetching: true }));
        const { data } = await fetchTwitterUserMedia(pid, region, { id: twitterUser.id, mediaUrl });
        const imageURL = data.s3_media_url;
        setAttachmentImageFetchRequest({ imageURL, isFetching: false, failed: false });
        return imageURL;
      },
      [attachmentImageFetchRequest.isFetching, pid, region, twitterUser.id],
    );

    const onAttachmentPhotoClick = useCallback(async () => {
      if (attachmentImageFetchRequest.imageURL) {
        dispatch(commonActions.showImagePreviewRequest([{ name: '', url: attachmentImageFetchRequest.imageURL }]));
        return;
      }
    }, [attachmentImageFetchRequest.imageURL, dispatch]);

    const { id, agent, attachment, text, senderId, timestamp, status, messageType, isTemp } = message;
    const isOwn = senderId === twitterUser.userId;
    const senderAgentName = agent ? agent.displayName : undefined;

    const { senderName, twitterScreenName, avatar } = useTwitterMessageSenderInfo({
      agent,
      customer,
      customerTwitterUser,
      isOwn,
      twitterUser,
    });

    const isDeleted = status === 'remove';

    const statusText = useMemo(() => {
      if (isDeleted) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.status.deleted' });
      }
      if (!isTemp && isOwn && senderAgentName) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.status.sentBy' }, { senderName: senderAgentName });
      }
      return undefined;
    }, [intl, isDeleted, isOwn, isTemp, senderAgentName]);

    const actions = useMemo(() => {
      const isActionVisible = messageRenderMode !== 'compact' && origin === 'conversation' && !isDeleted;
      if (isActionVisible) {
        return [
          {
            label: intl.formatMessage({ id: 'desk.conversation.twitter.message.actions.delete' }),
            onClick: onDeleteActionClick,
          },
        ];
      }
      return [];
    }, [intl, isDeleted, messageRenderMode, onDeleteActionClick, origin]);

    const deliveryStatus = useMemo(() => {
      const isDeliveryStatusVisible = isOwn && messageRenderMode !== 'compact' && origin === 'conversation';
      if (!isDeliveryStatusVisible) {
        return undefined;
      }
      if (message.isTemp) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.deliveryStatus.sending' }) as 'sending';
      }
      if (ticketLastSeenAt >= timestamp) {
        return intl.formatMessage({ id: 'desk.conversation.twitter.deliveryStatus.read' }) as 'read';
      }
      return intl.formatMessage({ id: 'desk.conversation.twitter.deliveryStatus.sent' }) as 'sent';
    }, [isOwn, messageRenderMode, origin, message.isTemp, ticketLastSeenAt, timestamp, intl]);

    const [displayedText, files] = useMemo(() => {
      if (!attachment) {
        return [text, undefined];
      }
      let displayedText = text;
      const { type, indices } = attachment.media;
      const [mediaStartIndex, mediaEndIndex] = indices;
      displayedText = text.substring(0, mediaStartIndex).concat(text.substring(mediaEndIndex)).trim();

      switch (type) {
        case 'photo': {
          const {
            media_url_https,
            sizes: {
              medium: { w: width, h: height },
            },
          } = attachment.media;
          const { isFetching, imageURL, failed } = attachmentImageFetchRequest;

          let fetchStatus: 'fetching' | 'failed' | undefined;
          if (isFetching) {
            fetchStatus = 'fetching';
          } else if (failed) {
            fetchStatus = 'failed';
          }

          if (!imageURL && !failed) {
            fetchAttachment(media_url_https).catch(() => {
              setAttachmentImageFetchRequest((state) => ({ ...state, isFetching: false, failed: true }));
            });
          }

          return [
            displayedText,
            [
              {
                type: 'image' as const,
                url: imageURL || '',
                dimension: { width, height },
                onClick: () => onAttachmentPhotoClick(),
                fetchStatus,
              },
            ],
          ];
        }

        case 'animated_gif':
        case 'video': {
          const {
            video_info: { aspect_ratio, variants },
          } = attachment.media as TwitterMediaVideoObject;
          const [x, y] = aspect_ratio;

          // The browser will use the first source it understands. We want the variant with the highest bitrate to be used if possible.
          const sortedByBitrateDescVariants = [...variants]
            .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
            .map(({ content_type: contentType, ...variant }) => ({ ...variant, contentType }));

          return [
            displayedText,
            [
              {
                type: type === 'animated_gif' ? ('twitter-gif' as const) : ('video' as const),
                aspectRatio: { x, y },
                sources: sortedByBitrateDescVariants,
              },
            ],
          ];
        }

        default:
          return [text, undefined];
      }
    }, [attachment, attachmentImageFetchRequest, fetchAttachment, onAttachmentPhotoClick, text]);

    const getChatBubbleMaxWidth = useContext(ChatBubbleMaxWidthGetterContext);
    const chatBubbleMaxWidth = getChatBubbleMaxWidth({ adjacentComponentWidth, bubbleHorizontalSpacing });
    const mediaMaxSize = chatBubbleMaxWidth ? Math.min(360, chatBubbleMaxWidth) : undefined;

    if (!message.text) {
      return null;
    }

    if (messageType === 'system') {
      return (
        <SystemMessage ref={ref} date={timestamp}>
          {convertURLsAndEmailsToLinks(message.text)}
        </SystemMessage>
      );
    }

    return (
      <ChatBubble
        ref={ref}
        messageId={id}
        isOwn={isOwn}
        senderName={senderName || undefined}
        twitterScreenName={twitterScreenName || undefined}
        avatar={avatar}
        isSenderHidden={options.hideSender}
        isAvatarHidden={options.hideProfile}
        isStatusHidden={options.hideProfile}
        message={convertURLsAndEmailsToLinks(displayedText.trim())}
        date={moment(timestamp)}
        isDeleted={isDeleted}
        status={statusText}
        actions={actions}
        files={files}
        deliveryStatus={deliveryStatus}
        mediaMaxSize={mediaMaxSize}
      />
    );
  },
);

export const TwitterMessage = connect(mapStateToProps)(TwitterMessageConnectable);
