import { DeskActionTypes, IntegrationsActionTypes } from '@actions/types';

const initialState: IntegrationsState = {
  isAddingFacebookPages: false,
  isSubscribingFacebookPages: false,
  isUnsubscribingFacebookPage: false,
  loadedFacebookPages: [],
  fetchFacebookActivePages: { isFetching: false, error: null },
  facebookPages: [],
  isUpdatingFacebookPageSettings: false,
};

export const integrationsReducer: Reducer<IntegrationsState> = (state = initialState, action) => {
  switch (action.type) {
    case IntegrationsActionTypes.FACEBOOK_ADD_PAGES_REQUEST:
      return { ...state, isAddingFacebookPages: true };

    case IntegrationsActionTypes.FACEBOOK_ADD_PAGES_SUCCESS: {
      const currentFacebookPageIds = state.facebookPages.map((page) => page.pageId);
      const newFacebookPages = action.payload.facebookPages.filter(
        (page) => !currentFacebookPageIds.includes(page.pageId),
      );
      return {
        ...state,
        isAddingFacebookPages: false,
        loadedFacebookPages: [],
        facebookPages: state.facebookPages.concat(newFacebookPages),
      };
    }

    case IntegrationsActionTypes.FACEBOOK_ADD_PAGES_FAIL:
      return { ...state, isAddingFacebookPages: false };

    case IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_REQUEST:
      return { ...state, isSubscribingFacebookPages: true };

    case IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_SUCCESS: {
      const currentFacebookPageIds = state.facebookPages.map((page) => page.pageId);
      const newFacebookPages = action.payload.facebookPages.filter(
        (page) => !currentFacebookPageIds.includes(page.pageId),
      );
      return {
        ...state,
        isSubscribingFacebookPages: false,
        loadedFacebookPages: [],
        facebookPages: state.facebookPages.concat(newFacebookPages),
      };
    }

    case IntegrationsActionTypes.FACEBOOK_SUBSCRIBE_FAIL:
      return { ...state, isSubscribingFacebookPages: false };

    case IntegrationsActionTypes.FACEBOOK_LOAD_PAGES_SUCCESS:
      return { ...state, loadedFacebookPages: action.payload.facebookPages };

    case IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_REQUEST:
      return { ...state, isUnsubscribingFacebookPage: true };

    case IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_SUCCESS:
      return {
        ...state,
        isUnsubscribingFacebookPage: false,
        facebookPages: state.facebookPages.filter((page) => {
          return page.pageId !== action.payload.facebookPage.pageId;
        }),
      };

    case IntegrationsActionTypes.FACEBOOK_UNSUBSCRIBE_FAIL:
      return { ...state, isUnsubscribingFacebookPage: false };

    case IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_REQUEST:
      return {
        ...state,
        fetchFacebookActivePages: { ...state.fetchFacebookActivePages, isFetching: true, error: null },
      };

    case IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_SUCCESS:
      return {
        ...state,
        facebookPages: action.payload.facebookPages,
        fetchFacebookActivePages: { isFetching: false, error: null },
      };

    case IntegrationsActionTypes.FACEBOOK_ACTIVE_PAGES_FAIL:
      return { ...state, fetchFacebookActivePages: { isFetching: false, error: action.payload } };

    case IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_REQUEST:
      return { ...state, isUpdatingFacebookPageSettings: true };

    case IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_SUCCESS:
      return {
        ...state,
        isUpdatingFacebookPageSettings: false,
        facebookPages: state.facebookPages.map((page) => {
          if (page.pageId === action.payload.facebookPage.pageId) {
            return action.payload.facebookPage;
          }
          return page;
        }),
      };

    case IntegrationsActionTypes.FACEBOOK_UPDATE_PAGE_SETTINGS_FAIL:
      return { ...state, isUpdatingFacebookPageSettings: false };

    case DeskActionTypes.RESET_DESK:
      return initialState;
    default:
      return state;
  }
};
