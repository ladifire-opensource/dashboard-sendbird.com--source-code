import { memo, useMemo } from 'react';

import { UserMessage, AdminMessage, FileMessage } from 'sendbird';

import { useAuthorization, useIsSpotv } from '@hooks';
import { MessageType, PropsOf } from '@utils';

import BaseMessageTypeConverter from '../utils/BaseMessageTypeConverter';
import { BaseMessage, MessageMenuType } from './baseMessage';

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Props = {
  message: UserMessage | AdminMessage | FileMessage;
  isModeratorInfoInAdminMessage: boolean;
  isConnected?: boolean;
} & Required<
  Pick<
    PropsOf<typeof BaseMessage>,
    'deleteMessage' | 'deleteMessageAndMuteSender' | 'editMessage' | 'showDataInformation'
  >
>;

const getMessageType = (message: SendBird.BaseMessageInstance): MessageType => {
  if (message.isUserMessage()) {
    return MessageType.user;
  }
  if (message.isFileMessage()) {
    return MessageType.file;
  }
  // broadcast & system event
  return MessageType.admin;
};

const OpenChannelMessage = memo<Props>(
  ({ message: messageProp, isModeratorInfoInAdminMessage, isConnected = true, ...props }) => {
    const { deleteMessage, editMessage, deleteMessageAndMuteSender } = props;
    const { showDataInformation } = props;

    const { isPermitted } = useAuthorization();
    const isSpotv = useIsSpotv();
    const isEditable = isPermitted(['application.channels.openChannel.all']) && isConnected;

    const getMessageMenus: () => MessageMenuType[] = () => {
      const messageType = getMessageType(messageProp);
      const isShowDataInformationVisible =
        messageType === MessageType.admin && isModeratorInfoInAdminMessage && messageProp.data;

      return [
        isShowDataInformationVisible && MessageMenuType.showDataInformation,
        MessageMenuType.edit,
        MessageMenuType.delete,
      ].filter((item): item is MessageMenuType => Boolean(item));
    };

    const message = useMemo(() => BaseMessageTypeConverter.fromSdkMessage(messageProp), [messageProp]);

    return (
      <BaseMessage
        isEditable={isEditable}
        message={message}
        deleteMessage={deleteMessage}
        editMessage={editMessage}
        deleteMessageAndMuteSender={deleteMessageAndMuteSender}
        showDataInformation={showDataInformation}
        messageMenus={getMessageMenus()}
        showDeleteAndMuteAction={isSpotv}
      />
    );
  },
);

export default OpenChannelMessage;
