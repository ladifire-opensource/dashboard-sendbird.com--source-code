import { forwardRef, useMemo, useContext } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';

import moment from 'moment-timezone';

import { commonActions } from '@actions';
import { DeskAvatarType, DeskMessageRenderMode, FacebookAttachmentTypes } from '@constants';
import ChatBubble from '@desk/components/chatBubble/ChatBubble';
import {
  CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as adjacentComponentWidth,
  CHAT_BUBBLE_HORIZONTAL_SPACING as bubbleHorizontalSpacing,
} from '@desk/components/chatBubble/chatBubbleRenderer';
import { File } from '@desk/components/chatBubble/fileInterfaces';
import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';
import { convertURLsAndEmailsToLinks } from '@utils';

import { convertAttachmentToFile } from './convertFacebookAttachmentToFile';
import { SystemMessage } from './systemMessage';

type Props = {
  origin: string;
  options: {
    hideSender: boolean;
    hideProfile: boolean;
  };
  messageRenderMode?: DeskMessageRenderMode;
  message: FacebookPageMessage;
  ticketInfo: Pick<FacebookTicket, 'facebookPage' | 'customer' | 'lastSeenAt'>;
};

export const FacebookMessage = forwardRef<HTMLDivElement, Props>(
  ({ options, origin, message, ticketInfo, messageRenderMode = 'default' }, ref) => {
    const dispatch = useDispatch();
    const intl = useIntl();

    const { facebookPage, customer, lastSeenAt } = ticketInfo;
    const { agent, id, isEcho: isOwn, attachments: attachmentsString, isTemp, messageType, text, timestamp } = message;
    const senderName = isOwn ? facebookPage.name : customer.displayName;
    const avatar = isOwn
      ? { type: DeskAvatarType.Agent, imageUrl: facebookPage.picture.url, profileID: agent?.email ?? senderName }
      : { type: DeskAvatarType.Customer, imageUrl: customer.photoThumbnailUrl || undefined, profileID: senderName };
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
    const statusText = useMemo(
      () =>
        !isTemp && isOwn && (senderAgentName || facebookPage.name)
          ? intl.formatMessage(
              { id: 'desk.conversation.facebook.status.sentBy' },
              { senderName: senderAgentName, facebookPageName: facebookPage.name },
            )
          : undefined,
      [facebookPage.name, intl, isOwn, isTemp, senderAgentName],
    );

    const files = useMemo(() => {
      if (!attachmentsString) {
        return undefined;
      }
      try {
        const attachments: { type: FacebookAttachmentTypes; payload: { url: string } }[] = JSON.parse(
          attachmentsString,
        );
        const showImagePreview = (url: string) => dispatch(commonActions.showImagePreviewRequest([{ name: '', url }]));
        return attachments
          .filter((attachment) => !!attachment)
          .map<File>((attachment) => convertAttachmentToFile(attachment, showImagePreview));
      } catch {
        return undefined;
      }
    }, [attachmentsString, dispatch]);

    const getChatBubbleMaxWidth = useContext(ChatBubbleMaxWidthGetterContext);
    const chatBubbleMaxWidth = getChatBubbleMaxWidth({ adjacentComponentWidth, bubbleHorizontalSpacing });
    const mediaMaxSize = chatBubbleMaxWidth ? Math.min(360, chatBubbleMaxWidth) : undefined;

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
        senderName={senderName}
        avatar={avatar}
        isSenderHidden={isSenderHidden}
        isAvatarHidden={isAvatarHidden}
        isStatusHidden={isAvatarHidden}
        message={convertURLsAndEmailsToLinks(text)}
        date={moment(timestamp)}
        status={statusText}
        files={files}
        deliveryStatus={deliveryStatus}
        mediaMaxSize={mediaMaxSize}
      />
    );
  },
);
