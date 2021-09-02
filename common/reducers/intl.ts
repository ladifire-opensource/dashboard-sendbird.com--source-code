import { languages } from '@/intl';
import { IntlActionTypes } from '@actions/types';
import { DEFAULT_LOCALE } from '@constants';

const initialState: IntlState = {
  language: languages[DEFAULT_LOCALE],
};

export const intlReducer = (state: IntlState = initialState, action) => {
  switch (action.type) {
    case IntlActionTypes.SELECT_LOCALE:
      return {
        ...state,
        language: languages[action.payload] || initialState.language,
      };
    default:
      return state;
  }
};
