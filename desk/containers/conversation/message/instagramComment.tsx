import React, { useMemo, useContext } from 'react';
import { useIntl } from 'react-intl';

import { cssVariables } from 'feather';
import moment from 'moment-timezone';

import { DeskAvatarType, DeskMessageRenderMode } from '@constants';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import {
  CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as adjacentComponentWidth,
  CHAT_BUBBLE_HORIZONTAL_SPACING as bubbleHorizontalSpacing,
} from '@desk/components/chatBubble/chatBubbleRenderer';
import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';
import { convertURLsAndEmailsToLinks, convertMessageWithCustomRule } from '@utils';

import { SystemMessage } from './systemMessage';

type Props = {
  origin: DeskOrigin;
  options: {
    hideSender: boolean;
    hideProfile: boolean;
  };
  messageRenderMode?: DeskMessageRenderMode;
  message: InstagramCommentTicket;
  ticketInfo: Pick<InstagramTicket, 'instagramUser' | 'customer' | 'lastSeenAt'>;
  handleFeedAction: ({ message, action }) => void;
};

const validInstagramUsernameRegex = new RegExp(
  /(@[A-Za-z0-9_](?:(?:[A-Za-z0-9_]|(?:\.(?!\.))){0,28}(?:[A-Za-z0-9_]))?)/g,
);
const convertInstagramUsernameToLink = (text) =>
  text.match(validInstagramUsernameRegex) ? (
    <a href={`https://instagram.com/${text.replace('@', '')}`} target="_blank">
      {text}
    </a>
  ) : (
    text
  );

export const InstagramCommentMessage = React.forwardRef<HTMLDivElement, Props>(
  ({ options, origin, message, ticketInfo, messageRenderMode = 'default', handleFeedAction }, ref) => {
    const intl = useIntl();
    const { instagramUser, customer, lastSeenAt } = ticketInfo;
    const { instagramComment, agent } = message;
    const { id, senderId, isTemp, likeCount, messageType, text, timestamp, status } = instagramComment;

    const isOwn = senderId === instagramUser.username;
    const senderName = isOwn ? instagramUser.username : customer.displayName;
    const avatar = isOwn
      ? { type: DeskAvatarType.Agent, imageUrl: instagramUser.profilePictureUrl, profileID: agent?.email ?? senderName }
      : { type: DeskAvatarType.Customer, imageUrl: customer.photoThumbnailUrl || undefined, profileID: senderName };
    const isDeleted = status === 'INACTIVE';
    const { hideProfile: isAvatarHidden, hideSender: isSenderHidden } = options;

    const deliveryStatus = useMemo(() => {
      if (isTemp) {
        return 'sending';
      }
      if (isOwn && messageRenderMode !== 'compact' && origin === 'conversation') {
        return lastSeenAt >= timestamp ? 'read' : 'sent';
      }
      return undefined;
    }, [isOwn, isTemp, lastSeenAt, messageRenderMode, timestamp, origin]);
    const senderAgentName = agent ? agent.displayName : undefined;
    const messageFromApp = !agent && isOwn;
    const backgroundColor = messageFromApp ? 'white' : undefined;

    const statusText = useMemo(() => {
      if (isDeleted) {
        return intl.formatMessage({ id: 'desk.conversation.instagram.status.deleted' });
      }

      return !isTemp && isOwn && (senderAgentName || instagramUser.username)
        ? [
            'Sent',
            ...(senderAgentName ? [`by ${senderAgentName}`] : []),
            ...(messageFromApp ? ['on Instagram'] : []),
          ].join(' ')
        : undefined;
    }, [isDeleted, isTemp, isOwn, senderAgentName, instagramUser.username, messageFromApp, intl]);

    const actions = React.useMemo(() => {
      const isActionsVisible = isOwn && messageRenderMode !== 'compact' && origin === 'conversation';
      if (!isActionsVisible) {
        return undefined;
      }

      const actions: { label: string; onClick: () => void }[] = [];
      if (!isDeleted) {
        actions.push({
          label: intl.formatMessage({ id: 'desk.conversation.instagram.action.delete' }),
          onClick: () => handleFeedAction({ message, action: 'DELETE' }),
        });
      }

      return actions;
    }, [isOwn, messageRenderMode, origin, isDeleted, intl, handleFeedAction, message]);

    const { reactions } = useMemo(() => {
      if (likeCount === 0) {
        return { reactions: undefined };
      }

      try {
        if (likeCount > 0) {
          return {
            reactions: [
              {
                icon: 'like' as const,
                count: likeCount,
                activeColor: cssVariables('red-5'),
                tooltipContent: intl.formatMessage({ id: 'desk.conversation.instagram.tooltip.liked' }, { likeCount }),
                participated: true,
              },
            ],
          };
        }
        return { reactions: undefined };
      } catch (e) {
        return { reactions: undefined };
      }
    }, [intl, likeCount]);

    const getChatBubbleMaxWidth = useContext(ChatBubbleMaxWidthGetterContext);
    const chatBubbleMaxWidth = getChatBubbleMaxWidth({ adjacentComponentWidth, bubbleHorizontalSpacing });
    const mediaMaxSize = chatBubbleMaxWidth ? Math.min(360, chatBubbleMaxWidth) : undefined;

    if (messageType === 'system') {
      return (
        <SystemMessage ref={ref} date={timestamp}>
          {convertURLsAndEmailsToLinks(text)}
        </SystemMessage>
      );
    }

    return (
      <ChatBubble
        ref={ref}
        messageId={id}
        isOwn={isOwn}
        isDeleted={isDeleted}
        senderName={senderName}
        avatar={avatar}
        isSenderHidden={isSenderHidden}
        isAvatarHidden={isAvatarHidden}
        isStatusHidden={isAvatarHidden}
        message={convertMessageWithCustomRule(text, {
          regex: validInstagramUsernameRegex,
          converter: convertInstagramUsernameToLink,
        })}
        date={moment(timestamp)}
        status={statusText}
        deliveryStatus={deliveryStatus}
        backgroundColor={backgroundColor}
        mediaMaxSize={mediaMaxSize}
        reactions={reactions}
        actions={actions}
      />
    );
  },
);
