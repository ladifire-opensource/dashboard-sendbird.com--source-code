import { WebhooksActionTypes } from '@actions/types';

const initialState: WebhooksState = {
  isFetching: false,
  isGetSignatureFetching: false,
  webhooks: [],
  tempSignature: '',
  error: false,
  errorDetail: undefined,
};

export const webhooksReducer = (state = initialState, action) => {
  switch (action.type) {
    case WebhooksActionTypes.ADD_WEBHOOK_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case WebhooksActionTypes.ADD_WEBHOOK_SUCCESS:
      return {
        ...state,
        error: false,
        errorDetail: undefined,
        isFetching: false,
      };
    case WebhooksActionTypes.ADD_WEBHOOK_FAIL:
      return {
        ...state,
        isFetching: false,
        error: true,
        errorDetail: action.payload,
      };
    case WebhooksActionTypes.EDIT_WEBHOOK_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case WebhooksActionTypes.EDIT_WEBHOOK_SUCCESS:
      return {
        ...state,
        error: false,
        errorDetail: undefined,
        isFetching: false,
      };
    case WebhooksActionTypes.EDIT_WEBHOOK_FAIL:
      return {
        ...state,
        isFetching: false,
        error: true,
        errorDetail: action.payload,
      };
    case WebhooksActionTypes.FETCH_WEBHOOKS_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case WebhooksActionTypes.FETCH_WEBHOOKS_SUCCESS:
      return {
        ...state,
        isFetching: false,
        webhooks: action.payload,
      };
    case WebhooksActionTypes.FETCH_WEBHOOKS_FAIL:
      return {
        ...state,
        isFetching: false,
      };
    case WebhooksActionTypes.SEARCH_WEBHOOK_REQUEST:
      return {
        ...state,
        isFetching: true,
      };
    case WebhooksActionTypes.SEARCH_WEBHOOK_SUCCESS:
      return {
        ...state,
        isFetching: false,
      };
    case WebhooksActionTypes.GET_SIGNATURE_REQUEST:
      return {
        ...state,
        isGetSignatureFetching: true,
      };
    case WebhooksActionTypes.GET_SIGNATURE_SUCCESS:
      return {
        ...state,
        isGetSignatureFetching: false,
        tempSignature: action.payload,
      };
    case WebhooksActionTypes.GET_SIGNATURE_FAIL:
      return {
        ...state,
        isGetSignatureFetching: false,
      };
    default:
      return state;
  }
};
