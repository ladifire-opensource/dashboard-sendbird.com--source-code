import { useEffect, useCallback, useMemo, useRef, useReducer, Reducer } from 'react';

import { toast } from 'feather';
import { ParticipantListQuery, BannedUserListQuery, MutedUserListQuery, OpenChannel, User } from 'sendbird';

import { getErrorMessage } from '@epics';
import { useLatestValue, useTypedSelector } from '@hooks';

type UseListQueryOptions = { url: string; createListQuery: (channel: OpenChannel) => ListQuery; limit?: number };
type ListQuery = ParticipantListQuery | BannedUserListQuery | MutedUserListQuery;

type State = {
  users: User[];
  isLoading: boolean;
  hasMore: boolean;
  hasError: boolean;
  isLoadingMore: boolean;
  isLoadMoreFailed: boolean;
};

type Action =
  | { type: 'RELOAD_START'; payload: { clearError: boolean } }
  | { type: 'RELOAD_FAIL' }
  | { type: 'RELOAD_SUCCESS'; payload: { users: User[]; hasMore: boolean } }
  | { type: 'LOAD_MORE_START' }
  | { type: 'LOAD_MORE_FAIL' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: { users: User[]; hasMore: boolean } };

const initialState: State = {
  users: [],
  isLoading: true, // a spinner should be displayed before initial fetching occurs.
  hasMore: false,
  hasError: false,
  isLoadingMore: false,
  isLoadMoreFailed: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'RELOAD_START':
      // Set isLoading true and reset the properties related to 'load more' behavior.
      return {
        ...state,
        users: [],
        isLoading: true,
        hasMore: false,
        isLoadingMore: false,
        isLoadMoreFailed: false,
        hasError: action.payload.clearError ? false : state.hasError,
      };
    case 'RELOAD_SUCCESS':
      return {
        ...state,
        isLoading: false,
        users: action.payload.users,
        hasMore: action.payload.hasMore,
        hasError: false,
      };
    case 'RELOAD_FAIL':
      return {
        ...state,
        isLoading: false,
        hasError: true,
      };
    case 'LOAD_MORE_START':
      return { ...state, isLoadingMore: true };
    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        isLoadingMore: false,
        users: state.users.concat(action.payload.users),
        hasMore: action.payload.hasMore,
        isLoadMoreFailed: false,
      };
    case 'LOAD_MORE_FAIL':
      return { ...state, isLoadingMore: false, isLoadMoreFailed: true };
    default:
      return state;
  }
};

/**
 * This hook loads the participant/banned/muted user list of an open channel from Sendbird SDK, and manages the related state.
 *
 * @param options.url Open channel URL
 * @param options.createListQuery A callback that returns a ListQuery instance given a SendBird.OpenChannel instance
 */
export const useListQuery = ({ url, createListQuery, limit }: UseListQueryOptions) => {
  const isEntered = useTypedSelector((state) => state.openChannels.isEntered);
  const channelRef = useRef<OpenChannel>();
  const listQueryRef = useRef<ListQuery | undefined>(undefined);
  const [state, dispatch] = useReducer(reducer, initialState);

  const latestCreateListQuery = useLatestValue(createListQuery);

  /**
   * Get channel from Sendbird SDK (if needed) and load the first page of the user list
   *
   * @param clearError pass true to clear the current error
   */
  const reload = useCallback(
    async (clearError: boolean = false) => {
      if (!isEntered || !url) {
        // Channel url is undefined, or the user didn't enter the channel as a operator yet.
        return;
      }

      dispatch({ type: 'RELOAD_START', payload: { clearError } });

      const getChannel = async () => {
        if (channelRef.current && channelRef.current.url === url) {
          // Return a cached channel object
          return channelRef.current;
        }

        // Channel hasn't been loaded or the url changed.
        try {
          const channel = await window.dashboardSB.OpenChannel.getChannel(url);
          channelRef.current = channel;
          return channel;
        } catch (error) {
          toast.error({ message: getErrorMessage(error) });
          channelRef.current = undefined;
          listQueryRef.current = undefined;
          return undefined;
        }
      };

      const channel = await getChannel();
      if (channel == null) {
        // Failed to load the channel from Sendbird SDK
        dispatch({ type: 'RELOAD_FAIL' });
        return;
      }

      // Create a ListQuery of the given channel.
      const listQuery = latestCreateListQuery.current(channel);
      if (limit) {
        listQuery.limit = limit;
      }
      listQueryRef.current = listQuery;

      // Fetch the first page.
      listQuery.next((users, error) => {
        if (error) {
          dispatch({ type: 'RELOAD_FAIL' });
          return;
        }
        dispatch({ type: 'RELOAD_SUCCESS', payload: { users, hasMore: listQuery.hasNext } });
      });
    },
    [isEntered, latestCreateListQuery, limit, url],
  );

  useEffect(() => {
    // When url changes, reload the list.
    reload(true);
  }, [reload]);

  const loadMore = useCallback(() => {
    const listQuery = listQueryRef.current;
    if (listQuery == null) {
      return;
    }

    dispatch({ type: 'LOAD_MORE_START' });

    listQueryRef.current?.next((users, error) => {
      if (error) {
        dispatch({ type: 'LOAD_MORE_FAIL' });
        return;
      }
      dispatch({ type: 'LOAD_MORE_SUCCESS', payload: { users, hasMore: listQuery.hasNext } });
    });
  }, []);

  return useMemo(() => {
    return { state, reload, loadMore };
  }, [loadMore, reload, state]);
};
