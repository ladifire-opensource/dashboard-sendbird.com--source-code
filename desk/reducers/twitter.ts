import { TwitterActionTypes } from '@actions/types';

const initialState: TwitterState = {
  twitterUser: null,
};

export const twitterReducer = (state = initialState, action): TwitterState => {
  switch (action.type) {
    case TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_REQUEST: {
      return {
        twitterUser: null,
      };
    }
    case TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_SUCCESS: {
      return {
        ...state,
        twitterUser: action.payload,
      };
    }
    case TwitterActionTypes.FOLLOW_TWITTER_USER_SUCCESS: {
      return {
        ...state,
        twitterUser: {
          ...action.payload,
          following: true,
        },
      };
    }
    case TwitterActionTypes.UNFOLLOW_TWITTER_USER_SUCCESS: {
      return {
        ...state,
        twitterUser: {
          ...action.payload,
          following: false,
        },
      };
    }
    default: {
      return state;
    }
  }
};
