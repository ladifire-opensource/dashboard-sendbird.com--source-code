import { useReducer, useMemo, useCallback, useRef, useEffect } from 'react';

import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { fetchChannelBannedUsers } from '@chat/api';
import { useAppId, useLatestValue } from '@hooks';

import { UserListCountBadge } from '../UserListCountBadge';

type State = {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasError: boolean;
  isLoadMoreFailed: boolean;
  items: BannedUserListItem[];
  next: string;
  count: number;
};

type Action =
  | { type: 'START_RELOADING' }
  | { type: 'RELOADING_FAILURE' }
  | { type: 'RELOADING_SUCCESS'; payload: { items: State['items']; next: string; count: number } }
  | { type: 'START_LOAD_MORE' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: { items: State['items']; next: string } }
  | { type: 'LOAD_MORE_FAILURE' }
  | { type: 'REMOVE_BANNED_USER'; payload: { userId: string } };

const initialState: State = {
  isLoading: false,
  isLoadingMore: false,
  items: [],
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
        items: state.items.concat(action.payload.items),
        next: action.payload.next,
      };
    case 'LOAD_MORE_FAILURE':
      return { ...state, isLoadingMore: false, isLoadMoreFailed: true };
    case 'REMOVE_BANNED_USER':
      return { ...state, items: state.items.filter((item) => item.user.user_id !== action.payload.userId) };
    default:
      return state;
  }
};

type UseBannedUsersOptions = { channelUrl: string; channelType: ChannelType; pageSize?: number };

export const useBannedUsers = ({ channelUrl, channelType, pageSize = 100 }: UseBannedUsersOptions) => {
  const appId = useAppId();
  const [state, dispatch] = useReducer(reducer, initialState);
  const ongoingRequests = useRef<CancellableAxiosPromise[]>([]);

  const { isLoading, isLoadingMore, hasError, next, count, items, isLoadMoreFailed } = state;
  const latestIsLoadingMore = useLatestValue(isLoadingMore);

  const reload = useCallback(async () => {
    if (!channelUrl) {
      return;
    }

    ongoingRequests.current.forEach((promise) => promise.cancel());
    dispatch({ type: 'START_RELOADING' });

    const request = fetchChannelBannedUsers({ appId, channelUrl, channelType, token: '', limit: pageSize });
    ongoingRequests.current.push(request);
    try {
      const result = await request;
      if (result == null) {
        // ignore canceled requests
      }

      const {
        data: { banned_list, next },
      } = result;
      dispatch({
        type: 'RELOADING_SUCCESS',
        payload: {
          items: banned_list,
          next,
          count: banned_list.length < pageSize ? banned_list.length : pageSize + Number(!!next),
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
    const request = fetchChannelBannedUsers({ appId, channelUrl, channelType, token: next, limit: pageSize });
    ongoingRequests.current.push(request);
    try {
      const result = await request;
      if (result == null) {
        // ignore canceled requests
        return;
      }

      const {
        data: { banned_list, next },
      } = result;
      dispatch({ type: 'LOAD_MORE_SUCCESS', payload: { items: banned_list, next } });
    } catch (error) {
      dispatch({ type: 'LOAD_MORE_FAILURE' });
    } finally {
      ongoingRequests.current = ongoingRequests.current.filter((item) => item !== request);
    }
  }, [appId, channelType, channelUrl, latestIsLoadingMore, next, pageSize]);

  const handleUserBanStateChange = useCallback(
    (userId: string, isBanned: boolean) => {
      if (!isBanned && items.some(({ user }) => user.user_id === userId)) {
        dispatch({ type: 'REMOVE_BANNED_USER', payload: { userId } });
      }
    },
    [items],
  );

  const countBadge = useMemo(
    () => <UserListCountBadge count={Math.min(count, pageSize)} showPlusSign={!!next} isLoading={isLoading} />,
    [count, isLoading, next, pageSize],
  );

  return {
    state: { isLoading, isLoadingMore, hasError, next, count, items, isLoadMoreFailed },
    countBadge,
    loadMore,
    reload,
    handleUserBanStateChange,
  };
};

export type InjectedBannedUsers = ReturnType<typeof useBannedUsers>;
export type InjectedBannedUsersProps = { bannedUsers: InjectedBannedUsers };
