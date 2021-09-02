import { useReducer, useMemo, useCallback, useRef, useEffect } from 'react';

import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { fetchChannelMutedUsers } from '@chat/api';
import { useAppId, useLatestValue } from '@hooks';

import { UserListCountBadge } from '../UserListCountBadge';

type State = {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasError: boolean;
  isLoadMoreFailed: boolean;
  users: MutedUserListItem[];
  next: string;
  count: number;
};

type Action =
  | { type: 'START_RELOADING' }
  | { type: 'RELOADING_FAILURE' }
  | { type: 'RELOADING_SUCCESS'; payload: { users: State['users']; next: string; count: number } }
  | { type: 'START_LOAD_MORE' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: { users: State['users']; next: string } }
  | { type: 'LOAD_MORE_FAILURE' }
  | { type: 'REMOVE_USER'; payload: { userId: string } };

const initialState: State = {
  isLoading: false,
  isLoadingMore: false,
  users: [],
  next: '',
  count: 0,
  hasError: false,
  isLoadMoreFailed: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'START_RELOADING':
      return { ...initialState, isLoading: true };
    case 'RELOADING_SUCCESS':
      return { ...state, isLoading: false, ...action.payload };
    case 'RELOADING_FAILURE':
      return { ...state, isLoading: false, hasError: true };
    case 'START_LOAD_MORE':
      return { ...state, isLoadingMore: true };
    case 'LOAD_MORE_SUCCESS':
      return {
        ...state,
        isLoadingMore: false,
        isLoadMoreFailed: false,
        users: state.users.concat(action.payload.users),
        next: action.payload.next,
      };
    case 'LOAD_MORE_FAILURE':
      return { ...state, isLoadingMore: false, isLoadMoreFailed: true };
    case 'REMOVE_USER':
      return { ...state, users: state.users.filter((user) => user.user_id !== action.payload.userId) };
    default:
      return state;
  }
};

type UseMutedUsersOptions = { channelUrl: string; channelType: ChannelType; pageSize?: number };

export const useMutedUsers = ({ channelUrl, channelType, pageSize = 100 }: UseMutedUsersOptions) => {
  const appId = useAppId();
  const [state, dispatch] = useReducer(reducer, initialState);
  const ongoingRequests = useRef<CancellableAxiosPromise[]>([]);

  const { isLoading, isLoadingMore, next, count, users } = state;
  const latestIsLoadingMore = useLatestValue(isLoadingMore);

  const reload = useCallback(async () => {
    if (!channelUrl) {
      return;
    }

    ongoingRequests.current.forEach((promise) => promise.cancel());
    dispatch({ type: 'START_RELOADING' });

    const request = fetchChannelMutedUsers({ appId, channelUrl, token: '', limit: pageSize, channelType });
    ongoingRequests.current.push(request);
    try {
      const result = await request;
      if (result == null) {
        // ignore canceled requests
      }

      const {
        data: { muted_list, next },
      } = result;
      dispatch({
        type: 'RELOADING_SUCCESS',
        payload: {
          users: muted_list,
          next,
          count: muted_list.length < pageSize ? muted_list.length : pageSize + Number(!!next),
        },
      });
    } catch (error) {
      dispatch({ type: 'RELOADING_FAILURE' });
    } finally {
      ongoingRequests.current = ongoingRequests.current.filter((item) => item !== request);
    }
  }, [appId, channelType, channelUrl, pageSize]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (!channelUrl || !next || latestIsLoadingMore.current) {
      return;
    }

    dispatch({ type: 'START_LOAD_MORE' });
    const request = fetchChannelMutedUsers({ appId, channelUrl, token: next, limit: pageSize, channelType });
    ongoingRequests.current.push(request);
    try {
      const result = await request;
      if (result == null) {
        // ignore canceled requests
        return;
      }

      const {
        data: { muted_list, next },
      } = result;
      dispatch({ type: 'LOAD_MORE_SUCCESS', payload: { users: muted_list, next } });
    } catch (error) {
      dispatch({ type: 'LOAD_MORE_FAILURE' });
    } finally {
      ongoingRequests.current = ongoingRequests.current.filter((item) => item !== request);
    }
  }, [appId, channelType, channelUrl, latestIsLoadingMore, next, pageSize]);

  const handleUserMuteStateChange = useCallback(
    (userId: string, isMuted: boolean) => {
      if (!isMuted && users.some((user) => user.user_id === userId)) {
        dispatch({ type: 'REMOVE_USER', payload: { userId } });
      }
    },
    [users],
  );

  const countBadge = useMemo(
    () => <UserListCountBadge count={Math.min(pageSize, count)} showPlusSign={!!next} isLoading={isLoading} />,
    [count, isLoading, next, pageSize],
  );

  return {
    state,
    countBadge,
    loadMore,
    reload,
    handleUserMuteStateChange,
  };
};

export type InjectedMutedMembers = ReturnType<typeof useMutedUsers>;
export type InjectedMutedMembersProps = { mutedMembers: InjectedMutedMembers };
