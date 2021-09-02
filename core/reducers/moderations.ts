import { AuthenticationActionTypes, ApplicationActionTypes, SDKUserActionTypes } from '@actions/types';

const initialState: ModerationsState = {
  isFetched: false,
  sdkUser: null,
  fetchRequestError: null,
  updateRequest: { isPending: false, error: null },
  createRequest: { isPending: false, error: null },
  removeRequest: { isPending: false, error: null },
};

export const moderationsReducer: Reducer<ModerationsState> = (state = initialState, action) => {
  switch (action.type) {
    case SDKUserActionTypes.FETCH_SDK_USER_SUCCESS:
      return {
        ...state,
        isFetched: true,
        sdkUser: action.payload,
        fetchRequestError: null,
      };

    case SDKUserActionTypes.FETCH_SDK_USER_FAIL:
      return {
        ...state,
        isFetched: true,
        sdkUser: null,
        fetchRequestError: action.payload,
      };

    case SDKUserActionTypes.CREATE_SDK_USER_REQUEST:
      return {
        ...state,
        createRequest: { isPending: true, error: null },
      };

    case SDKUserActionTypes.CREATE_SDK_USER_SUCCESS:
      return {
        ...state,
        isFetched: true,
        sdkUser: action.payload,
        createRequest: { isPending: false, error: null },
        fetchRequestError: null,
      };

    case SDKUserActionTypes.CREATE_SDK_USER_FAIL:
      return {
        ...state,
        createRequest: { isPending: false, error: action.payload },
      };

    case SDKUserActionTypes.UPDATE_SDK_USER_REQUEST:
      return {
        ...state,
        updateRequest: { isPending: true, error: null },
      };

    case SDKUserActionTypes.UPDATE_SDK_USER_SUCCESS:
      return {
        ...state,
        sdkUser: { ...state.sdkUser, ...action.payload },
        updateRequest: { isPending: false, error: null },
        fetchRequestError: null,
      };

    case SDKUserActionTypes.UPDATE_SDK_USER_FAIL:
      return {
        ...state,
        updateRequest: { isPending: false, error: action.payload },
      };

    case SDKUserActionTypes.REMOVE_SDK_USER_REQUEST:
      return {
        ...state,
        removeRequest: { isPending: true, error: null },
      };

    case SDKUserActionTypes.REMOVE_SDK_USER_SUCCESS:
      return {
        ...state,
        isFetched: false,
        sdkUser: null,
        removeRequest: { isPending: false, error: null },
        fetchRequestError: null,
      };

    case SDKUserActionTypes.REMOVE_SDK_USER_FAIL:
      return {
        ...state,
        removeRequest: { isPending: false, error: action.payload },
      };

    case ApplicationActionTypes.CREATE_APP_SUCCESS:
      return {
        ...state,
        isFetched: false,
        sdkUser: null,
      };
    case ApplicationActionTypes.RESET_APPLICATION_SUCCESS:
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
