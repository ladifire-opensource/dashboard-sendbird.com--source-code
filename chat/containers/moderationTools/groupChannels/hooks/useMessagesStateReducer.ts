import { useCallback, useReducer, useMemo } from 'react';

import { fetchGroupChannelsMessages } from '@chat/api';
import { useAppId, useLatestValue } from '@hooks';

import { BaseMessageType } from '../../message/baseMessage';
import BaseMessageTypeConverter from '../../utils/BaseMessageTypeConverter';

type RequestState = {
  status: 'init' | 'loading' | 'success' | 'fail';
  error?: any;
};

type UseMessagesState = {
  status: 'init' | 'loading' | 'success' | 'fail';
  messages: BaseMessageType[];
  requestParams?: { messageId?: number; timestamp?: number };
  hasPreviousMessages: boolean;
  error?: any;
  previousMessagesRequest: RequestState;
  nextMessagesRequest: RequestState;
  hasNextMessages: boolean;
  nextMessagesRequestParams?: { isAutoScrolling: boolean };
};

enum UseMessagesActionType {
  FetchLatestMessagesStart,
  FetchLatestMessagesSuccess,
  FetchLatestMessagesFail,
  FetchPreviousMessagesStart,
  FetchPreviousMessagesSuccess,
  FetchPreviousMessagesFail,
  FetchNextMessagesStart,
  FetchNextMessagesSuccess,
  FetchNextMessagesFail,
  FetchMessagesAroundStart,
  FetchMessagesAroundSuccess,
  FetchMessagesAroundFail,
  DeleteMessage,
  ReplaceMessage,
  AppendMessage,
}

type UseMessagesAction =
  // Fetch Latest Messages
  | { type: UseMessagesActionType.FetchLatestMessagesStart }
  | ({
      type: UseMessagesActionType.FetchLatestMessagesSuccess;
    } & Pick<UseMessagesState, 'messages' | 'hasPreviousMessages'>)
  | { type: UseMessagesActionType.FetchLatestMessagesFail; error: any }
  // Fetch Previous Messages
  | { type: UseMessagesActionType.FetchPreviousMessagesStart }
  | ({
      type: UseMessagesActionType.FetchPreviousMessagesSuccess;
    } & Pick<UseMessagesState, 'messages' | 'hasPreviousMessages'>)
  | { type: UseMessagesActionType.FetchPreviousMessagesFail; error: any }
  // Fetch Next Messages
  | { type: UseMessagesActionType.FetchNextMessagesStart }
  | ({ type: UseMessagesActionType.FetchNextMessagesSuccess } & {
      nextMessagesRequestParams: UseMessagesState['nextMessagesRequestParams'];
    } & Pick<UseMessagesState, 'messages' | 'hasNextMessages'>)
  | { type: UseMessagesActionType.FetchNextMessagesFail; error: any }
  // Fetch Messages Around
  | { type: UseMessagesActionType.FetchMessagesAroundStart }
  | ({
      type: UseMessagesActionType.FetchMessagesAroundSuccess;
    } & Pick<UseMessagesState, 'requestParams' | 'messages' | 'hasPreviousMessages' | 'hasNextMessages'>)
  | { type: UseMessagesActionType.FetchMessagesAroundFail; error: any }
  | { type: UseMessagesActionType.DeleteMessage; messageId: BaseMessageType['messageId'] }
  | { type: UseMessagesActionType.ReplaceMessage; message: BaseMessageType }
  | { type: UseMessagesActionType.AppendMessage; message?: BaseMessageType; messages?: BaseMessageType[] };

const reducer: Reducer<UseMessagesState, UseMessagesAction> = (state, action) => {
  switch (action.type) {
    case UseMessagesActionType.FetchLatestMessagesStart:
      return { ...state, status: 'loading' };
    case UseMessagesActionType.FetchLatestMessagesSuccess:
      return {
        ...state,
        status: 'success',
        messages: action.messages,
        requestParams: undefined,
        hasPreviousMessages: action.hasPreviousMessages,
        hasNextMessages: false,
        error: undefined,
      };
    case UseMessagesActionType.FetchLatestMessagesFail:
      return { ...state, status: 'fail', error: action.error };
    case UseMessagesActionType.FetchPreviousMessagesStart:
      return { ...state, previousMessagesRequest: { ...state.previousMessagesRequest, status: 'loading' } };
    case UseMessagesActionType.FetchPreviousMessagesSuccess:
      return {
        ...state,
        messages: [...action.messages, ...state.messages],
        previousMessagesRequest: { status: 'success', error: undefined },
        hasPreviousMessages: action.hasPreviousMessages,
      };
    case UseMessagesActionType.FetchPreviousMessagesFail:
      return { ...state, previousMessagesRequest: { status: 'fail', error: action.error } };
    case UseMessagesActionType.FetchMessagesAroundStart:
      return { ...state, status: 'loading' };
    case UseMessagesActionType.FetchMessagesAroundSuccess:
      return {
        ...state,
        status: 'success',
        messages: action.messages,
        requestParams: action.requestParams,
        hasPreviousMessages: action.hasPreviousMessages,
        hasNextMessages: action.hasNextMessages,
        error: undefined,
      };
    case UseMessagesActionType.FetchMessagesAroundFail:
      return { ...state, status: 'fail', error: action.error };
    case UseMessagesActionType.FetchNextMessagesStart:
      return { ...state, nextMessagesRequest: { ...state.nextMessagesRequest, status: 'loading' } };
    case UseMessagesActionType.FetchNextMessagesSuccess:
      return {
        ...state,
        messages: [...state.messages, ...action.messages],
        hasNextMessages: action.hasNextMessages,
        nextMessagesRequestParams: action.nextMessagesRequestParams,
        nextMessagesRequest: { status: 'success' },
      };
    case UseMessagesActionType.FetchNextMessagesFail:
      return { ...state, nextMessagesRequest: { status: 'fail', error: action.error } };
    case UseMessagesActionType.DeleteMessage:
      return { ...state, messages: state.messages.filter((message) => message.messageId !== action.messageId) };
    case UseMessagesActionType.ReplaceMessage:
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.messageId === action.message.messageId ? action.message : message,
        ),
      };
    case UseMessagesActionType.AppendMessage:
      return {
        ...state,
        messages: state.messages.concat(action.message ? [action.message] : []).concat(action.messages ?? []),
      };
    default:
      return state;
  }
};

const useMessagesStateReducer = ({
  channelUrl,
  operatorFilter,
}: {
  channelUrl: string;
  operatorFilter?: OperatorFilter;
}) => {
  const [state, dispatch] = useReducer(reducer, {
    status: 'init',
    previousMessagesRequest: { status: 'init' },
    hasPreviousMessages: false,
    hasNextMessages: false,
    nextMessagesRequest: { status: 'init' },
    messages: [],
  });

  const appId = useAppId();
  const messagesRef = useLatestValue(state.messages);

  const fetchLatestMessages = useCallback(async () => {
    try {
      dispatch({ type: UseMessagesActionType.FetchLatestMessagesStart });
      const {
        data: { messages },
      } = await fetchGroupChannelsMessages({
        appId,
        prevLimit: 50,
        nextLimit: 0,
        ts: Date.now(),
        operatorFilter,
        channelUrl,
        include: true,
      });
      if (messages.length < 50) {
        dispatch({
          type: UseMessagesActionType.FetchLatestMessagesSuccess,
          hasPreviousMessages: false,
          messages: messages.map(BaseMessageTypeConverter.fromApiMessage),
        });
      } else {
        dispatch({
          type: UseMessagesActionType.FetchLatestMessagesSuccess,
          hasPreviousMessages: true,
          messages: messages.slice(1).map(BaseMessageTypeConverter.fromApiMessage),
        });
      }
    } catch (error) {
      dispatch({ type: UseMessagesActionType.FetchLatestMessagesFail, error });
    }
  }, [appId, channelUrl, operatorFilter]);

  /**
   * Fetch messages around a specific timestamp or a specific message.
   *
   * @param options.timestamp Unix time in milliseconds to be the reference point of the query
   * @param options.messageId Message ID to be the reference point of the query
   */
  const fetchMessagesAround = useCallback(
    async (options: { timestamp: number } | { messageId: number }) => {
      const ts = 'timestamp' in options ? options.timestamp : undefined;
      const messageId = 'messageId' in options ? options.messageId : undefined;
      const prevLimit = 25;
      const nextLimit = 25;

      try {
        dispatch({ type: UseMessagesActionType.FetchMessagesAroundStart });

        const {
          data: { messages },
        } = await fetchGroupChannelsMessages({
          appId,
          prevLimit,
          nextLimit,
          ts,
          messageId,
          operatorFilter,
          channelUrl,
          include: true,
        });

        const timestampIndex = messages.findIndex((message) => message.created_at >= (ts ?? 0));
        const messageIdIndex = messages.findIndex((message) => message.message_id === messageId);

        if (messageId && messageIdIndex === -1) {
          dispatch({
            type: UseMessagesActionType.FetchMessagesAroundSuccess,
            requestParams: options,
            hasPreviousMessages: true,
            hasNextMessages: true,
            messages: messages.map(BaseMessageTypeConverter.fromApiMessage),
          });
          return;
        }

        const prevMessageCount = messageId ? messageIdIndex : timestampIndex;
        const hasPreviousMessages = prevMessageCount === prevLimit;
        const hasTargetItem = messageId
          ? messages.some((item) => item.message_id === messageId)
          : messages.some((item) => item.created_at === ts);
        const nextMessageCount = messages.length - prevMessageCount - (hasTargetItem ? 1 : 0);
        const hasNextMessages = nextMessageCount === nextLimit;

        if (hasPreviousMessages) {
          messages.splice(0, 1);
        }

        if (hasNextMessages) {
          messages.splice(messages.length - 1, 1);
        }

        dispatch({
          type: UseMessagesActionType.FetchMessagesAroundSuccess,
          requestParams: options,
          hasPreviousMessages,
          hasNextMessages,
          messages: messages.map(BaseMessageTypeConverter.fromApiMessage),
        });
      } catch (error) {
        dispatch({ type: UseMessagesActionType.FetchMessagesAroundFail, error });
      }
    },
    [appId, channelUrl, operatorFilter],
  );

  const newMessagesRequestStatusRef = useLatestValue(state.nextMessagesRequest.status);

  const fetchNextMessages = useCallback(
    async ({
      isAutoScrolling,
    }: {
      /** true if the scroll position should be the bottom of the scrollable area after new messages are added. */
      isAutoScrolling: boolean;
    }) => {
      const currentMessages = messagesRef.current;

      if (currentMessages.length === 0) {
        // If there are no messages, fetch the latest messages
        if (state.status === 'success' || state.status === 'fail') {
          fetchLatestMessages();
        }
        return;
      }

      // If there are messages, fetch the next messages
      const nextLimit = 50;
      try {
        if (newMessagesRequestStatusRef.current === 'loading') {
          return;
        }

        dispatch({ type: UseMessagesActionType.FetchNextMessagesStart });
        const {
          data: { messages: newMessages },
        } = await fetchGroupChannelsMessages({
          appId,
          prevLimit: 0,
          nextLimit: 50,
          messageId: currentMessages[currentMessages.length - 1].messageId,
          operatorFilter,
          channelUrl,
          include: false,
        });

        const hasNextMessages = newMessages.length === nextLimit;

        if (hasNextMessages) {
          newMessages.splice(newMessages.length - 1, 1);
        }

        dispatch({
          type: UseMessagesActionType.FetchNextMessagesSuccess,
          messages: newMessages.map(BaseMessageTypeConverter.fromApiMessage),
          hasNextMessages,
          nextMessagesRequestParams: { isAutoScrolling },
        });
      } catch (error) {
        dispatch({ type: UseMessagesActionType.FetchNextMessagesFail, error });
      }
    },
    [appId, channelUrl, fetchLatestMessages, messagesRef, newMessagesRequestStatusRef, operatorFilter, state.status],
  );

  const previousMessagesRequestStatusRef = useLatestValue(state.previousMessagesRequest.status);

  const fetchPreviousMessages = useCallback(
    async (messageId: number) => {
      const currentMessages = messagesRef.current;
      if (currentMessages.length === 0 || previousMessagesRequestStatusRef.current === 'loading') {
        // do nothing
        return;
      }

      try {
        dispatch({ type: UseMessagesActionType.FetchPreviousMessagesStart });

        const {
          data: { messages: newMessages },
        } = await fetchGroupChannelsMessages({
          appId,
          prevLimit: 50,
          nextLimit: 0,
          messageId,
          operatorFilter,
          channelUrl,
          include: false,
        });

        if (newMessages.length < 50) {
          dispatch({
            type: UseMessagesActionType.FetchPreviousMessagesSuccess,
            hasPreviousMessages: false,
            messages: newMessages.map(BaseMessageTypeConverter.fromApiMessage),
          });
        } else {
          dispatch({
            type: UseMessagesActionType.FetchPreviousMessagesSuccess,
            hasPreviousMessages: true,
            messages: newMessages.slice(1).map(BaseMessageTypeConverter.fromApiMessage),
          });
        }
      } catch (error) {
        dispatch({ type: UseMessagesActionType.FetchPreviousMessagesFail, error });
      }
    },
    [appId, channelUrl, messagesRef, operatorFilter, previousMessagesRequestStatusRef],
  );

  const deleteMessage = useCallback((messageId: number) => {
    dispatch({ type: UseMessagesActionType.DeleteMessage, messageId });
  }, []);

  const replaceMessage = useCallback((message: BaseMessageType) => {
    dispatch({ type: UseMessagesActionType.ReplaceMessage, message });
  }, []);

  const appendMessage = useCallback((message: BaseMessageType | BaseMessageType[]) => {
    if (Array.isArray(message)) {
      dispatch({ type: UseMessagesActionType.AppendMessage, messages: message });
    } else {
      dispatch({ type: UseMessagesActionType.AppendMessage, message });
    }
  }, []);

  return {
    state,
    actions: useMemo(
      () => ({
        fetchLatestMessages,
        fetchNextMessages,
        fetchMessagesAround,
        fetchPreviousMessages,
        deleteMessage,
        replaceMessage,
        appendMessage,
      }),
      [
        fetchLatestMessages,
        fetchNextMessages,
        fetchMessagesAround,
        fetchPreviousMessages,
        deleteMessage,
        replaceMessage,
        appendMessage,
      ],
    ),
  };
};

export default useMessagesStateReducer;
