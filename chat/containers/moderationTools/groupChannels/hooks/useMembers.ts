import { useReducer, useCallback, useRef, useEffect, Reducer } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';

import { chatActions } from '@actions';
import { CancellableAxiosPromise } from '@api/cancellableAxios';
import { fetchGroupChannelsMembers } from '@chat/api';
import { useAppId, useLatestValue } from '@hooks';

type State = {
  isLoading: boolean;
  isLoadingMore: boolean;
  hasError: boolean;
  isLoadMoreFailed: boolean;
  users: GroupChannelMember[];
  next: string;
};

type Action =
  | { type: 'START_RELOADING' }
  | { type: 'RELOADING_FAILURE' }
  | { type: 'RELOADING_SUCCESS'; payload: { users: State['users']; next: string; count: number } }
  | { type: 'START_LOAD_MORE' }
  | { type: 'LOAD_MORE_SUCCESS'; payload: { users: State['users']; next: string } }
  | { type: 'LOAD_MORE_FAILURE' }
  | { type: 'REMOVE_USER'; payload: { userId: string } };

const FETCH_LIMIT = 100;

const initialState: State = {
  isLoading: false,
  isLoadingMore: false,
  users: [],
  next: '',
  hasError: false,
  isLoadMoreFailed: false,
};

const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'START_RELOADING':
      return { ...initialState, isLoading: true };
    case 'RELOADING_SUCCESS':
      return { ...state, isLoading: false, hasError: false, ...action.payload };
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

const useMembers = (channelUrl: string) => {
  const appId = useAppId();
  const [state, dispatch] = useReducer(reducer, initialState);
  const reduxDispatch = useReduxDispatch();
  const ongoingRequests = useRef<CancellableAxiosPromise[]>([]);

  const { isLoadingMore, next, users } = state;
  const latestIsLoadingMore = useLatestValue(isLoadingMore);

  const reload = useCallback(
    async (isInitial: boolean = false) => {
      if (!channelUrl) {
        return;
      }

      ongoingRequests.current.forEach((promise) => promise.cancel());
      dispatch({ type: 'START_RELOADING' });

      // For the first time this function is called, the group channel will be fetched by an ancester component.
      if (!isInitial) {
        reduxDispatch(chatActions.fetchGroupChannelRequest(channelUrl));
      }
      const request = fetchGroupChannelsMembers({ appId, channelUrl, token: '', limit: FETCH_LIMIT });
      ongoingRequests.current.push(request);
      try {
        const result = await request;
        if (result == null) {
          // ignore canceled requests
        }

        const {
          data: { members, next },
        } = result;
        dispatch({
          type: 'RELOADING_SUCCESS',
          payload: {
            users: members,
            next,
            count: members.length < FETCH_LIMIT ? members.length : FETCH_LIMIT + Number(!!next),
          },
        });
      } catch (error) {
        dispatch({ type: 'RELOADING_FAILURE' });
      } finally {
        ongoingRequests.current = ongoingRequests.current.filter((item) => item !== request);
      }
    },
    [appId, channelUrl, reduxDispatch],
  );

  useEffect(() => {
    reload(true);
  }, [reload]);

  const loadMore = useCallback(async () => {
    if (!channelUrl || !next || latestIsLoadingMore.current) {
      return;
    }

    dispatch({ type: 'START_LOAD_MORE' });
    const request = fetchGroupChannelsMembers({ appId, channelUrl, token: next, limit: FETCH_LIMIT });
    ongoingRequests.current.push(request);
    try {
      const result = await request;
      if (result == null) {
        // ignore canceled requests
        return;
      }

      const {
        data: { members, next },
      } = result;
      dispatch({ type: 'LOAD_MORE_SUCCESS', payload: { users: members, next } });
    } catch (error) {
      dispatch({ type: 'LOAD_MORE_FAILURE' });
    } finally {
      ongoingRequests.current = ongoingRequests.current.filter((item) => item !== request);
    }
  }, [appId, channelUrl, latestIsLoadingMore, next]);

  const handleMemberStateChange = useCallback(
    (userId: string, type: 'banned' | 'unbanned' | 'muted' | 'unmuted' | 'deactivated') => {
      if ((type === 'banned' || type === 'deactivated') && users.some((user) => user.user_id === userId)) {
        dispatch({ type: 'REMOVE_USER', payload: { userId } });
      }
    },
    [users],
  );

  return {
    state,
    loadMore,
    reload,
    handleMemberStateChange,
  };
};

export type InjectedMembers = ReturnType<typeof useMembers>;
export type InjectedMembersProps = { members: InjectedMembers };

export default useMembers;
