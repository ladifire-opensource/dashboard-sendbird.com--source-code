import { useCallback, useMemo } from 'react';

import { toast } from 'feather';
import { FileMessage } from 'sendbird';

import { sendAdminMessage as sendAdminMessageApi } from '@chat/api';
import { getErrorMessage } from '@epics';
import { useAppId, useLatestValue } from '@hooks';
import { ALERT_ADMIN_MESSAGE_LENGTH } from '@utils/text';

import UnsentMessage from '../utils/UnsentMessage';

const isGroupChannel = (channel: SendBird.BaseChannel): channel is SendBird.GroupChannel => channel.isGroupChannel();

/**
 * Send a message to a Sendbird channel. If it failed to send a message, save the message to local storage.
 *
 * @param onSendSuccess Callback function to call when a message is sent successfully
 * @returns Functions to send a message `sendUserMessage`, `sendAdminMessage`, `sendFileMessage`.
 */
const useSendMessages = ({ onSendSuccess }: { onSendSuccess?: () => void } = {}) => {
  const appId = useAppId();
  const onSendSuccessRef = useLatestValue(onSendSuccess);

  /**
   * Handle failure sending a message.
   *
   * @param error Error to show in a toast notification
   * @param message Message to save in localStorage. Pass undefined when failed to send a file message.
   */
  const handleFailure = useCallback((error: any, message?: string) => {
    toast.error({ message: getErrorMessage(error) });
    if (message) {
      UnsentMessage.set(message);
    }
  }, []);

  const handleSuccess = useCallback(() => {
    UnsentMessage.clear();
    onSendSuccessRef.current?.();
  }, [onSendSuccessRef]);

  const sendUserMessage = useCallback(
    ({
      message,
      channel,
      onSuccess,
    }: {
      message: string;
      channel: SendBird.GroupChannel | SendBird.OpenChannel;
      onSuccess?: (userMessage: SendBird.UserMessage) => void;
    }) => {
      if (message.trim().length === 0 || (isGroupChannel(channel) && channel.myMemberState !== 'joined')) {
        return;
      }

      channel.sendUserMessage(message.trim(), (userMessage: SendBird.UserMessage, error) => {
        if (error) {
          handleFailure(error, message);
          return;
        }
        handleSuccess();
        onSuccess?.(userMessage);
      });
    },
    [handleFailure, handleSuccess],
  );

  const sendAdminMessage = useCallback(
    async ({
      message,
      channelUrl,
      channelType,
      sendPush,
      onSuccess,
    }: {
      message: string;
      channelUrl: string;
      channelType: ChannelType;
      sendPush?: boolean;
      onSuccess?: () => void;
    }) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage) {
        return;
      }

      if (trimmedMessage.length > 1000) {
        toast.warning({ message: ALERT_ADMIN_MESSAGE_LENGTH });
        return;
      }

      try {
        await sendAdminMessageApi({
          appId,
          channelUrls: [channelUrl],
          channelType,
          message: trimmedMessage,
          sendPush,
        });
        handleSuccess();
        onSuccess?.();
      } catch (error) {
        handleFailure(error, message);
      }
    },
    [appId, handleFailure, handleSuccess],
  );

  const sendFileMessage = useCallback(
    ({
      file,
      channel,
      onSuccess,
    }: {
      file: File;
      channel: SendBird.GroupChannel | SendBird.OpenChannel;
      onSuccess?: (fileMessage: SendBird.FileMessage) => void;
    }) => {
      if (isGroupChannel(channel) && channel.myMemberState !== 'joined') {
        return;
      }

      channel.sendFileMessage(file, (fileMessage: FileMessage, error) => {
        if (error) {
          handleFailure(error);
          return;
        }
        handleSuccess();
        onSuccess?.(fileMessage);
      });
    },
    [handleFailure, handleSuccess],
  );

  return useMemo(() => ({ sendUserMessage, sendAdminMessage, sendFileMessage }), [
    sendAdminMessage,
    sendFileMessage,
    sendUserMessage,
  ]);
};

export default useSendMessages;
