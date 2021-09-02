import { AuthenticationActionTypes, DeskActionTypes } from '@actions/types';

const initialState = {
  isMacroShow: false,
  isMacroConfirmShow: false,
  activeMacro: null,
  items: [],
  pagination: {
    limit: 10,
    offset: 0,
    count: 0,
  },
  result: [],
  keywords: [],
  messages: {},
};

export const macrosReducer = (state: MacrosState = initialState, action) => {
  switch (action.type) {
    case DeskActionTypes.SET_MACRO_SHOW:
      return {
        ...state,
        isMacroShow: action.payload,
      };
    case DeskActionTypes.SET_MACRO_CONFIRM_SHOW:
      return {
        ...state,
        isMacroConfirmShow: action.payload,
      };
    case DeskActionTypes.SET_ACTIVE_MACRO:
      return {
        ...state,
        activeMacro: action.payload,
      };
    case DeskActionTypes.FETCH_MACROS_SUCCESS:
      return {
        ...state,
        items: action.payload.results,
      };
    case DeskActionTypes.SEARCH_MACROS_SUCCESS: {
      const messages = {};
      action.payload.forEach((macro) => {
        messages[macro.name] = macro;
      });
      return {
        ...state,
        result: action.payload,
        keywords: action.payload.map((macro) => {
          return macro.name;
        }),
        messages,
      };
    }
    case DeskActionTypes.SET_MACROS_PAGINATION:
      return {
        ...state,
        pagination: {
          limit: action.payload.limit,
          offset: action.payload.offset,
          count: state.pagination.count,
        },
      };
    case AuthenticationActionTypes.UNAUTHENTICATED:
      return initialState;
    default:
      return state;
  }
};
