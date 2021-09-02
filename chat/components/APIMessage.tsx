import { FC, useMemo } from 'react';

import { BaseMessage } from '@chat/containers/moderationTools/message/baseMessage';
import BaseMessageTypeConverter from '@chat/containers/moderationTools/utils/BaseMessageTypeConverter';
import { PropsOf } from '@utils';

type APIMessageProps = Omit<PropsOf<typeof BaseMessage>, 'message'> & {
  message: Pick<
    SendBirdAPIMessage,
    'message_id' | 'file' | 'user' | 'data' | 'thumbnails' | 'type' | 'created_at' | 'message' | 'silent'
  >;
};

const APIMessage: FC<APIMessageProps> = ({ message: apiMessage, ...props }) => {
  const message = useMemo(() => BaseMessageTypeConverter.fromApiMessage(apiMessage), [apiMessage]);

  return <BaseMessage message={message} {...props} />;
};

export default APIMessage;
