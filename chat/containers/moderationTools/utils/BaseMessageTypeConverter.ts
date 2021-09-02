import pick from 'lodash/pick';

import { camelCaseKeys } from '@utils';
import { getSDKMessageTypeFromPlatformAPIMessage, MessageType } from '@utils/messages';

import { BaseMessageType } from '../message/baseMessage';

const fromApiMessage = (
  apiMessage: Pick<
    SendBirdAPIMessage,
    'message_id' | 'file' | 'user' | 'data' | 'thumbnails' | 'type' | 'created_at' | 'message' | 'silent'
  >,
): BaseMessageType => {
  const { file, user, data, thumbnails } = apiMessage;
  const messageType = getSDKMessageTypeFromPlatformAPIMessage(apiMessage);
  const sender = user ? camelCaseKeys(user) : undefined;
  const commonProperties = { ...camelCaseKeys(apiMessage), sender, type: messageType };

  if (messageType === MessageType.file && file) {
    return {
      ...commonProperties,
      file: { ...file, thumbnails },
      data: file.data,
    };
  }
  return {
    ...commonProperties,
    data: data || '',
  };
};

const isAdminMessage = (message: SendBird.BaseMessageInstance): message is SendBird.AdminMessage =>
  message.isAdminMessage();

const isFileMessage = (message: SendBird.BaseMessageInstance): message is SendBird.FileMessage =>
  message.isFileMessage();

const fromSdkMessage = (
  sdkMessage: SendBird.AdminMessage | SendBird.FileMessage | SendBird.UserMessage,
): BaseMessageType => {
  if (isFileMessage(sdkMessage)) {
    const file = pick(sdkMessage, ['name', 'size', 'type', 'url', 'thumbnails']);
    return { ...sdkMessage, type: MessageType.file, file };
  }

  return {
    ...sdkMessage,
    type: isAdminMessage(sdkMessage) ? MessageType.admin : MessageType.user,
    sender: isAdminMessage(sdkMessage) ? undefined : sdkMessage.sender,
  };
};

export default { fromApiMessage, fromSdkMessage };
