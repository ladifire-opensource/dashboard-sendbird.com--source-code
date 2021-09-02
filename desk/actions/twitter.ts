import { createAction } from '@actions/createAction';
import { TwitterActionTypes } from '@actions/types';

export const TwitterActions: TwitterActionCreators = {
  fetchTwitterUserDetailRequest: (payload) =>
    createAction(TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_REQUEST, payload),
  fetchTwitterUserDetailSuccess: (payload) =>
    createAction(TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_SUCCESS, payload),
  fetchTwitterUserDetailFail: (payload) =>
    createAction(TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_FAIL, payload),
  fetchTwitterUserDetailCancel: (payload) =>
    createAction(TwitterActionTypes.FETCH_TICKET_TWITTER_USER_DETAIL_CANCEL, payload),

  followTwitterUserRequest: (payload) => createAction(TwitterActionTypes.FOLLOW_TWITTER_USER_REQUEST, payload),
  followTwitterUserSuccess: (payload) => createAction(TwitterActionTypes.FOLLOW_TWITTER_USER_SUCCESS, payload),
  followTwitterUserFail: (payload) => createAction(TwitterActionTypes.FOLLOW_TWITTER_USER_FAIL, payload),
  followTwitterUserCancel: (payload) => createAction(TwitterActionTypes.FOLLOW_TWITTER_USER_CANCEL, payload),

  unfollowTwitterUserRequest: (payload) => createAction(TwitterActionTypes.UNFOLLOW_TWITTER_USER_REQUEST, payload),
  unfollowTwitterUserSuccess: (payload) => createAction(TwitterActionTypes.UNFOLLOW_TWITTER_USER_SUCCESS, payload),
  unfollowTwitterUserFail: (payload) => createAction(TwitterActionTypes.UNFOLLOW_TWITTER_USER_FAIL, payload),
  unfollowTwitterUserCancel: (payload) => createAction(TwitterActionTypes.UNFOLLOW_TWITTER_USER_CANCEL, payload),
};
