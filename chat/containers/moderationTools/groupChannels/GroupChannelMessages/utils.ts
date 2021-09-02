import { useEffect, useState, useCallback, useMemo, RefObject, useRef } from 'react';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { useAppId, useCopy, useShowDialog } from '@hooks';

import useSendMessages from '../../hooks/useSendMessages';
import { BaseMessageType } from '../../message/baseMessage';
import BaseMessageTypeConverter from '../../utils/BaseMessageTypeConverter';

/**
 * @param options.messages Currently fetched messages
 * @param options.onSendSuccess Callback function to call when a message is sent successfully
 * @returns Array of messages that were sent but not fetched from the server yet and functions to send a message
 */
export const useSendMessagesWithCache = ({
  messages,
  onSendSuccess,
}: {
  messages: BaseMessageType[];
  onSendSuccess: () => void;
}) => {
  const [sentMessages, setSentMessages] = useState<BaseMessageType[]>([]);
  const sendMessageFunctions = useSendMessages({ onSendSuccess });

  const sendUserMessage = useCallback(
    ({
      message,
      channel,
      onSuccess,
    }: {
      message: string;
      channel: SendBird.GroupChannel;
      onSuccess?: (userMessage: SendBird.UserMessage) => void;
    }) => {
      sendMessageFunctions.sendUserMessage({
        message,
        channel,
        onSuccess: (sentMessage) => {
          onSuccess?.(sentMessage);

          // store the new message returned from SDK to show it on UI quickly
          setSentMessages((currState) => [...currState, BaseMessageTypeConverter.fromSdkMessage(sentMessage)]);
        },
      });
    },
    [sendMessageFunctions],
  );

  const sendAdminMessage = useCallback(
    async ({
      message,
      channelUrl,
      sendPush,
      onSuccess,
    }: {
      message: string;
      channelUrl: string;
      sendPush: boolean;
      onSuccess?: () => void;
    }) => {
      sendMessageFunctions.sendAdminMessage({
        message,
        channelUrl,
        channelType: 'group_channels',
        sendPush,
        onSuccess,
      });
    },
    [sendMessageFunctions],
  );

  const sendFileMessage = useCallback(
    ({
      file,
      channel,
      onSuccess,
    }: {
      file: File;
      channel: SendBird.GroupChannel;
      onSuccess?: (fileMessage: SendBird.FileMessage) => void;
    }) => {
      sendMessageFunctions.sendFileMessage({
        file,
        channel,
        onSuccess: (sentMessage) => {
          onSuccess?.(sentMessage);

          // store the new message returned from SDK to show it on UI quickly
          setSentMessages((currState) => [...currState, BaseMessageTypeConverter.fromSdkMessage(sentMessage)]);
        },
      });
    },
    [sendMessageFunctions],
  );

  return {
    sentMessages: useMemo(() => {
      // delete fetched messages from state.sentMessages
      const filteredSentMessages = [...sentMessages];

      // start searching from the latest message
      for (let i = messages.length - 1; i >= 0; i -= 1) {
        const message = messages[i];
        const sentMessageIndex = filteredSentMessages.findIndex((item) => item.messageId === message.messageId);
        if (sentMessageIndex > -1) {
          filteredSentMessages.splice(sentMessageIndex, 1);
        }
        if (filteredSentMessages.length === 0) {
          break;
        }
      }

      return filteredSentMessages.length < sentMessages.length ? filteredSentMessages : sentMessages;
    }, [messages, sentMessages]),
    actions: { sendUserMessage, sendAdminMessage, sendFileMessage },
  };
};

/**
 * @param scrollbarRef Ref to scroll element
 * @returns Functions that scroll the element to the bottom
 */
export const useScrollToBottom = (scrollbarRef: RefObject<HTMLElement>) => {
  const setTimeoutIdRef = useRef(-1);

  const scrollToBottom = useCallback(() => {
    if (scrollbarRef.current) {
      scrollbarRef.current.scrollTo(0, scrollbarRef.current.scrollHeight);
    }
  }, [scrollbarRef]);

  /**
   * Scroll the element to the bottom 10 times with 100ms intervals
   */
  const scrollToBottomWithSetTimeout = useCallback(() => {
    let setTimeoutRunCount = 0;

    const checkScrollPosition = () => {
      if (scrollbarRef.current == null) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollbarRef.current;

      if (scrollTop + clientHeight < scrollHeight) {
        scrollToBottom();
      }

      if (setTimeoutRunCount < 10) {
        setTimeoutRunCount += 1;
        window.setTimeout(checkScrollPosition, 100);
      }
    };

    setTimeoutIdRef.current = window.setTimeout(checkScrollPosition, 100);
  }, [scrollToBottom, scrollbarRef]);

  useEffect(() => {
    () => {
      if (setTimeoutIdRef.current > -1) {
        window.clearInterval(setTimeoutIdRef.current);
      }
    };
  });

  return { scrollToBottom, scrollToBottomWithSetTimeout };
};

export const useMessageActions = ({
  channelUrl,
  onMessageEditSuccess,
  onMessageDeleteSuccess,
}: {
  channelUrl: string;
  onMessageEditSuccess?: (message: BaseMessageType) => void;
  onMessageDeleteSuccess?: (messageId: BaseMessageType['messageId']) => void;
}) => {
  const appId = useAppId();
  const showDialog = useShowDialog();
  const copy = useCopy();

  const editMessage = useCallback(
    (message: BaseMessageType, messageType: 'MESG' | 'ADMM') => {
      showDialog({
        dialogTypes: DialogType.EditMessage,
        dialogProps: {
          message,
          messageType,
          channelType: 'group_channels',
          channelURL: channelUrl,
          onGroupChannelMessageEditSuccess: onMessageEditSuccess,
        },
      });
    },
    [channelUrl, onMessageEditSuccess, showDialog],
  );

  const deleteMessage = useCallback(
    (messageId: number) => {
      showDialog({
        dialogTypes: DialogType.DeleteMessage,
        dialogProps: {
          multiple: false,
          messageId: String(messageId),
          channelType: 'group_channels',
          channelURL: channelUrl,
          onDeleteMessage: () => {
            onMessageDeleteSuccess?.(messageId);
          },
        },
      });
    },
    [channelUrl, onMessageDeleteSuccess, showDialog],
  );

  const showDataInformation = useCallback(
    (data: string) => {
      showDialog({
        dialogTypes: DialogType.ModeratorInformation,
        dialogProps: { data },
      });
    },
    [showDialog],
  );

  const copyUrl = useCallback(
    (messageId: SendBirdAPIMessage['message_id']) => {
      copy(`${window.location.origin}/${appId}/group_channels/${channelUrl}/${messageId}`);
    },
    [appId, channelUrl, copy],
  );

  return { editMessage, deleteMessage, showDataInformation, copyUrl };
};
