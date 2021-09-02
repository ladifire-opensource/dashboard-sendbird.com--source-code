import { createContext, useCallback, useReducer } from 'react';

import { toast } from 'feather';
import lowerCase from 'lodash/lowerCase';
import upperFirst from 'lodash/upperFirst';

import {
  createMemberRole,
  deleteMemberRole,
  fetchMemberRole,
  fetchMemberRoles,
  fetchPermissions,
  editMemberRole,
  fetchMemberRoleByName,
} from '@common/api';
import { getErrorMessage } from '@epics';

export const getPermissionLevel = (permission): PermissionLevel => {
  return permission.split('.').slice(permission.split('.').length - 1, permission.split('.').length)[0];
};

export const getPermissionPageName = (permission: PermissionKey) => {
  const parsed = upperFirst(
    lowerCase(permission.split('.').slice(permission.split('.').length - 2, permission.split('.').length - 1)[0]),
  );
  return parsed.includes('channel') ? `${parsed}s` : parsed;
};

const getPermissions = (permissions) => {
  return permissions.reduce((result, permission) => {
    const { key } = permission;
    const category = key.split('.')[0];
    if (!result[category]) {
      result[category] = {
        levels: [],
        pages: {},
      };
    }
    if (!result[category].pages[getPermissionPageName(key)]) {
      result[category].pages[getPermissionPageName(key)] = [];
    }
    if (result[category].levels.indexOf(getPermissionLevel(key)) === -1) {
      result[category].levels.push(getPermissionLevel(key));
      result[category].levels.sort();
    }
    if (result[category].pages[getPermissionPageName(key)].findIndex((permission) => permission.key === key) === -1) {
      result[category].pages[getPermissionPageName(key)].push(permission);
    }
    return result;
  }, {} as AvailablePermissions);
};

type State = {
  isFetchingRoles: boolean;
  isFetchingRole: boolean;
  isFetchingForm: boolean;
  isFetchingPermissions: boolean;
  currentRole: MemberRole | null;
  memberRoles: MemberRole[];
  availablePermissions: Permission[] | null;
  total: number;
};

type Action =
  | { type: 'FETCH_MEMBER_ROLES_REQUEST'; payload: FetchMemberRolesPayload }
  | { type: 'FETCH_MEMBER_ROLES_SUCCESS'; payload: any }
  | { type: 'FETCH_MEMBER_ROLES_FAIL' }
  | { type: 'FETCH_MEMBER_ROLE_REQUEST' }
  | { type: 'FETCH_MEMBER_ROLE_SUCCESS'; payload: MemberRole }
  | { type: 'FETCH_MEMBER_ROLE_FAIL' }
  | { type: 'CREATE_MEMBER_ROLE_REQUEST'; payload: CreateMemberRolePayload }
  | { type: 'CREATE_MEMBER_ROLE_SUCCESS' }
  | { type: 'CREATE_MEMBER_ROLE_FAIL' }
  | { type: 'EDIT_MEMBER_ROLE_REQUEST' }
  | { type: 'EDIT_MEMBER_ROLE_SUCCESS' }
  | { type: 'EDIT_MEMBER_ROLE_FAIL' }
  | { type: 'DELETE_MEMBER_ROLE_REQUEST'; payload: any }
  | { type: 'DELETE_MEMBER_ROLE_SUCCESS' }
  | { type: 'DELETE_MEMBER_ROLE_FAIL' }
  | { type: 'SET_CURRENT_ROLE'; payload: MemberRole | null }
  | { type: 'FETCH_PERMISSIONS_REQUEST'; payload: FetchPermissionsPayload }
  | { type: 'FETCH_PERMISSIONS_SUCCESS'; payload: any }
  | { type: 'FETCH_PERMISSIONS_FAIL' };

export const RolesInitialState: State = {
  isFetchingRoles: false,
  isFetchingRole: false,
  isFetchingForm: false,
  isFetchingPermissions: false,
  currentRole: null,
  memberRoles: [],
  availablePermissions: null,

  total: 0,
};

const rolesReducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    case 'CREATE_MEMBER_ROLE_REQUEST':
      return { ...state, isFetchingForm: true };
    case 'CREATE_MEMBER_ROLE_SUCCESS':
    case 'CREATE_MEMBER_ROLE_FAIL':
      return { ...state, isFetchingForm: false };
    case 'EDIT_MEMBER_ROLE_REQUEST':
      return { ...state, isFetchingForm: true };
    case 'EDIT_MEMBER_ROLE_SUCCESS':
    case 'EDIT_MEMBER_ROLE_FAIL':
      return { ...state, isFetchingForm: false };
    case 'FETCH_MEMBER_ROLES_REQUEST':
      return { ...state, isFetchingRoles: true };
    case 'FETCH_MEMBER_ROLES_SUCCESS':
      return { ...state, isFetchingRoles: false, memberRoles: action.payload.results, total: action.payload.count };
    case 'FETCH_MEMBER_ROLES_FAIL':
      return { ...state, isFetchingRoles: false };
    case 'FETCH_MEMBER_ROLE_REQUEST':
      return { ...state, isFetchingRole: true };
    case 'FETCH_MEMBER_ROLE_SUCCESS':
      return { ...state, isFetchingRole: false, currentRole: action.payload };
    case 'FETCH_MEMBER_ROLE_FAIL':
      return { ...state, isFetchingRole: false };
    case 'SET_CURRENT_ROLE':
      return { ...state, currentRole: action.payload };
    case 'FETCH_PERMISSIONS_REQUEST':
      return { ...state, isFetchingPermissions: true };
    case 'FETCH_PERMISSIONS_SUCCESS':
      return { ...state, isFetchingPermissions: false, availablePermissions: action.payload };
    default:
      return state;
  }
};

const showErrorToast = (error: any) => toast.error({ message: getErrorMessage(error) });

export const useRolesReducer = () => {
  const [state, dispatch] = useReducer(rolesReducer, RolesInitialState);

  const fetchMemberRolesRequest = useCallback(async (payload: { uid: string; limit: number; offset: number }) => {
    dispatch({ type: 'FETCH_MEMBER_ROLES_REQUEST', payload });
    try {
      const response = await fetchMemberRoles(payload);
      dispatch({ type: 'FETCH_MEMBER_ROLES_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_MEMBER_ROLES_FAIL' });
      showErrorToast(error);
    }
  }, []);

  const fetchMemberRoleRequest = useCallback(async (roleId: string) => {
    dispatch({ type: 'FETCH_MEMBER_ROLE_REQUEST' });
    try {
      const response = await fetchMemberRole(roleId);
      dispatch({ type: 'FETCH_MEMBER_ROLE_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_MEMBER_ROLE_FAIL' });
      showErrorToast(error);
    }
  }, []);

  const fetchMemberRoleByNameRequest = useCallback(async (roleName: string) => {
    dispatch({ type: 'FETCH_MEMBER_ROLE_REQUEST' });
    try {
      const response = await fetchMemberRoleByName(roleName);
      dispatch({ type: 'FETCH_MEMBER_ROLE_SUCCESS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'FETCH_MEMBER_ROLE_FAIL' });
      showErrorToast(error);
    }
  }, []);

  const createMemberRoleRequest = useCallback(async (payload: CreateMemberRolePayload, onSuccess?: () => void) => {
    dispatch({ type: 'CREATE_MEMBER_ROLE_REQUEST', payload });
    try {
      await createMemberRole(payload);
      dispatch({ type: 'CREATE_MEMBER_ROLE_SUCCESS' });
      onSuccess?.();
    } catch (error) {
      dispatch({ type: 'CREATE_MEMBER_ROLE_FAIL' });
      showErrorToast(error);
    }
  }, []);

  const editMemberRoleRequest = useCallback(
    async (payload: { roleId; payload: CreateMemberRolePayload }, onSuccess?: () => void) => {
      dispatch({ type: 'EDIT_MEMBER_ROLE_REQUEST' });
      try {
        await editMemberRole(payload);
        dispatch({ type: 'EDIT_MEMBER_ROLE_SUCCESS' });
        onSuccess?.();
      } catch (error) {
        dispatch({ type: 'EDIT_MEMBER_ROLE_FAIL' });
        showErrorToast(error);
      }
    },
    [],
  );

  const deleteMemberRoleRequest = useCallback(async (payload: any) => {
    dispatch({ type: 'DELETE_MEMBER_ROLE_REQUEST', payload });
    try {
      await deleteMemberRole(payload);
      dispatch({ type: 'DELETE_MEMBER_ROLE_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'DELETE_MEMBER_ROLE_FAIL' });
      showErrorToast(error);
    }
  }, []);

  const setCurrentRole = useCallback((payload: MemberRole | null) => {
    dispatch({ type: 'SET_CURRENT_ROLE', payload });
  }, []);

  const fetchPermissionsRequest = useCallback(async (payload: Organization['uid']) => {
    dispatch({ type: 'FETCH_PERMISSIONS_REQUEST', payload });
    try {
      const response = await fetchPermissions(payload);
      dispatch({ type: 'FETCH_PERMISSIONS_SUCCESS', payload: getPermissions(response.data) });
    } catch (error) {
      dispatch({ type: 'FETCH_PERMISSIONS_FAIL' });
      showErrorToast(error);
    }
  }, []);

  return {
    state,
    dispatch,
    actions: {
      fetchMemberRolesRequest,
      fetchMemberRoleRequest,
      fetchMemberRoleByNameRequest,
      createMemberRoleRequest,
      editMemberRoleRequest,
      deleteMemberRoleRequest,
      setCurrentRole,
      fetchPermissionsRequest,
      getPermissionLevel,
    },
  };
};

// @ts-ignore Rect.createContext doesn't require default value
export const RolesContext = createContext<ReturnType<typeof useRolesReducer>>();
