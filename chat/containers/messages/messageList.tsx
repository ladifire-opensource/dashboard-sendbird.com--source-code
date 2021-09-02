import React from 'react';

import { SpinnerFull } from '@ui/components';
import CenteredEmptyState from '@ui/components/CenteredEmptyState';

import { EmptyMessage } from './emptyMessage';
import { Message } from './message';

interface MessageListProps {
  isFetching: boolean;
  isSearched: boolean;
  messageRemovable: boolean;
  messages: any; // FIXME: replace any
  checked: boolean[];
  handleCheck: (checked, index, message) => void;
  recoverMessageRequest: (messageId) => any;
}

export const MessageList: React.SFC<MessageListProps> = ({
  isFetching,
  isSearched,
  messageRemovable,
  messages,
  checked,
  handleCheck,
  recoverMessageRequest,
}) => {
  if (isFetching) {
    return (
      <SpinnerFull
        style={{
          height: 430,
        }}
      />
    );
  }
  if (isSearched) {
    if (messages.length > 0) {
      return (
        <div>
          {messages.map((message, index) => (
            <Message
              key={`messages_message_${message.message_id}`}
              messageRemovable={messageRemovable}
              index={index}
              checked={checked[index]}
              handleCheck={handleCheck}
              message={message}
              recoverMessageRequest={recoverMessageRequest}
            />
          ))}
        </div>
      );
    }
    return (
      <CenteredEmptyState icon="messages" title="No messages found" description="Please check your search option" />
    );
  }
  return (
    <div>
      {Array.from(Array(3).keys()).map((index) => (
        <EmptyMessage key={index} />
      ))}
    </div>
  );
};
