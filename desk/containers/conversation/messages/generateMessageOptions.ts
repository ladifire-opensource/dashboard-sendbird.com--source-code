import { Moment } from 'moment-timezone';

import { DeskMessageType } from '../message/SendBirdMessage';

interface MessageOptions {
  /**
   * True if the profile image should be hidden
   * If the sender is different from the one of the next message, or the time interval between the next message is longer than 1 minute, it is false.
   */
  hideProfile: boolean;

  /**
   * True if the sender's name should be hidden
   * If any among the created date, the sender, the message type is different from one of the previous message, it is false.
   */
  hideSender: boolean;
}

interface ComparableMessage {
  senderId: string;
  timestamp: Moment;
  messageType: string;
  isRemoved?: boolean;
  deskMessageType?: DeskMessageType;
}

interface GenerateMessageOptionsParams<T> {
  message: T;
  previousMessage?: T;
  nextMessage?: T;
}

interface GenerateMessageOptions<T = ComparableMessage> {
  (parameters: GenerateMessageOptionsParams<T>): MessageOptions;
}

export const generateMessageOptions: GenerateMessageOptions = ({ message, previousMessage, nextMessage }) => {
  const previousMessageTimestampMoment = previousMessage && previousMessage.timestamp;
  const nextMessageTimestampMoment = nextMessage && nextMessage.timestamp;

  const isPreviousMessageDateSame = previousMessageTimestampMoment
    ? previousMessageTimestampMoment.isSame(message.timestamp, 'date')
    : false;
  const isPreviousMessageSenderSame = (previousMessage && previousMessage.senderId) === message.senderId;
  const isPreviousMessageTypeSame = (previousMessage && previousMessage.messageType) === message.messageType;
  const isPreviousDeskMessageTypeDifferent =
    !!previousMessage && !!message.deskMessageType && previousMessage.deskMessageType !== message.deskMessageType;

  const isNextMessageDateSame =
    nextMessageTimestampMoment && message.timestamp.isSame(nextMessageTimestampMoment, 'date');
  const isNextMessageMinuteSame =
    nextMessageTimestampMoment && message.timestamp.isSame(nextMessageTimestampMoment, 'minute');
  const isNextMessageAvatarDifferent = (nextMessage && nextMessage.senderId) !== message.senderId;
  const isNextMessageDeskMessageTypeDifferent =
    !!nextMessage && !!message.deskMessageType && nextMessage.deskMessageType !== message.deskMessageType;

  const showProfile =
    !isNextMessageDateSame ||
    isNextMessageAvatarDifferent ||
    !isNextMessageMinuteSame ||
    (isNextMessageDeskMessageTypeDifferent && !message.isRemoved);

  const hideSender =
    isPreviousMessageDateSame &&
    isPreviousMessageSenderSame &&
    (isPreviousMessageTypeSame || !!message.isRemoved) &&
    (!isPreviousDeskMessageTypeDifferent || !!message.isRemoved);

  return { hideSender, hideProfile: !showProfile };
};

export const generateTwitterStatusOptions: GenerateMessageOptions<
  ComparableMessage & {
    isInReplyToStatusVisible: boolean;
  }
> = ({ message, previousMessage, nextMessage }) => {
  let { hideSender, hideProfile } = generateMessageOptions({ message, previousMessage, nextMessage });

  // If there is a third-party Tweet between messages, the messages should show the profile image and the sender's name.
  if (message.isInReplyToStatusVisible) {
    hideSender = false;
  }
  if (nextMessage && nextMessage.isInReplyToStatusVisible) {
    hideProfile = false;
  }
  return { hideSender, hideProfile };
};
