import { useEffect, Reducer, useReducer, useCallback, useLayoutEffect } from 'react';

import { DialogType } from '@common/containers/dialogs/DialogType';
import { fetchUser } from '@core/api';
import { useShowDialog, useAppId } from '@hooks';

import { loadUserIdsFromLocalStorage, updateLocalStorage, LocalStorageUpdateAction } from './localStorageUtils';

export enum FetchFailureReason {
  Deleted,
  Else,
}

export type MobileAppUserListItem = {
  userId: string;
  isFetching: boolean;
  fetchFailureReason?: FetchFailureReason;
  data?: SDKUser;
};

type State = MobileAppUserListItem[];

type Action =
  | { type: 'SET_USER_IDS'; payload: string[] }
  | { type: 'UPDATE_SDK_USER'; payload: SDKUser }
  | { type: 'ADD_MISSING_USER_ID'; payload: string }
  | { type: 'MARK_USER_ID_FAILED_TO_FETCH'; payload: string }
  | { type: 'MARK_USER_ID_FETCHING'; payload: string }
  | { type: 'ADD_USER'; payload: SDKUser }
  | { type: 'ADD_USERS'; payload: SDKUser[] }
  | { type: 'REMOVE_USER'; payload: string };

const mutateTargetUserIdWithState = (state: State) => (
  userId: string,
  mutator: (currentValue: MobileAppUserListItem) => MobileAppUserListItem,
) => state.map((item) => (item.userId === userId ? mutator(item) : item));

const reducer: Reducer<State, Action> = (state, action) => {
  const mutateTargetUserId = mutateTargetUserIdWithState(state);

  switch (action.type) {
    case 'SET_USER_IDS':
      return action.payload.map((userId) => ({ userId, isFetching: false }));

    case 'UPDATE_SDK_USER':
      return mutateTargetUserId(action.payload.user_id, (item) => ({
        ...item,
        data: action.payload,
        isFetching: false,
        fetchFailureReason: undefined,
      }));

    case 'ADD_MISSING_USER_ID':
      return mutateTargetUserId(action.payload, (item) => ({
        ...item,
        data: undefined,
        isFetching: false,
        fetchFailureReason: FetchFailureReason.Deleted,
      }));

    case 'MARK_USER_ID_FAILED_TO_FETCH':
      return mutateTargetUserId(action.payload, (item) => ({
        ...item,
        data: undefined,
        isFetching: false,
        fetchFailureReason: FetchFailureReason.Else,
      }));

    case 'MARK_USER_ID_FETCHING':
      return mutateTargetUserId(action.payload, (item) => ({ ...item, isFetching: true }));

    case 'ADD_USER':
      return [...state, { userId: action.payload.user_id, data: action.payload, isFetching: false }];

    case 'ADD_USERS':
      return [...state, ...action.payload.map((user) => ({ userId: user.user_id, data: user, isFetching: false }))];

    case 'REMOVE_USER':
      return state.filter((item) => item.userId !== action.payload);

    default:
      return state;
  }
};

export const useMobileAppUsers = () => {
  const appId = useAppId();
  const [items, dispatch] = useReducer(reducer, []);

  useLayoutEffect(() => {
    dispatch({ type: 'SET_USER_IDS', payload: appId ? loadUserIdsFromLocalStorage(appId) : [] });
  }, [appId]);

  const reloadUser = useCallback(
    async (userId) => {
      try {
        dispatch({ type: 'MARK_USER_ID_FETCHING', payload: userId });
        const { data } = await fetchUser({ appId, userId });
        dispatch({ type: 'UPDATE_SDK_USER', payload: data });
      } catch (error) {
        if (error.data?.code === 400201) {
          // resource not found
          dispatch({ type: 'ADD_MISSING_USER_ID', payload: userId });
        } else {
          dispatch({ type: 'MARK_USER_ID_FAILED_TO_FETCH', payload: userId });
        }
      }
    },
    [appId],
  );

  const addUser = useCallback(
    (user: SDKUser) => {
      updateLocalStorage(LocalStorageUpdateAction.Add, appId, user.user_id);
      dispatch({ type: 'ADD_USER', payload: user });
    },
    [appId],
  );

  useEffect(() => {
    const unfetchedUserIds = items
      .filter(({ isFetching, fetchFailureReason, data }) => data == null && !isFetching && fetchFailureReason == null)
      .map((v) => v.userId);

    unfetchedUserIds.forEach(reloadUser);
  }, [appId, items, reloadUser]);

  const showDialog = useShowDialog();

  const showCreateUserDialog = useShowDialog({
    dialogTypes: DialogType.CallsStudioMobileCreateUser,
    dialogProps: { onSuccess: addUser },
  });

  const showEditUserDialog = (user: SDKUser) => {
    showDialog({
      dialogTypes: DialogType.CallsStudioMobileEditUser,
      dialogProps: {
        user,
        onSuccess: (updatedUser) => {
          dispatch({ type: 'UPDATE_SDK_USER', payload: updatedUser });
        },
      },
    });
  };

  const showAddExistingUserDialog = useShowDialog({
    dialogTypes: DialogType.CallsStudioMobileAddUser,
    dialogProps: {
      onSuccess: (users: SDKUser[]) => {
        users.forEach((user) => updateLocalStorage(LocalStorageUpdateAction.Add, appId, user.user_id));
        dispatch({ type: 'ADD_USERS', payload: users });
      },
    },
  });

  const showRemoveUserDialog = (userId: string) => {
    showDialog({
      dialogTypes: DialogType.CallsStudioMobileRemoveUser,
      dialogProps: {
        onConfirm: () => {
          updateLocalStorage(LocalStorageUpdateAction.Delete, appId, userId);
          dispatch({ type: 'REMOVE_USER', payload: userId });
        },
      },
    });
  };

  return {
    items,
    showCreateUserDialog,
    showEditUserDialog,
    showAddExistingUserDialog,
    showRemoveUserDialog,
    reloadUser,
    addUser,
  };
};
