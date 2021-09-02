import { useCallback, useReducer } from 'react';
import { useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { toast } from 'feather';
import unionBy from 'lodash/unionBy';

import { instagramLoadAccounts, getProjectInstagramAccounts, patchInstagramUser } from '@desk/api';
import { useDeskErrorHandler } from '@hooks/useDeskErrorHandler';

type State = {
  instagramAccounts: InstagramAccount[];
  isFetchingInstagramAccounts: boolean;
  isPatchingInstagramAccounts: boolean;
  fetchInstagramAccountsError: string | null;
  patchInstagramAccountsError: string | null;
};

type Action =
  | { type: 'SET_INSTAGRAM_ACCOUNTS'; payload: State['instagramAccounts'] }
  | { type: 'FETCH_INSTAGRAM_ACCOUNTS_REQUEST' }
  | { type: 'FETCH_INSTAGRAM_ACCOUNTS_SUCCESS'; payload: State['instagramAccounts'] }
  | { type: 'FETCH_INSTAGRAM_ACCOUNTS_FAIL'; payload: string }
  | { type: 'ADD_INSTAGRAM_ACCOUNT_REQUEST' }
  | { type: 'ADD_INSTAGRAM_ACCOUNT_SUCCESS'; payload: InstagramAccount[] }
  | { type: 'ADD_INSTAGRAM_ACCOUNT_FAIL'; payload: string }
  | { type: 'PATCH_INSTAGRAM_ACCOUNT_REQUEST' }
  | { type: 'PATCH_INSTAGRAM_ACCOUNT_SUCCESS'; payload: InstagramAccount }
  | { type: 'PATCH_INSTAGRAM_ACCOUNT_FAIL'; payload: string };

export const InstagramIntegrationInitialState: State = {
  instagramAccounts: [],
  isFetchingInstagramAccounts: false,
  isPatchingInstagramAccounts: false,
  fetchInstagramAccountsError: null,
  patchInstagramAccountsError: null,
};

const instagramIntegrationReducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_INSTAGRAM_ACCOUNTS':
      return { ...state, instagramAccounts: action.payload };
    case 'FETCH_INSTAGRAM_ACCOUNTS_REQUEST':
      return { ...state, isFetchingInstagramAccounts: true, fetchInstagramAccountsError: null };
    case 'FETCH_INSTAGRAM_ACCOUNTS_SUCCESS':
      return {
        ...state,
        isFetchingInstagramAccounts: false,
        instagramAccounts: action.payload,
        fetchInstagramAccountsError: null,
      };
    case 'ADD_INSTAGRAM_ACCOUNT_REQUEST':
      return { ...state, isPatchingInstagramAccounts: true, fetchInstagramAccountsError: null };
    case 'ADD_INSTAGRAM_ACCOUNT_SUCCESS': {
      return {
        ...state,
        isPatchingInstagramAccounts: false,
        instagramAccounts: unionBy(action.payload, state.instagramAccounts, 'id'),
      };
    }

    case 'PATCH_INSTAGRAM_ACCOUNT_REQUEST':
      return { ...state, isPatchingInstagramAccounts: true, patchInstagramAccountsError: null };

    case 'PATCH_INSTAGRAM_ACCOUNT_SUCCESS':
      return {
        ...state,
        isPatchingInstagramAccounts: false,
        instagramAccounts: state.instagramAccounts.map((account) => {
          if (account.id === action.payload.id) {
            return action.payload;
          }
          return account;
        }),
      };

    case 'FETCH_INSTAGRAM_ACCOUNTS_FAIL':
      return {
        ...state,
        isFetchingInstagramAccounts: false,
        isPatchingInstagramAccounts: false,
        fetchInstagramAccountsError: action.payload,
      };

    case 'ADD_INSTAGRAM_ACCOUNT_FAIL':
    case 'PATCH_INSTAGRAM_ACCOUNT_FAIL':
      return {
        ...state,
        isFetchingInstagramAccounts: false,
        isPatchingInstagramAccounts: false,
        patchInstagramAccountsError: action.payload,
      };

    default:
      return state;
  }
};

export const useInstagramReducer = (options: { pid: string; region: string }) => {
  const [state, dispatch] = useReducer(instagramIntegrationReducer, InstagramIntegrationInitialState);
  const { getErrorMessage } = useDeskErrorHandler();
  const { pid, region } = options;
  const history = useHistory();
  const intl = useIntl();

  const fetchInstagramAccounts = useCallback(async () => {
    dispatch({ type: 'FETCH_INSTAGRAM_ACCOUNTS_REQUEST' });
    try {
      const {
        data: { results },
      } = await getProjectInstagramAccounts(pid, region);

      if (!Array.isArray(results)) {
        dispatch({ type: 'FETCH_INSTAGRAM_ACCOUNTS_FAIL', payload: '' });
        throw new Error(intl.formatMessage({ id: 'desk.settings.integration.instagram.toast.fetch.fail' }));
      }
      dispatch({ type: 'FETCH_INSTAGRAM_ACCOUNTS_SUCCESS', payload: results });
    } catch (error) {
      dispatch({ type: 'FETCH_INSTAGRAM_ACCOUNTS_FAIL', payload: getErrorMessage(error) });
    }
  }, [getErrorMessage, intl, pid, region]);

  const addInstagramAccountsRequest = useCallback(
    async ({ accessToken, onSuccessNavigateTo, onError }) => {
      dispatch({ type: 'ADD_INSTAGRAM_ACCOUNT_REQUEST' });
      try {
        const { data } = await instagramLoadAccounts(pid, region, { accessToken });
        if (!Array.isArray(data) || data.length === 0) {
          dispatch({ type: 'ADD_INSTAGRAM_ACCOUNT_FAIL', payload: '' });
          throw new Error(intl.formatMessage({ id: 'desk.settings.integration.instagram.toast.add.fail' }));
        }

        dispatch({ type: 'ADD_INSTAGRAM_ACCOUNT_SUCCESS', payload: data });
        toast.success({
          message: intl.formatMessage({ id: 'desk.settings.integration.instagram.toast.add.success.register' }),
        });
        onSuccessNavigateTo && history.push(onSuccessNavigateTo);
      } catch (error) {
        onError && onError(error.data.code);
        dispatch({ type: 'ADD_INSTAGRAM_ACCOUNT_FAIL', payload: getErrorMessage(error) });
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, history, intl, pid, region],
  );

  const patchInstagramAccountRequest = useCallback(
    async ({ instagramUserId, isCommentEnabled, status, onSuccess }) => {
      dispatch({ type: 'PATCH_INSTAGRAM_ACCOUNT_REQUEST' });
      try {
        const { data } = await patchInstagramUser(pid, region, { instagramUserId, isCommentEnabled, status });
        if (!data) {
          throw new Error(intl.formatMessage({ id: 'desk.settings.integration.instagram.toast.patch.fail' }));
        }
        dispatch({ type: 'PATCH_INSTAGRAM_ACCOUNT_SUCCESS', payload: data });
        toast.success({
          message: intl.formatMessage({
            id:
              status === 'INACTIVE'
                ? 'desk.settings.integration.instagram.toast.inactive.success'
                : 'desk.settings.integration.instagram.toast.patch.success',
          }),
        });
        onSuccess?.(data);
      } catch (error) {
        dispatch({ type: 'PATCH_INSTAGRAM_ACCOUNT_FAIL', payload: getErrorMessage(error) });
        toast.error({ message: getErrorMessage(error) });
      }
    },
    [getErrorMessage, intl, pid, region],
  );

  return {
    state,
    dispatch,
    actions: {
      fetchInstagramAccounts,
      addInstagramAccountsRequest,
      patchInstagramAccountRequest,
    },
  };
};
