import { ofType } from 'redux-observable';
import { of, from, forkJoin, iif } from 'rxjs';
import { mergeMap, map, catchError, withLatestFrom } from 'rxjs/operators';

import { commonActions, chatActions } from '@actions';
import { ChannelsActionTypes, NotificationsActionTypes } from '@actions/types';
import {
  createOpenChannel,
  fetchMetadata,
  setMetadata,
  fetchOpenChannels,
  searchOpenChannels,
  fetchOpenChannel,
  fetchGroupChannels,
  searchGroupChannels,
  fetchGroupChannel,
  deleteChannel,
  fetchMyGroupChannels,
} from '@chat/api';
import { LIST_LIMIT, OpenChannelSearchOperator, GroupChannelSearchOperator } from '@constants';
import { generateBadRequest } from '@epics/generateBadRequest';
import { selectApplication_DEPRECATED } from '@selectors';
import { fixedEncodeURIComponent } from '@utils';
import { logException } from '@utils/logException';
import {
  ALERT_CHANNEL_CREATED,
  ALERT_CHANNEL_DELETED,
  ALERT_CHANNEL_METADATA_UPDATED,
  ALERT_NOT_ALLOWED_FEATURE,
} from '@utils/text';

export const createOpenChannelEpic: SBEpicWithState<CreateOpenChannelAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.CREATE_OPEN_CHANNEL_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = createOpenChannel({
        appId,
        data: action.payload.data,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((channel) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess();
          }
          return from([
            chatActions.createOpenChannelSuccess(channel),
            commonActions.addNotificationsRequest({
              status: 'success',
              message: ALERT_CHANNEL_CREATED,
            }),
            chatActions.fetchOpenChannelsRequest({
              init: true,
            }),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.createOpenChannelFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.createOpenChannelFail(error)]);
    }),
  );
};

export const fetchMetadataEpic: SBEpicWithState<FetchMetadataAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.FETCH_METADATA_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = fetchMetadata({
        ...action.payload,
        appId,
      });
      return from(request).pipe(
        map((response) => response.data),
        mergeMap((metadata) => {
          if (action.payload.onSuccess) {
            action.payload.onSuccess(metadata);
          }
          return from([chatActions.fetchMetadataSuccess(metadata)]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.fetchMetadataFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.fetchMetadataFail(error)]);
    }),
  );
};

export const setMetdataEpic: SBEpicWithState<SetMetadataAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.SET_METADATA_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = setMetadata({
        ...action.payload,
        appId,
      });
      return from(request).pipe(
        mergeMap(({ errors }) => {
          return from([
            chatActions.setMetadataSuccess(),
            commonActions.addNotificationsRequest(
              errors.length > 0
                ? {
                    status: 'error',
                    message: 'There was a problem updating the channel metadata. Check them and try again.',
                  }
                : {
                    status: 'success',
                    message: ALERT_CHANNEL_METADATA_UPDATED,
                  },
            ),
            commonActions.hideDialogsRequest(),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error || ''), chatActions.setMetadataFail(error || '')]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.setMetadataFail(error)]);
    }),
  );
};

export const deleteChannelsEpic: SBEpicWithState<DeleteChannelsAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.DELETE_CHANNELS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const { channels, channelType } = action.payload;
      const promiseArray = channels.map((channel) => {
        return from(
          deleteChannel({
            appId,
            channelType,
            channel_url: channel.channel_url,
          }).catch((error) => {
            return generateBadRequest(error || '');
          }),
        );
      });
      return forkJoin(promiseArray).pipe(
        mergeMap((responses) => {
          const failureNotificationActions = responses.filter(
            (item) => (item as AddNotificationsAction).type === NotificationsActionTypes.ADD_NOTIFICATIONS_REQUEST,
          );
          if (failureNotificationActions.length < responses.length) {
            // some requests succeeded.
            action.payload.onSuccess?.();

            return from([
              ...failureNotificationActions,
              chatActions.deleteChannelsSuccess(),
              commonActions.addNotificationsRequest({
                status: 'success',
                message: ALERT_CHANNEL_DELETED,
              }),
              commonActions.hideDialogsRequest(),
            ]);
          }

          // all requests failed.
          return from(failureNotificationActions);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.deleteChannelsFail(error)]);
    }),
  );
};

// open channels
export const fetchOpenChannelsEpic: SBEpicWithState<FetchOpenChannelsAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.FETCH_OPEN_CHANNELS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const init = !!action.payload.init;
      const listToken = init ? '' : state.openChannels.next || '';

      const request = fetchOpenChannels({
        appId,
        listToken,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            chatActions.fetchOpenChannelsSuccess({
              channels: data.channels,
              next: data.next,
              init,
            }),
          ]);
        }),
        catchError((error) => {
          const responses: any[] = [];
          if (error.status && error.status === 400) {
            responses.push(chatActions.fetchOpenChannelsRequest({ init: true }));
          } else {
            responses.concat([generateBadRequest(error || ''), chatActions.fetchOpenChannelsFail(error || '')]);
          }
          return responses;
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(chatActions.fetchOpenChannelsFail(error));
    }),
  );
};

export const searchOpenChannelsEpic: SBEpicWithState<SearchOpenChannelsAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.SEARCH_OPEN_CHANNELS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { option, query, init } = action.payload;
      const appId = selectApplication_DEPRECATED(state).app_id;
      const listToken = init ? '' : state.openChannels.next || '';

      const getQueryOptions = ({ option, query, listToken }) => {
        const tokenAndLimit = `&token=${listToken}&limit=${LIST_LIMIT}`;

        if (option === OpenChannelSearchOperator.urlEquals) {
          return `/${fixedEncodeURIComponent(query)}`;
        }
        if (option === OpenChannelSearchOperator.nameContains) {
          return `?name_contains=${fixedEncodeURIComponent(query)}${tokenAndLimit}`;
        }
        if (option === OpenChannelSearchOperator.customTypeEquals) {
          return `?custom_type=${fixedEncodeURIComponent(query)}${tokenAndLimit}`;
        }
        return '';
      };

      const queryOptions = getQueryOptions({ option, query, listToken });

      const request = searchOpenChannels({ appId, queryOptions });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            chatActions.searchOpenChannelsSuccess({
              channels: 'channels' in data ? data.channels : [data],
              next: 'next' in data ? data.next : '',
              init,
              query,
            }),
          ]);
        }),
        catchError((error) => {
          const errorResponse: any =
            option === OpenChannelSearchOperator.urlEquals && error.data.code === 400201
              ? [
                  chatActions.searchOpenChannelsSuccess({
                    channels: [],
                    next: '',
                    init,
                    query,
                  }),
                ]
              : [generateBadRequest(error), chatActions.searchOpenChannelsFail(error)];
          return from(errorResponse);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return from([chatActions.searchOpenChannelsFail(error)]);
    }),
  );
};

export const fetchOpenChannelEpic: SBEpicWithState<FetchOpenChannelAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.FETCH_OPEN_CHANNEL_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const channel_url = action.payload;
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = fetchOpenChannel({ appId, channel_url });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([chatActions.setCurrentOpenChannel(data)]);
        }),
        catchError((error) => {
          const errorResponse: any = [generateBadRequest(error), chatActions.fetchOpenChannelFail(error)];
          if (error.data && error.data.code === 400201) {
            // channel not found
            errorResponse.push(commonActions.pushHistory(`/${appId}/open_channels`));
          }
          return from(errorResponse);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(chatActions.fetchOpenChannelFail(error));
    }),
  );
};

export const fetchGroupChannelsEpic: SBEpicWithState<FetchGroupChannelsAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.FETCH_GROUP_CHANNELS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const appId = selectApplication_DEPRECATED(state).app_id;

      const init = !!action.payload.init;
      const listToken = init ? '' : state.groupChannels.next || '';

      const request = fetchGroupChannels({
        appId,
        listToken,
        limit: LIST_LIMIT,
        showEmpty: state.groupChannels.showEmptyChannels,
      });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            chatActions.fetchGroupChannelsSuccess({
              channels: data.channels,
              next: data.next,
              init,
            }),
          ]);
        }),
        catchError((error) => {
          const responses: any[] = [];
          if (error && error.status === 400) {
            responses.concat([chatActions.fetchGroupChannelsRequest({ init: true })]);
          } else {
            responses.concat([generateBadRequest(error || ''), chatActions.fetchGroupChannelsFail(error || '')]);
          }
          return responses;
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(chatActions.fetchGroupChannelsFail(error));
    }),
  );
};

export const searchGroupChannelsEpic: SBEpicWithState<SearchGroupChannelsAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.SEARCH_GROUP_CHANNELS_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const { option, query, init } = action.payload;
      const appId = selectApplication_DEPRECATED(state).app_id;
      const listToken = init ? '' : state.groupChannels.next || '';

      const request = (() => {
        const params = { appId, listToken, limit: LIST_LIMIT, showEmpty: state.groupChannels.showEmptyChannels };
        let queryOptions = '';
        if (
          option === GroupChannelSearchOperator.userIdEquals ||
          (option === GroupChannelSearchOperator.membersIncludeIn && !query.includes(','))
        ) {
          // should use list my group channels API to avoid slow queries
          return fetchMyGroupChannels({ ...params, userId: query.trim() });
        }

        if (option === GroupChannelSearchOperator.urlEquals) {
          queryOptions = `channel_urls=${fixedEncodeURIComponent(query)}`;
        } else if (option === GroupChannelSearchOperator.nicknameEquals) {
          queryOptions = `members_nickname=${fixedEncodeURIComponent(query)}`;
        } else if (option === GroupChannelSearchOperator.customTypeEquals) {
          queryOptions = `custom_type=${fixedEncodeURIComponent(query)}`;
        } else if (option === GroupChannelSearchOperator.nameEquals) {
          queryOptions = `name=${fixedEncodeURIComponent(query)}`;
        } else if (option === GroupChannelSearchOperator.nameStartswith) {
          queryOptions = `name_startswith=${fixedEncodeURIComponent(query)}`;
        } else if (option === GroupChannelSearchOperator.membersIncludeIn) {
          const encodedUserIds = query
            .split(',')
            .map((id) => fixedEncodeURIComponent(id.trim()))
            .join(',');
          queryOptions = `members_include_in=${encodedUserIds}&query_type=AND`;
        }

        return searchGroupChannels({ ...params, queryOptions: queryOptions && `?${queryOptions}` });
      })();

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([
            chatActions.searchGroupChannelsSuccess({
              channels: data.channels,
              next: data.next,
              init,
              query,
            }),
          ]);
        }),
        catchError((error) => {
          return from([generateBadRequest(error), chatActions.searchGroupChannelsFail(error)]);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(chatActions.searchGroupChannelsFail(error));
    }),
  );
};

export const fetchGroupChannelEpic: SBEpicWithState<FetchGroupChannelAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.FETCH_GROUP_CHANNEL_REQUEST),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const channel_url = action.payload;
      const appId = selectApplication_DEPRECATED(state).app_id;

      const request = fetchGroupChannel({ appId, channel_url });

      return from(request).pipe(
        map((response) => response.data),
        mergeMap((data) => {
          return from([chatActions.setCurrentGroupChannel(data)]);
        }),
        catchError((error) => {
          const errorResponse: any = [generateBadRequest(error), chatActions.fetchGroupChannelFail(error)];
          if (error.data && error.data.code === 400201) {
            // channel not found
            errorResponse.push(commonActions.pushHistory(`/${appId}/group_channels`));
          }
          return from(errorResponse);
        }),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(chatActions.fetchGroupChannelFail(error));
    }),
  );
};

export const goToModerationEpic: SBEpicWithState<GoToModerationAction> = (action$, state$) => {
  return action$.pipe(
    ofType(ChannelsActionTypes.GO_TO_MODERATION),
    withLatestFrom(state$),
    mergeMap(([action, state]) => {
      const application = selectApplication_DEPRECATED(state);

      const { types, channelURL } = action.payload;

      const checkAvailable = () => {
        if (types === 'open_channels') {
          return application.current_premium_features.moderation_open;
        }
        if (types === 'group_channels') {
          return application.current_premium_features.moderation_group;
        }
        return false;
      };

      const errorResponses: any[] = [];
      errorResponses.push(
        commonActions.addNotificationsRequest({
          status: 'warning',
          message: ALERT_NOT_ALLOWED_FEATURE,
        }),
      );
      return iif(
        checkAvailable,
        from([commonActions.pushHistory(`/${application.app_id}/${types}/${channelURL}`)]),
        from(errorResponses),
      );
    }),
    catchError((error) => {
      logException({ error });
      return of(generateBadRequest(error));
    }),
  );
};
