import { useCallback, useReducer } from 'react';

import { getProjectTwitterUsers, getTwitterOauthToken, patchTwitterUser, subscribeTwitter } from '@desk/api';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';
import { ClientStorage } from '@utils';

type State = {
  twitterUsers: TwitterUser[];
  isFetchingTwitterUsers: boolean;
  fetchTwitterUsersError: string | null;
  isFetchingTwitterOauthToken: boolean;
  isFetchingSubscribeTwitter: boolean;
  pendingUnsubscribeTwitterIDs: TwitterUser['id'][];
  isPatchingTwitterUser: boolean;
};

type Action =
  | { type: 'SET_TWITTER_USERS'; payload: State['twitterUsers'] }
  | { type: 'FETCH_TWITTER_USERS_REQUEST' }
  | { type: 'FETCH_TWITTER_USERS_SUCCESS'; payload: State['twitterUsers'] }
  | { type: 'FETCH_TWITTER_USERS_FAIL'; payload: string }
  | { type: 'ADD_TWITTER_USER'; payload: TwitterUser }
  | { type: 'AUTHENTICATE_TWITTER_REQUEST' }
  | { type: 'AUTHENTICATE_TWITTER_DONE' }
  | { type: 'SUBSCRIBE_TWITTER_REQUEST' }
  | { type: 'SUBSCRIBE_TWITTER_DONE' }
  | { type: 'UNSUBSCRIBE_TWITTER_REQUEST'; payload: TwitterUser['id'] }
  | { type: 'UNSUBSCRIBE_TWITTER_SUCCESS'; payload: TwitterUser['id'] }
  | { type: 'UNSUBSCRIBE_TWITTER_FAIL'; payload: TwitterUser['id'] }
  | { type: 'PATCH_TWITTER_USER_REQUEST'; payload: PatchTwitterUserPayload }
  | { type: 'PATCH_TWITTER_USER_SUCCESS'; payload: TwitterUser }
  | { type: 'PATCH_TWITTER_USER_FAIL' };

export const TwitterIntegrationInitialState: State = {
  isFetchingTwitterUsers: false,
  isFetchingTwitterOauthToken: false,
  isFetchingSubscribeTwitter: false,
  fetchTwitterUsersError: null,
  pendingUnsubscribeTwitterIDs: [],
  twitterUsers: [],
  isPatchingTwitterUser: false,
};

const twitterIntegrationReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_TWITTER_USERS':
      return { ...state, twitterUsers: action.payload };
    case 'FETCH_TWITTER_USERS_REQUEST':
      return { ...state, isFetchingTwitterUsers: true, fetchTwitterUsersError: null };
    case 'FETCH_TWITTER_USERS_SUCCESS':
      return { ...state, isFetchingTwitterUsers: false, twitterUsers: action.payload, fetchTwitterUsersError: null };
    case 'FETCH_TWITTER_USERS_FAIL':
      return { ...state, isFetchingTwitterUsers: false, fetchTwitterUsersError: action.payload };
    case 'ADD_TWITTER_USER':
      return { ...state, twitterUsers: [...state.twitterUsers, action.payload] };
    case 'AUTHENTICATE_TWITTER_REQUEST':
      return { ...state, isFetchingTwitterOauthToken: true };
    case 'AUTHENTICATE_TWITTER_DONE':
      return { ...state, isFetchingTwitterOauthToken: false };
    case 'SUBSCRIBE_TWITTER_REQUEST':
      return { ...state, isFetchingSubscribeTwitter: true };
    case 'SUBSCRIBE_TWITTER_DONE':
      return { ...state, isFetchingSubscribeTwitter: false };
    case 'UNSUBSCRIBE_TWITTER_REQUEST':
      return { ...state, pendingUnsubscribeTwitterIDs: [...state.pendingUnsubscribeTwitterIDs, action.payload] };
    case 'UNSUBSCRIBE_TWITTER_SUCCESS':
      return {
        ...state,
        twitterUsers: state.twitterUsers.filter((twitterUser) => twitterUser.id !== action.payload),
        pendingUnsubscribeTwitterIDs: state.pendingUnsubscribeTwitterIDs.filter((id) => id !== action.payload),
      };
    case 'UNSUBSCRIBE_TWITTER_FAIL':
      return {
        ...state,
        pendingUnsubscribeTwitterIDs: state.pendingUnsubscribeTwitterIDs.filter((id) => id !== action.payload),
      };
    case 'PATCH_TWITTER_USER_REQUEST':
      return { ...state, isPatchingTwitterUser: true };
    case 'PATCH_TWITTER_USER_SUCCESS':
      return {
        ...state,
        isPatchingTwitterUser: false,
        twitterUsers: state.twitterUsers.map((twitterUser) =>
          twitterUser.id === action.payload.id ? action.payload : twitterUser,
        ),
      };
    case 'PATCH_TWITTER_USER_FAIL':
      return { ...state, isPatchingTwitterUser: false };
    default:
      return state;
  }
};

export const useTwitterReducer = (options: { pid: string; region: string }) => {
  const [state, dispatch] = useReducer(twitterIntegrationReducer, TwitterIntegrationInitialState);
  const { pid, region } = options;
  const { getErrorMessage } = useDeskErrorHandler();

  const fetchTwitterUsers = useCallback(async () => {
    dispatch({ type: 'FETCH_TWITTER_USERS_REQUEST' });
    try {
      const {
        data: { results },
      } = await getProjectTwitterUsers(pid, region);
      dispatch({ type: 'FETCH_TWITTER_USERS_SUCCESS', payload: results });
    } catch (error) {
      dispatch({ type: 'FETCH_TWITTER_USERS_FAIL', payload: getErrorMessage(error) });
    }
  }, [getErrorMessage, pid, region]);

  const authenticateTwitter = useCallback(
    async (callbackRedirectPathname: string) => {
      dispatch({ type: 'AUTHENTICATE_TWITTER_REQUEST' });
      try {
        const {
          data: { oauth_token },
        } = await getTwitterOauthToken(pid, region);
        ClientStorage.set('twitterCallbackRedirectPathname', callbackRedirectPathname);
        location.assign(`https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`);
      } finally {
        dispatch({ type: 'AUTHENTICATE_TWITTER_DONE' });
      }
    },
    [pid, region],
  );

  const subscribeTwitterRequest = useCallback(
    async (options: { oauth_token: string; oauth_verifier: string }) => {
      dispatch({ type: 'SUBSCRIBE_TWITTER_REQUEST' });
      try {
        await subscribeTwitter(pid, region, options);
        return fetchTwitterUsers();
      } finally {
        dispatch({ type: 'SUBSCRIBE_TWITTER_DONE' });
      }
    },
    [pid, region, fetchTwitterUsers],
  );

  const removeTwitterAccount = useCallback(
    async (id: number) => {
      dispatch({ type: 'UNSUBSCRIBE_TWITTER_REQUEST', payload: id });
      try {
        await patchTwitterUser(pid, region, { id, status: 'UNSUBSCRIBED' });
        dispatch({ type: 'UNSUBSCRIBE_TWITTER_SUCCESS', payload: id });
      } catch (error) {
        dispatch({ type: 'UNSUBSCRIBE_TWITTER_FAIL', payload: id });
        throw error;
      }
    },
    [pid, region],
  );

  const patchTwitterAccount = useCallback(
    async (id: number, updates: Partial<Pick<TwitterUser, 'isDirectMessageEventEnabled' | 'isStatusEnabled'>>) => {
      dispatch({ type: 'PATCH_TWITTER_USER_REQUEST', payload: { id, ...updates } });
      try {
        const { data } = await patchTwitterUser(pid, region, { id, ...updates });
        dispatch({ type: 'PATCH_TWITTER_USER_SUCCESS', payload: data });
      } catch (error) {
        dispatch({ type: 'PATCH_TWITTER_USER_FAIL' });
        throw error;
      }
    },
    [pid, region],
  );

  return {
    state,
    dispatch,
    actions: {
      fetchTwitterUsers,
      authenticateTwitter,
      subscribeTwitterRequest,
      removeTwitterAccount,
      patchTwitterAccount,
    },
  };
};
