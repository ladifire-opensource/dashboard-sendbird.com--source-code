import React, { useMemo, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import capitalize from 'lodash/capitalize';
import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DeskAvatarType, DeskMessageRenderMode } from '@constants';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import SocialMediaPostBubble from '@desk/components/chatBubble/SocialMediaPostBubble';
import {
  CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as adjacentComponentWidth,
  CHAT_BUBBLE_HORIZONTAL_SPACING as bubbleHorizontalSpacing,
} from '@desk/components/chatBubble/chatBubbleRenderer';
import { ImageFile, VideoFile } from '@desk/components/chatBubble/fileInterfaces';
import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';
import { convertURLsAndEmailsToLinks } from '@utils';
import { logException } from '@utils/logException';

import { convertAttachmentToFile } from './convertFacebookAttachmentToFile';
import { SystemMessage } from './systemMessage';

type Reactions = {
  reactionCounts: {
    [key: string]: number;
  };
  pageReactions: string[];
};

type Props = {
  origin: DeskOrigin;
  options: { hideSender: boolean; hideProfile: boolean };
  message: FacebookFeedType;
  ticketInfo: Pick<FacebookTicket, 'facebookPage' | 'customer' | 'data'>;
  messageRenderMode?: DeskMessageRenderMode;
  handleFeedAction: ({ message, action }) => void;
};

export const FacebookFeed = React.forwardRef<HTMLDivElement, Props>(
  ({ ticketInfo, options, origin, message: messageProp, messageRenderMode, handleFeedAction }, ref) => {
    const {
      id,
      feedId,
      feedType,
      message,
      messageType,
      fromId,
      attachments: attachmentsString,
      status,
      timestamp,
      isTemp,
      agent,
      reactions: reactionsString,
      parentId,
    } = messageProp;
    const intl = useIntl();
    const dispatch = useDispatch();
    const { facebookPage, customer, data: dataString } = ticketInfo;
    const isOwn = facebookPage.pageId === fromId;
    const currentCustomerId = customer.sendbirdId.split('//')[1];
    const senderName = (() => {
      if (isOwn) {
        return facebookPage.name;
      }
      return currentCustomerId === fromId
        ? customer.displayName
        : intl.formatMessage({ id: 'desk.conversation.facebook.senderName.otherCustomer' });
    })();
    const senderAgentName = agent ? agent.displayName : undefined;

    const avatar = isOwn
      ? { type: DeskAvatarType.Agent, imageUrl: facebookPage.picture.url, profileID: agent?.email ?? senderName }
      : { type: DeskAvatarType.Customer, imageUrl: customer.photoThumbnailUrl || undefined, profileID: senderName };

    const isDeleted = status === 'remove';
    const isHidden = status === 'hide';
    const statusText = useMemo(() => {
      if (isDeleted) {
        // removed is superior to other status
        return intl.formatMessage({ id: 'desk.conversation.facebook.status.removed' });
      }
      if (isHidden) {
        return intl.formatMessage({ id: 'desk.conversation.facebook.status.hidden' });
      }
      if (!isTemp && isOwn && senderAgentName) {
        return intl.formatMessage(
          { id: 'desk.conversation.facebook.status.sentBy' },
          { senderName: senderAgentName, facebookPageName: facebookPage.name },
        );
      }
      return undefined;
    }, [isDeleted, isHidden, isTemp, isOwn, senderAgentName, intl, facebookPage.name]);

    const { reactions, isLiked } = useMemo(() => {
      if (!reactionsString) {
        return { reactions: undefined, isLiked: false };
      }
      try {
        const parsedReactions: Reactions = JSON.parse(reactionsString);
        const isLiked = parsedReactions.pageReactions.includes('LIKE');
        const reactionList = Object.entries(parsedReactions.reactionCounts);

        if (reactionList.length > 0) {
          return {
            reactions: [
              {
                icon: 'reactions' as const,
                count: Object.values(parsedReactions.reactionCounts).reduce((acc, cur) => acc + cur, 0),
                tooltipContent: reactionList.map(([key, value], index) => (
                  <React.Fragment key={key}>
                    {capitalize(key)}: {value}
                    {index < reactionList.length - 1 && <br />}
                  </React.Fragment>
                )),
                participated: isLiked,
              },
            ],
            isLiked,
          };
        }
        return { reactions: undefined, isLiked };
      } catch {
        return { reactions: undefined, isLiked: false };
      }
    }, [reactionsString]);

    const socialLinkURL = (() => {
      if (feedType === 'post') {
        const postId = feedId.split('_')[1];

        return `https://facebook.com/${facebookPage.pageId}/posts/${postId}`;
      }
      const [postId, commentId] = feedId.split('_');

      return `https://facebook.com/${facebookPage.pageId}/posts/${postId}?comment_id=${commentId}`;
    })();

    const files = useMemo(() => {
      if (!attachmentsString) {
        return undefined;
      }

      const showImagePreview = (url: string) => dispatch(commonActions.showImagePreviewRequest([{ name: '', url }]));
      const attachments = JSON.parse(attachmentsString);
      return attachments.map((attachment) => convertAttachmentToFile(attachment, showImagePreview));
    }, [attachmentsString, dispatch]);

    const actions = React.useMemo(() => {
      const isActionsVisible = messageRenderMode !== 'compact' && origin === 'conversation' && status !== 'remove';
      if (!isActionsVisible) {
        return undefined;
      }
      let data;
      try {
        data = JSON.parse(dataString);
      } catch (error) {
        logException({ error, context: { dataString } });
      }

      const actions: { label: string; onClick: () => void }[] = [];
      if (!isOwn && parentId === data.social.postId) {
        actions.push({
          label: intl.formatMessage({ id: 'desk.conversation.facebook.action.reply' }),
          onClick: () => handleFeedAction({ message: messageProp, action: 'REPLY' }),
        });
      }

      if (isLiked) {
        actions.push({
          label: intl.formatMessage({ id: 'desk.conversation.facebook.action.unlike' }),
          onClick: () => handleFeedAction({ message: messageProp, action: 'UNLIKE' }),
        });
      } else {
        actions.push({
          label: intl.formatMessage({ id: 'desk.conversation.facebook.action.like' }),
          onClick: () => handleFeedAction({ message: messageProp, action: 'LIKE' }),
        });
      }
      if (!isOwn) {
        if (status === 'hide') {
          actions.push({
            label: intl.formatMessage({ id: 'desk.conversation.facebook.action.unhide' }),
            onClick: () => handleFeedAction({ message: messageProp, action: 'UNHIDE' }),
          });
        } else {
          actions.push({
            label: intl.formatMessage({ id: 'desk.conversation.facebook.action.hide' }),
            onClick: () => handleFeedAction({ message: messageProp, action: 'HIDE' }),
          });
        }
      }
      actions.push({
        label: intl.formatMessage({ id: 'desk.conversation.facebook.action.remove' }),
        onClick: () => handleFeedAction({ message: messageProp, action: 'REMOVE' }),
      });
      return actions;
    }, [messageRenderMode, origin, status, isOwn, parentId, isLiked, intl, dataString, handleFeedAction, messageProp]);

    const getChatBubbleMaxWidth = useContext(ChatBubbleMaxWidthGetterContext);
    const chatBubbleMaxWidth = getChatBubbleMaxWidth({ adjacentComponentWidth, bubbleHorizontalSpacing });
    const mediaMaxSize = chatBubbleMaxWidth ? Math.min(360, chatBubbleMaxWidth) : undefined;

    const isOriginalPost = facebookPage.pageId === fromId && feedType === 'post';
    if (isOriginalPost) {
      const media = (() => {
        if (!attachmentsString) {
          return undefined;
        }
        const attachments: any[] = JSON.parse(attachmentsString);
        return attachments
          .map((attachment) => convertAttachmentToFile(attachment))
          .filter((file) => file && ['image', 'video'].includes(file.type));
      })();

      return (
        <SocialMediaPostBubble
          ref={ref}
          isOwn={isOwn}
          avatar={avatar}
          authorName={senderName}
          authorAvatar={avatar.imageUrl}
          date={moment(timestamp)}
          text={message}
          linkURL={socialLinkURL}
          media={media as (ImageFile | VideoFile)[]}
          maxWidth={chatBubbleMaxWidth}
        />
      );
    }

    if (messageType === 'system') {
      return (
        <SystemMessage ref={ref} date={timestamp}>
          {convertURLsAndEmailsToLinks(message)}
        </SystemMessage>
      );
    }

    return (
      <ChatBubble
        ref={ref}
        messageId={id}
        isOwn={isOwn}
        senderName={senderName || undefined}
        avatar={avatar}
        isSenderHidden={options.hideSender}
        isAvatarHidden={options.hideProfile}
        isStatusHidden={options.hideProfile && reactions === undefined}
        message={convertURLsAndEmailsToLinks(message)}
        date={moment(timestamp)}
        isDeleted={isDeleted}
        status={statusText}
        files={files}
        mediaMaxSize={mediaMaxSize}
        socialMediaLink={socialLinkURL ? { type: 'facebook', url: socialLinkURL } : undefined}
        reactions={reactions}
        actions={actions}
      />
    );
  },
);
