import { useRef, useReducer, Reducer, useCallback, useMemo, useEffect, useState } from 'react';

import { fetchTicketMessages } from '@desk/api';
import { useAppId, useLatestValue } from '@hooks';
import { useDeskEncryptedFileAccessPermission } from '@hooks/useDeskEncryptedFileAccessPermission';
import { camelCaseKeys } from '@utils';

type State = {
  isFetching: boolean;
  error: unknown | null;
  messages: SendBirdSDKTicketMessage[] | SendBirdAPIMessage[];
  previousMessagesRequest: {
    isFetching: boolean;
    error: unknown | null;
  };
  initialOrNextFetchedTimestamp: number | null;
};

type ActionTyped<T, P = undefined> = P extends undefined ? { type: T } : { type: T; payload: P };

type Action =
  | ActionTyped<'LOAD_MESSAGES_REQUEST'>
  | ActionTyped<'LOAD_MESSAGES_SUCCESS', { messages: State['messages'] }>
  | ActionTyped<'LOAD_MESSAGES_FAIL', { error: unknown }>
  | ActionTyped<'LOAD_PREVIOUS_MESSAGES_REQUEST'>
  | ActionTyped<'LOAD_PREVIOUS_MESSAGES_SUCCESS', { messages: State['messages'] }>
  | ActionTyped<'LOAD_PREVIOUS_MESSAGES_FAIL', { error: unknown }>
  | ActionTyped<'UPDATE_MESSAGE', { message: State['messages'][number] }>
  | ActionTyped<'APPEND_MESSAGES', { messages: State['messages'] }>;

const initialState: State = {
  isFetching: false,
  error: null,
  previousMessagesRequest: { isFetching: false, error: null },
  messages: [],
  initialOrNextFetchedTimestamp: null,
};

const queryLimit = 50;

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'LOAD_MESSAGES_REQUEST':
      return { ...state, isFetching: true };

    case 'LOAD_MESSAGES_SUCCESS':
      return {
        ...state,
        isFetching: false,
        error: null,
        messages: action.payload.messages,
        initialOrNextFetchedTimestamp: Date.now(),
      };

    case 'LOAD_MESSAGES_FAIL':
      return { ...state, isFetching: false, error: action.payload.error };

    case 'LOAD_PREVIOUS_MESSAGES_REQUEST':
      return {
        ...state,
        previousMessagesRequest: {
          ...state.previousMessagesRequest,
          isFetching: true,
        },
      };

    case 'LOAD_PREVIOUS_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: action.payload.messages.length > 0 ? [...action.payload.messages, ...state.messages] : state.messages,
        previousMessagesRequest: {
          isFetching: false,
          error: null,
        },
      };

    case 'LOAD_PREVIOUS_MESSAGES_FAIL':
      return {
        ...state,
        previousMessagesRequest: {
          isFetching: false,
          error: action.payload.error,
        },
      };

    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((item) =>
          item.messageId === camelCaseKeys(action.payload.message).messageId ? action.payload.message : item,
        ),
      };

    case 'APPEND_MESSAGES':
      return {
        ...state,
        messages: [...state.messages, ...action.payload.messages],
        initialOrNextFetchedTimestamp: Date.now(),
      };

    default:
      return state;
  }
};

/**
 * Fetch in-app ticket messages assigned to current logged-in agent using Sendbird JavaScript SDK.
 *
 * @param options.onLoad A function to call after messages are initially fetched
 */
export const useMyInAppTicketMessages = (
  ticket: Ticket,
  options?: { usePlatformAPI?: boolean; onLoad?: (messages: State['messages']) => void },
) => {
  const [groupChannel, setGroupChannel] = useState<SendBird.GroupChannel>();
  const { usePlatformAPI, onLoad } = options || {};
  const [state, dispatch] = useReducer(reducer, initialState);
  const onLoadRef = useLatestValue(onLoad);
  const messageListQueryRef = useRef<SendBird.PreviousMessageListQuery>();
  const groupChannelRef = useLatestValue(groupChannel);
  const appId = useAppId();
  const isEncryptedFileAccessPermitted = useDeskEncryptedFileAccessPermission({ ticket });
  const { url: channelUrl } = groupChannel || {};

  useEffect(() => {
    return () => {
      onLoadRef.current = undefined;
    };
  }, [onLoadRef]);

  useEffect(() => {
    if (!channelUrl || groupChannelRef.current == null || !usePlatformAPI) {
      return;
    }

    const fetch = async () => {
      dispatch({ type: 'LOAD_MESSAGES_REQUEST' });

      try {
        const {
          data: { messages },
        } = await fetchTicketMessages({
          appId,
          channelUrl,
          params: {
            messageTs: Date.now(),
            prevLimit: queryLimit,
            nextLimit: 0,
            presignedFileUrl: isEncryptedFileAccessPermitted,
          },
        });
        dispatch({ type: 'LOAD_MESSAGES_SUCCESS', payload: { messages } });
        onLoadRef.current?.(messages);
      } catch (error) {
        dispatch({ type: 'LOAD_MESSAGES_FAIL', payload: { error } });
      }
    };
    fetch();
  }, [appId, channelUrl, groupChannelRef, isEncryptedFileAccessPermitted, onLoadRef, usePlatformAPI]);

  useEffect(() => {
    if (!channelUrl || groupChannelRef.current == null || usePlatformAPI) {
      return () => {
        messageListQueryRef.current = undefined;
      };
    }

    dispatch({ type: 'LOAD_MESSAGES_REQUEST' });
    const messageListQuery = groupChannelRef.current.createPreviousMessageListQuery();
    messageListQuery.limit = queryLimit;
    messageListQuery.reverse = false;
    messageListQueryRef.current = messageListQuery;

    messageListQuery.load((newMessages, error) => {
      if (channelUrl !== groupChannelRef.current?.url) {
        // ignore; the query was so slow and user switched to another channel.
        return;
      }

      if (error) {
        dispatch({ type: 'LOAD_MESSAGES_FAIL', payload: { error } });
        return;
      }

      dispatch({ type: 'LOAD_MESSAGES_SUCCESS', payload: { messages: newMessages } });
      onLoadRef.current?.(newMessages);
    });

    return () => {
      messageListQueryRef.current = undefined;
    };
  }, [channelUrl, groupChannelRef, onLoadRef, usePlatformAPI]);

  const loadPreviousMessages = useCallback(
    ({ onBeforePrepend }: { onBeforePrepend: () => void }) => {
      if (usePlatformAPI && channelUrl) {
        dispatch({ type: 'LOAD_PREVIOUS_MESSAGES_REQUEST' });
        fetchTicketMessages({
          appId,
          channelUrl,
          params: {
            messageTs: (state.messages[0] as SendBirdAPIMessage).created_at,
            prevLimit: queryLimit,
            nextLimit: 0,
            presignedFileUrl: isEncryptedFileAccessPermitted,
          },
        })
          .then(({ data: { messages } }) => {
            onBeforePrepend();
            dispatch({ type: 'LOAD_PREVIOUS_MESSAGES_SUCCESS', payload: { messages } });
          })
          .catch((error) => {
            dispatch({ type: 'LOAD_PREVIOUS_MESSAGES_FAIL', payload: { error } });
          });
        return;
      }

      if (messageListQueryRef.current == null) {
        return;
      }

      dispatch({ type: 'LOAD_PREVIOUS_MESSAGES_REQUEST' });
      messageListQueryRef.current.load((prevMessages, error) => {
        if (error) {
          dispatch({ type: 'LOAD_PREVIOUS_MESSAGES_FAIL', payload: { error } });
          return;
        }
        onBeforePrepend();
        dispatch({ type: 'LOAD_PREVIOUS_MESSAGES_SUCCESS', payload: { messages: prevMessages } });
      });
    },
    [appId, channelUrl, isEncryptedFileAccessPermitted, state.messages, usePlatformAPI],
  );

  const appendMessages = useCallback((messages: State['messages']) => {
    dispatch({ type: 'APPEND_MESSAGES', payload: { messages } });
  }, []);

  const updateMessage = useCallback((message: State['messages'][number]) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { message } });
  }, []);

  const actions = useMemo(() => ({ appendMessages, updateMessage, loadPreviousMessages, setGroupChannel }), [
    appendMessages,
    loadPreviousMessages,
    updateMessage,
  ]);

  return [state, actions] as const;
};
