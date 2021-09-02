import { forwardRef, useContext, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';

import styled from 'styled-components';

import { Icon, cssVariables } from 'feather';
import times from 'lodash/times';
import moment from 'moment-timezone';
import { FileMessage } from 'sendbird';

import { commonActions } from '@actions';
import { DialogType } from '@common/containers/dialogs/DialogType';
import { DeskMessagesMode, DeskMessageRenderMode, DeskAvatarType } from '@constants';
import ChatBubble, { ChatBubbleAction } from '@desk/components/chatBubble/ChatBubble';
import {
  CHAT_BUBBLE_ADJACENT_COMPONENT_WIDTH as adjacentComponentWidth,
  CHAT_BUBBLE_HORIZONTAL_SPACING as bubbleHorizontalSpacing,
} from '@desk/components/chatBubble/chatBubbleRenderer';
import { ChatBubbleMaxWidthGetterContext } from '@desk/containers/DeskChatLayout';
import { useShowDialog } from '@hooks';
import { sdkMessageTypeChecker, convertURLsAndEmailsToLinks, PropOf } from '@utils';

import { SENDBIRD_AVATAR_URL } from '../constants';
import { generateMessageOptions } from '../messages/generateMessageOptions';
import { FAQBotAnswers } from './FAQBotAnswers';
import { SystemMessage } from './systemMessage';
import { getMessageThumbnail } from './utils';

const StarContainer = styled.span`
  display: inline-flex;
  align-items: center;
  vertical-align: -2px;
`;

export enum DeskMessageType {
  User = 'user',
  File = 'file',
  Image = 'image',
  AutoMessage = 'autoMessage',
  BotMessage = 'botMessage',
  Satisfaction = 'satisfaction',
  System = 'system',
  ConfirmEndOfChat = 'confirmEndOfChat',
  URLPreview = 'urlPreview',
  None = 'none',
}

type Props = {
  customerSendbirdId?: Customer['sendbirdId'];
  lastSeenAt: number;
  message: ParsedSendBirdMessage;
  messageRenderMode: DeskMessageRenderMode;
  messagesMode: DeskMessagesMode;
  nextMessage?: ParsedSendBirdMessage;
  previousMessage?: ParsedSendBirdMessage;
  deleteMessageAction?: ChatBubbleAction;
};

const parseData = (rawData) => {
  let parsedData: any = {};
  if (rawData && typeof rawData === 'string') {
    try {
      parsedData = JSON.parse(rawData);
    } catch (e) {
      // skip
    }
  } else {
    parsedData = rawData;
  }
  return parsedData;
};

const checkDeskMessageType = (message: Omit<SendBirdSDKTicketMessage, 'sender'>): DeskMessageType => {
  if (!message) {
    return DeskMessageType.None;
  }

  const { customType, data } = message;
  const parsedMessageData = parseData(data);

  // Auto event messages sent from Group channels
  if (customType === 'SENDBIRD:AUTO_EVENT_MESSAGE') {
    return DeskMessageType.AutoMessage;
  }

  if (customType === 'SENDBIRD_DESK_BOT_MESSAGE') {
    return DeskMessageType.BotMessage;
  }

  if (customType === 'SENDBIRD_DESK_RICH_MESSAGE' && parsedMessageData) {
    if (parsedMessageData.type === 'SENDBIRD_DESK_INQUIRE_TICKET_CLOSURE') {
      return DeskMessageType.ConfirmEndOfChat;
    }
    if (parsedMessageData.type === 'SENDBIRD_DESK_URL_PREVIEW') {
      return DeskMessageType.URLPreview;
    }
    if (parsedMessageData.type === 'SENDBIRD_DESK_CUSTOMER_SATISFACTION') {
      return DeskMessageType.Satisfaction;
    }
  }

  if (sdkMessageTypeChecker.isAdminMessage(message)) {
    if (customType === 'SENDBIRD_DESK_ADMIN_MESSAGE_CUSTOM_TYPE') {
      return DeskMessageType.System;
    }

    /**
     * @var parsedMessageData.type for NOTIFICATION
     *
     * 'NOTIFICATION_WELCOME',
     * 'NOTIFICATION_AWAY_AGENT',
     * 'NOTIFICATION_ASSIGNMENT_DELAY',
     * 'NOTIFICATION_NOT_OPERATING_HOUR',
     * 'NOTIFICATION_MANUAL_CLOSED',
     * 'NOTIFICATION_AUTO_CLOSED',
     * 'NOTIFICATION_PROACTIVE_CHAT',
     */
    return DeskMessageType.AutoMessage;
  }

  if (sdkMessageTypeChecker.isFileMessage(message)) {
    const { type } = message as FileMessage;
    if (type.match(/^image.+$/i)) {
      return DeskMessageType.Image;
    }
    return DeskMessageType.File;
  }
  return DeskMessageType.User;
};

const getAvatar = (message: ParsedSendBirdMessage, messageType: DeskMessageType) => {
  if (
    [DeskMessageType.AutoMessage, DeskMessageType.ConfirmEndOfChat, DeskMessageType.Satisfaction].includes(messageType)
  ) {
    return SENDBIRD_AVATAR_URL;
  }
  return message.sender ? message.sender.profileUrl : undefined;
};

export const SendBirdMessage = forwardRef<HTMLDivElement, Props>(
  (
    {
      customerSendbirdId,
      lastSeenAt,
      message,
      messagesMode = DeskMessagesMode.SENDBIRD,
      messageRenderMode,
      nextMessage,
      previousMessage,
      deleteMessageAction,
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const showDialog = useShowDialog();

    const deskMessageType = checkDeskMessageType(message);
    const currentAgent = useSelector((state: RootState) => state.desk.agent);

    const isSendbirdMessageType = [DeskMessageType.AutoMessage, DeskMessageType.ConfirmEndOfChat].includes(
      deskMessageType,
    );

    const isMyMessage = message.sender && currentAgent && currentAgent.sendbirdId === message.sender.userId;
    const isCustomer = message.sender && customerSendbirdId === message.sender.userId;
    const isOwn = isSendbirdMessageType || !isCustomer;

    /**
     * Retrieve File Message (FILE)
     */
    const handleImageClick = () => {
      if (message.messageType === 'file') {
        dispatch(
          commonActions.showImagePreviewRequest([
            {
              name: message.name || '',
              type: message.type,
              url: message.url || '',
              thumbnails: message.thumbnails && message.thumbnails.map((item) => item.url),
              createdAt: message.createdAt,
            },
          ]),
        );
      }
    };

    const senderName = useMemo(() => {
      if (isMyMessage) {
        return currentAgent.displayName;
      }

      if (message.sender) {
        return message.sender.nickname;
      }

      return '';
    }, [currentAgent.displayName, isMyMessage, message.sender]);

    const deliveryStatus = (() => {
      if (messagesMode !== DeskMessagesMode.SENDBIRD) {
        return undefined;
      }
      if (isOwn && lastSeenAt >= message.createdAt) {
        return 'read';
      }
      if (isOwn && lastSeenAt < message.createdAt) {
        return 'sent';
      }
    })();

    const date = moment(message.createdAt);

    const avatar: PropOf<typeof ChatBubble, 'avatar'> = isMyMessage
      ? { type: DeskAvatarType.Agent, imageUrl: currentAgent.photoThumbnailUrl, profileID: currentAgent.email }
      : { type: DeskAvatarType.Customer, imageUrl: getAvatar(message, deskMessageType), profileID: senderName };

    const parsedMessageData = parseData(message.data);

    const { hideSender, hideProfile } = generateMessageOptions({
      message: {
        senderId: message.sender && message.sender.userId,
        timestamp: moment(message.createdAt),
        messageType: message.messageType,
        deskMessageType,
        isRemoved: message.isRemoved,
      },
      previousMessage: previousMessage && {
        senderId: previousMessage.sender && previousMessage.sender.userId,
        timestamp: moment(previousMessage.createdAt),
        messageType: previousMessage.messageType,
        deskMessageType: checkDeskMessageType(previousMessage),
        isRemoved: previousMessage.isRemoved,
      },
      nextMessage: nextMessage && {
        senderId: nextMessage.sender && nextMessage.sender.userId,
        timestamp: moment(nextMessage.createdAt),
        messageType: nextMessage.messageType,
        deskMessageType: checkDeskMessageType(nextMessage),
        isRemoved: nextMessage.isRemoved,
      },
    });

    const getChatBubbleMaxWidth = useContext(ChatBubbleMaxWidthGetterContext);
    const chatBubbleMaxWidth = getChatBubbleMaxWidth({ adjacentComponentWidth, bubbleHorizontalSpacing });
    const mediaMaxSize = chatBubbleMaxWidth ? Math.min(360, chatBubbleMaxWidth) : undefined;
    const actions: ChatBubbleAction[] = deleteMessageAction == null ? [] : [deleteMessageAction];

    const handleAvatarClick = useCallback(async () => {
      if (!isOwn) {
        return;
      }

      if (message.sender) {
        showDialog({
          dialogTypes: DialogType.ViewAgentProfile,
          dialogProps: {
            sdkUserId: message.sender.userId,
          },
        });
      }
    }, [isOwn, message.sender, showDialog]);

    const renderFileMessage = (message: SendBirdFileMessageFixed) => {
      switch (deskMessageType) {
        case DeskMessageType.File: {
          const { url = '', name, type = '', thumbnails } = message;
          const messageThumbnail = thumbnails?.[0];
          const aspectRatio = messageThumbnail && {
            x: messageThumbnail.real_width / messageThumbnail.real_height,
            y: 1,
          };

          const fileType = (() => {
            if (type.startsWith('audio')) {
              return 'audio';
            }
            if (type.startsWith('video')) {
              return 'video';
            }
            if (
              /**
               * Reference this webpage for MIME types:
               * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
               */
              [
                'application/msword',
                'application/pdf',
                'application/rtf',
                'application/vnd.ms-excel',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/csv',
                'text/html',
                'text/plain',
              ].includes(type)
            ) {
              return 'document';
            }
            if (
              [
                'application/x-7z-compressed',
                'application/x-bzip',
                'application/x-bzip2',
                'application/x-rar-compressed',
                'application/x-tar',
                'application/zip',
              ].includes(type)
            ) {
              return 'archive';
            }
            return 'misc';
          })();
          return (
            <ChatBubble
              ref={ref}
              avatar={avatar}
              date={date}
              deliveryStatus={deliveryStatus}
              files={[
                {
                  type: fileType,
                  url,
                  name,
                  ...(fileType === 'video' ? { aspectRatio } : undefined),
                  onClick: () => {
                    window.open(url);
                  },
                },
              ]}
              isAvatarHidden={hideProfile}
              isOwn={isOwn}
              isSenderHidden={hideSender}
              isStatusHidden={hideProfile}
              isRemoved={message.isRemoved}
              senderName={senderName}
              mediaMaxSize={mediaMaxSize}
              actions={actions}
              onAvatarClick={isOwn ? handleAvatarClick : undefined}
            />
          );
        }

        case DeskMessageType.Image: {
          const messageThumbnail = getMessageThumbnail(message.thumbnails);
          const url = messageThumbnail?.url || message.url || '';
          const dimension = messageThumbnail
            ? { width: messageThumbnail.real_width, height: messageThumbnail.real_height }
            : undefined;
          return (
            <ChatBubble
              ref={ref}
              avatar={avatar}
              date={date}
              deliveryStatus={deliveryStatus}
              files={[{ type: 'image', url, dimension, onClick: handleImageClick }]}
              isAvatarHidden={hideProfile}
              isOwn={isOwn}
              isSenderHidden={hideSender}
              isStatusHidden={hideProfile}
              isRemoved={message.isRemoved}
              senderName={senderName}
              mediaMaxSize={mediaMaxSize}
              actions={actions}
              onAvatarClick={isOwn ? handleAvatarClick : undefined}
            />
          );
        }

        default:
          return null;
      }
    };

    const renderUserMessage = (message: SendBirdUserMessageFixed) => {
      const parsedTextMessage = convertURLsAndEmailsToLinks(message.message);

      switch (deskMessageType) {
        case DeskMessageType.ConfirmEndOfChat: {
          const backgroundColor = (() => {
            if (parsedMessageData.body.state === 'CONFIRMED') {
              return 'green';
            }
            if (parsedMessageData.body.state === 'DECLINED') {
              return 'red';
            }
            return 'yellow';
          })();

          return (
            <ChatBubble
              ref={ref}
              avatar={avatar}
              backgroundColor={backgroundColor}
              date={date}
              deliveryStatus={deliveryStatus}
              isAvatarHidden={hideProfile}
              isOwn={isOwn}
              isSenderHidden={hideSender}
              isStatusHidden={hideProfile}
              isRemoved={message.isRemoved}
              message={parsedTextMessage}
              senderName={senderName}
              mediaMaxSize={mediaMaxSize}
            />
          );
        }
        case DeskMessageType.URLPreview:
          if (parsedMessageData.body.url && parsedMessageData.body.image) {
            return (
              <ChatBubble
                ref={ref}
                avatar={avatar}
                date={date}
                deliveryStatus={deliveryStatus}
                isAvatarHidden={hideProfile}
                isOwn={isOwn}
                isSenderHidden={hideSender}
                isStatusHidden={hideProfile}
                isRemoved={message.isRemoved}
                message={parsedTextMessage}
                senderName={senderName}
                mediaMaxSize={mediaMaxSize}
                urlPreview={{ ...parsedMessageData.body, imageURL: parsedMessageData.body.image }}
                actions={actions}
                onAvatarClick={isOwn ? handleAvatarClick : undefined}
              />
            );
          }
          return null;
        case DeskMessageType.User:
          return (
            <ChatBubble
              ref={ref}
              avatar={avatar}
              date={date}
              deliveryStatus={deliveryStatus}
              isAvatarHidden={hideProfile}
              isOwn={isOwn}
              isSenderHidden={hideSender}
              isStatusHidden={hideProfile}
              isRemoved={message.isRemoved}
              message={parsedTextMessage}
              senderName={senderName}
              mediaMaxSize={mediaMaxSize}
              actions={actions}
              onAvatarClick={isOwn ? handleAvatarClick : undefined}
            />
          );

        case DeskMessageType.BotMessage:
          return (
            <ChatBubble
              ref={ref}
              avatar={{
                type: DeskAvatarType.Bot,
                imageUrl: message.sender.profileUrl,
                profileID: message.sender.userId,
              }}
              date={date}
              deliveryStatus={deliveryStatus}
              isOwn={isOwn}
              backgroundColor="neutral"
              isAvatarHidden={hideProfile}
              isSenderHidden={hideSender}
              isStatusHidden={hideProfile}
              message={parsedTextMessage}
              senderName={senderName}
              mediaMaxSize={mediaMaxSize}
              onAvatarClick={isOwn ? handleAvatarClick : undefined}
            >
              <FAQBotAnswers data={parsedMessageData} messageRenderMode={messageRenderMode} />
            </ChatBubble>
          );

        case DeskMessageType.AutoMessage:
          return (
            <ChatBubble
              ref={ref}
              avatar={avatar}
              date={date}
              deliveryStatus={deliveryStatus}
              isOwn={isOwn}
              backgroundColor="neutral"
              isAvatarHidden={hideProfile}
              isSenderHidden={hideSender}
              isStatusHidden={hideProfile}
              message={parsedTextMessage}
              senderName={senderName}
              mediaMaxSize={mediaMaxSize}
            />
          );

        case DeskMessageType.Satisfaction: {
          const { customerSatisfactionScore, customerSatisfactionComment, status } = parsedMessageData.body;
          if (status === 'WAITING')
            return (
              <ChatBubble
                ref={ref}
                avatar={avatar}
                date={date}
                deliveryStatus={deliveryStatus}
                isOwn={isOwn}
                backgroundColor="neutral"
                isSenderHidden={hideSender}
                isStatusHidden={hideProfile}
                message={parsedTextMessage}
                mediaMaxSize={mediaMaxSize}
              />
            );
          if (customerSatisfactionScore != null) {
            const StarMessage = (
              <SystemMessage date={message.createdAt}>
                {intl.formatMessage({ id: 'desk.conversation.csat.ratedBy' }, { ratedBy: customerSendbirdId })}{' '}
                <StarContainer style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {times(customerSatisfactionScore, () => (
                    <Icon icon="star-filled" size={12} color={cssVariables('yellow-5')} />
                  ))}
                  {times(5 - customerSatisfactionScore, () => (
                    <Icon icon="star-filled" size={12} color={cssVariables('neutral-3')} />
                  ))}
                </StarContainer>
              </SystemMessage>
            );
            const CommentMessage = (
              <SystemMessage date={message.createdAt}>
                {intl.formatMessage(
                  { id: 'desk.conversation.csat.commented' },
                  { commentedBy: customerSendbirdId, customerSatisfactionComment },
                )}
              </SystemMessage>
            );

            if (customerSatisfactionComment) {
              return (
                <>
                  {StarMessage}
                  {CommentMessage}
                </>
              );
            }
            return StarMessage;
          }
          return null;
        }
        case DeskMessageType.System:
          return (
            <SystemMessage ref={ref} date={date}>
              {parsedTextMessage}
            </SystemMessage>
          );
        default:
          return null;
      }
    };

    if (message.messageType === 'file') {
      return renderFileMessage(message);
    }
    return renderUserMessage(message);
  },
);
